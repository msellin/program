import type { Program } from "../schemas";

/**
 * Tier inference from intake answers.
 *
 * plan_tiers[].condition is a string expression that references physical_test
 * IDs (e.g. "wall_hold_max_seconds >= 15 && freestand_hold_max_seconds < 5").
 * We collect a map of variable name → number from three sources, in priority
 * order:
 *   1. Physical test results (numeric — most accurate)
 *   2. Self-report answers mapped to representative numbers via a per-program
 *      answer→value table declared inline here
 *   3. Zero (safe default — biases user to the lower / more conservative tier)
 *
 * Then we evaluate every tier's condition and pick the highest-priority match
 * (last-defined wins — programs list tiers in ascending order).
 */

// Supported: numbers, single-quoted strings, identifiers, comparison ops
// (>=, <=, >, <, ==, !=), logical ops (&&, ||), unary `!`, parens.
// String literals support ==/!= for enum comparisons like
// `muscle_up_experience == 'never'`. Added 2026-08-18 after Vector A audit
// found muscle-up + engine-builder-block-2 shipping string-quoted tier
// conditions that were silently unreachable.
type Token =
  | { type: "num"; value: number }
  | { type: "str"; value: string }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(expr: string): Token[] | null {
  const out: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === " " || c === "\t" || c === "\n") {
      i++;
      continue;
    }
    if (c === "(") {
      out.push({ type: "lparen" });
      i++;
      continue;
    }
    if (c === ")") {
      out.push({ type: "rparen" });
      i++;
      continue;
    }
    if (c === "&" && expr[i + 1] === "&") {
      out.push({ type: "op", value: "&&" });
      i += 2;
      continue;
    }
    if (c === "|" && expr[i + 1] === "|") {
      out.push({ type: "op", value: "||" });
      i += 2;
      continue;
    }
    if ((c === ">" || c === "<" || c === "=" || c === "!") && expr[i + 1] === "=") {
      out.push({ type: "op", value: c + "=" });
      i += 2;
      continue;
    }
    if (c === ">" || c === "<") {
      out.push({ type: "op", value: c });
      i++;
      continue;
    }
    if (c === "!") {
      // Unary NOT — Engine Builder uses `!can_sustain_20min_easy`.
      out.push({ type: "op", value: "!" });
      i++;
      continue;
    }
    if (c === "'" || c === "\"") {
      // Single- or double-quoted string literal. No escape sequences; enum
      // values are simple identifiers like 'never', 'yes_recent'.
      const quote = c;
      let j = i + 1;
      while (j < expr.length && expr[j] !== quote) j++;
      if (j >= expr.length) return null; // unterminated string
      out.push({ type: "str", value: expr.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      const n = Number(expr.slice(i, j));
      if (!isFinite(n)) return null;
      out.push({ type: "num", value: n });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      out.push({ type: "ident", value: expr.slice(i, j) });
      i = j;
      continue;
    }
    return null; // unrecognized character
  }
  return out;
}

// Recursive-descent parser: expr := or; or := and (|| and)*; and := cmp (&& cmp)*;
// cmp := term (op term)?; term := num | str | ident | (expr)
type VarValue = number | string;
function evalTokens(tokens: Token[], vars: Record<string, VarValue>): boolean {
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (matcher: (t: Token) => boolean) => {
    const t = tokens[pos];
    if (t && matcher(t)) {
      pos++;
      return t;
    }
    return null;
  };

  function parseTerm(): number | boolean | string {
    const t = peek();
    if (!t) return 0;
    if (t.type === "lparen") {
      pos++;
      const v = parseOr();
      eat((x) => x.type === "rparen");
      return v;
    }
    if (t.type === "num") {
      pos++;
      return t.value;
    }
    if (t.type === "str") {
      pos++;
      return t.value;
    }
    if (t.type === "ident") {
      pos++;
      // Boolean literals as term operands — needed for `has_squat_prs == true`
      // where the right-hand side would otherwise resolve as an unknown var
      // → 0, silently matching a `has_squat_prs = 0` answer.
      if (t.value === "true") return 1;
      if (t.value === "false") return 0;
      return vars[t.value] ?? 0;
    }
    return 0;
  }

  function parseCmp(): boolean {
    // Unary NOT — recurse into a fresh cmp so `!ident && other` parses right.
    if (peek()?.type === "op" && (peek() as { value: string }).value === "!") {
      pos++;
      return !parseCmp();
    }
    // `true` / `false` literal identifiers (Zod-typed boolean answers land here).
    const start = pos;
    const maybeBoolLit = peek();
    if (maybeBoolLit?.type === "ident" && (maybeBoolLit.value === "true" || maybeBoolLit.value === "false")) {
      pos++;
      const t2 = peek();
      const isCmp =
        t2?.type === "op" &&
        ([">", "<", ">=", "<=", "==", "!="] as string[]).includes(t2.value);
      if (!isCmp) return maybeBoolLit.value === "true";
      // Rewind so the identifier is parsed as a term below.
      pos = start;
    }
    const left = parseTerm();
    const t = peek();
    if (
      t?.type === "op" &&
      ([">", "<", ">=", "<=", "==", "!="] as string[]).includes(t.value)
    ) {
      pos++;
      const right = parseTerm();
      // String equality: compare directly. Enum tier conditions like
      // `muscle_up_experience == 'never'` land here.
      if (typeof left === "string" || typeof right === "string") {
        const ls = typeof left === "boolean" ? (left ? "true" : "false") : String(left);
        const rs = typeof right === "boolean" ? (right ? "true" : "false") : String(right);
        if (t.value === "==") return ls === rs;
        if (t.value === "!=") return ls !== rs;
        // Ordering ops on strings are not meaningful — treat as false.
        return false;
      }
      const l = typeof left === "boolean" ? (left ? 1 : 0) : left;
      const r = typeof right === "boolean" ? (right ? 1 : 0) : right;
      switch (t.value) {
        case ">":
          return l > r;
        case "<":
          return l < r;
        case ">=":
          return l >= r;
        case "<=":
          return l <= r;
        case "==":
          return l === r;
        case "!=":
          return l !== r;
      }
    }
    // No comparison: coerce term to boolean (truthy number / non-empty string)
    if (typeof left === "boolean") return left;
    if (typeof left === "string") return left.length > 0;
    return left !== 0;
  }

  function parseAnd(): boolean {
    let acc = parseCmp();
    while (peek()?.type === "op" && (peek() as { value: string }).value === "&&") {
      pos++;
      const right = parseCmp();
      acc = acc && right;
    }
    return acc;
  }

  function parseOr(): boolean {
    let acc = parseAnd();
    while (peek()?.type === "op" && (peek() as { value: string }).value === "||") {
      pos++;
      const right = parseAnd();
      acc = acc || right;
    }
    return acc;
  }

  return parseOr();
}

export function evaluateCondition(
  condition: string,
  vars: Record<string, VarValue>,
): boolean {
  const tokens = tokenize(condition);
  if (!tokens) return false;
  try {
    return evalTokens(tokens, vars);
  } catch {
    return false;
  }
}

/**
 * Per-program mapping of self-report answer values → representative numeric
 * values for the physical_test variables the tier conditions reference.
 *
 * When we ship a new multi-dim program, add its entry here. Physical test IDs
 * on the left are the variable names used in plan_tiers[].condition; each
 * option value maps to the number we'll use to evaluate that condition.
 */
const SELF_REPORT_TO_NUMERIC: Record<
  string,
  Record<string, Record<string, number>>
> = {
  "handstand-walk": {
    wall_hold_seconds_selfreport: {
      never: 0,
      under_15s: 8,
      "15_30s": 22,
      "30_60s": 45,
      over_60s: 90,
    },
    freestand_hold_seconds_selfreport: {
      never: 0,
      brief: 1,
      "2_5s": 3,
      "5_15s": 10,
      "15_30s": 22,
      over_30s: 45,
    },
    walk_distance_selfreport: {
      never: 0,
      few_steps: 2,
      "5m_plus": 7,
      "10m_plus": 12,
      "20m_plus": 25,
    },
  },
  "concurrent-strength-maintenance": {
    cardio_hours_per_week: {
      under_1: 0.5,
      "1_3": 2,
      "3_6": 4.5,
      over_6: 7,
    },
  },
  "rowing-2k-test-prep": {
    // Enum values MUST match the JSON's option list exactly. Seconds are
    // midpoints for the range (Push tier uses <480 as gate, Progression
    // 480-540, Foundation ≥540). Under 7:00 = 400s. 7-8 = 450s. 8-9 = 510s.
    // 9-10 = 570s. Over 10 = 630s (baseline unknown).
    current_2k_time: {
      sub_7: 400,
      "7_8": 450,
      "8_9": 510,
      "9_10": 570,
      over_10: 630,
    },
    erg_familiar: { yes: 1, no: 0 },
  },
};

/**
 * Which physical_test variable a given self-report question stands in for.
 * When the user does the physical test, its numeric value overrides the
 * self-report proxy.
 */
const SELF_REPORT_TO_TEST_VAR: Record<string, Record<string, string>> = {
  "handstand-walk": {
    wall_hold_seconds_selfreport: "wall_hold_max_seconds",
    freestand_hold_seconds_selfreport: "freestand_hold_max_seconds",
    walk_distance_selfreport: "walk_distance_max_metres",
  },
  "rowing-2k-test-prep": {
    // Rowing tier conditions read `current_2k_seconds`. The intake question
    // is `current_2k_time`. Map answer → seconds via SELF_REPORT_TO_NUMERIC
    // and bind to the variable name the conditions actually check.
    current_2k_time: "current_2k_seconds",
  },
};

export type InferredTier = {
  tier_id: string;
  tier_label: string;
  rationale: string;
  vars: Record<string, VarValue>;
};

export function inferTier(
  program: Program,
  programSlug: string,
  answers: Record<string, string>,
  physicalTestResults: Record<string, number>,
): InferredTier | null {
  const tiers = program.plan_tiers;
  if (!tiers?.length) return null;

  const selfMap = SELF_REPORT_TO_NUMERIC[programSlug] ?? {};
  const testVarMap = SELF_REPORT_TO_TEST_VAR[programSlug] ?? {};

  // Build variable map. Priority order per variable:
  //   1. Explicit physical_test result
  //   2. Numeric answer parsed directly (for `type: number` questions)
  //   3. Boolean answer coerced to 1/0 (for `type: boolean` questions)
  //   4. Per-program self-report proxy map (for `type: select` enum answers)
  //   5. Raw string answer (for `type: select` enums compared to a string
  //      literal in a tier condition, e.g. `muscle_up_experience == 'never'`)
  const vars: Record<string, VarValue> = { ...physicalTestResults };
  for (const [qid, ans] of Object.entries(answers)) {
    // 4-then-2 self-report proxy path first — it targets a *different* variable
    // (the physical_test_var) so it doesn't collide with 2/3.
    const testVar = testVarMap[qid];
    if (testVar && vars[testVar] == null) {
      // Parse mm:ss format text answers (e.g. "7:52" for rowing 2K time) into
      // total seconds. Preferred over enum midpoints for tier accuracy.
      const mmss = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(ans);
      if (mmss) {
        const mins = Number(mmss[1]);
        const secs = Number(mmss[2]);
        if (Number.isFinite(mins) && Number.isFinite(secs) && secs < 60) {
          vars[testVar] = mins * 60 + secs;
        }
      }
      if (vars[testVar] == null) {
        const proxy = selfMap[qid]?.[ans];
        if (typeof proxy === "number") vars[testVar] = proxy;
      }
      // Handle "never" / "never tested" — treat as Foundation-tier baseline.
      if (vars[testVar] == null && /never/i.test(ans)) {
        vars[testVar] = 630;
      }
    }

    // Direct binding of the question id → number when the answer is numeric.
    if (vars[qid] == null) {
      const asNum = Number(ans);
      if (Number.isFinite(asNum) && ans !== "" && ans != null) {
        vars[qid] = asNum;
        continue;
      }
    }

    // Boolean coercion — tier conditions read `!can_sustain_20min_easy` or
    // `has_squat_prs == true`, so the ident needs to resolve to 1/0.
    if (vars[qid] == null) {
      const lower = String(ans).toLowerCase();
      if (lower === "true" || lower === "yes") {
        vars[qid] = 1;
        continue;
      }
      if (lower === "false" || lower === "no") {
        vars[qid] = 0;
        continue;
      }
    }

    // Per-program enum map targeting the question id directly (not a
    // physical_test_var). E.g. CSM's `cardio_hours_per_week` select answers.
    if (vars[qid] == null) {
      const direct = selfMap[qid]?.[ans];
      if (typeof direct === "number") vars[qid] = direct;
    }

    // Fallback: raw string answer. Unblocks tier conditions that compare
    // against a string literal directly, e.g.
    // `muscle_up_experience == 'never'`. Without this the enum answer
    // stayed unset and the tier silently defaulted. Added 2026-08-18 after
    // Vector A audit found two programs (muscle-up, engine-builder-block-2)
    // shipping unreachable tiers because of this.
    if (vars[qid] == null && ans != null && ans !== "") {
      vars[qid] = String(ans);
    }
  }

  // Walk tiers in program order; the last one whose condition matches wins.
  // (Programs list tiers ascending, so this picks the highest tier the user
  // qualifies for.)
  let matched: InferredTier | null = null;
  for (const t of tiers) {
    if (evaluateCondition(t.condition, vars)) {
      matched = {
        tier_id: t.id,
        tier_label: t.label,
        rationale: t.condition,
        vars,
      };
    }
  }

  // No tier matched — default to the first (most conservative). Better than
  // failing silently.
  if (!matched) {
    const t = tiers[0];
    matched = {
      tier_id: t.id,
      tier_label: t.label,
      rationale: "No tier matched — defaulted to lowest",
      vars,
    };
  }
  return matched;
}
