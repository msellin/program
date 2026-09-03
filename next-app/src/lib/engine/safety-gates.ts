/**
 * Intake screening — the one place a program's `safety_gates` are evaluated.
 *
 * Why a second severity exists
 * ----------------------------
 * A gate could only ever hard-block. So an author facing "does anything hurt
 * in the last 30 degrees of overhead reach?" had two options: refuse everyone
 * who answers yes, or do nothing with the answer. They did nothing — and
 * seven of eight shipped programs have at least one question whose risky
 * answer reaches no gate at all. Five let `hypertension_unmanaged: "unsure"`
 * through; `overhead-mobility` asks about painful end-range flexion, marks it
 * required, and enrols the user in an end-range-flexion program regardless.
 *
 * That was not carelessness. It was a missing tier: for most of these
 * questions a block is too blunt and silence is too permissive, and the
 * schema offered nothing in between. `severity: "warn"` is that middle —
 * the user is told what their answer means, has to acknowledge it explicitly,
 * and the acknowledgement is recorded.
 *
 * What this module does NOT decide
 * --------------------------------
 * Which gate gets which severity. That is a clinical judgement on a
 * health-adjacent product and belongs to whoever authors the program, the
 * same split as `symptom-regions.ts`: a program declares WHAT it screens for,
 * it does not get to redefine how screening behaves. Every gate without an
 * explicit severity keeps blocking, so this change cannot quietly downgrade
 * an existing refusal.
 */

export type GateSeverity = "block" | "warn";

export type SafetyGate = {
  question_id: string;
  unsafe_values: string[];
  block_title: string;
  block_body: string;
  severity?: GateSeverity;
  /** Warn-only. What the user is ticking. Falls back to a generic sentence. */
  acknowledge_label?: string;
};

export type GateNotice = {
  question_id: string;
  title: string;
  body: string;
  acknowledge_label: string;
};

export type GateEvaluation = {
  /** First blocking gate hit, or null. Blocks are fatal, so one is enough. */
  blocker: { question_id: string; title: string; body: string } | null;
  /** Every warn-severity gate hit. All must be acknowledged to proceed. */
  warnings: GateNotice[];
};

const DEFAULT_ACK = "I understand, and I'm choosing to continue.";

/** Severity defaults to "block" — silence must never loosen a gate. */
export function severityOf(gate: SafetyGate): GateSeverity {
  return gate.severity === "warn" ? "warn" : "block";
}

/**
 * Evaluate a program's gates against the answers given so far.
 *
 * A blocking gate short-circuits: once a program has refused someone, the
 * advisory notices below it are noise. Warnings accumulate, because a user
 * can trip more than one and each is a separate thing to acknowledge.
 */
export function evaluateSafetyGates(
  gates: SafetyGate[] | undefined,
  answers: Record<string, string | undefined>,
): GateEvaluation {
  const warnings: GateNotice[] = [];
  for (const gate of gates ?? []) {
    const answer = answers[gate.question_id];
    if (!answer || !gate.unsafe_values.includes(answer)) continue;
    if (severityOf(gate) === "block") {
      return {
        blocker: {
          question_id: gate.question_id,
          title: gate.block_title,
          body: gate.block_body,
        },
        warnings: [],
      };
    }
    warnings.push({
      question_id: gate.question_id,
      title: gate.block_title,
      body: gate.block_body,
      acknowledge_label: gate.acknowledge_label ?? DEFAULT_ACK,
    });
  }
  return { blocker: null, warnings };
}

/**
 * Whether every raised warning has been ticked. An unacknowledged warning
 * holds the intake exactly as a missing required consent does — the point of
 * the tier is an explicit decision, not a banner someone scrolls past.
 */
export function warningsAcknowledged(
  warnings: GateNotice[],
  acknowledged: Record<string, boolean | undefined>,
): boolean {
  return warnings.every((w) => acknowledged[w.question_id] === true);
}

/**
 * The acknowledgements to persist with the intake, keyed by question id.
 * Recorded so that a user who continued past a warning is auditable later —
 * "they were told and said yes" is a different fact from "nobody asked", and
 * after the fact the two are otherwise indistinguishable.
 */
export function acknowledgementsToPersist(
  warnings: GateNotice[],
  acknowledged: Record<string, boolean | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const w of warnings) {
    if (acknowledged[w.question_id] === true) out[`safety_ack.${w.question_id}`] = "true";
  }
  return out;
}
