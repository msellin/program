import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Runtime Pages bindings must stay documented (added 2026-09-11).
 *
 * There are two kinds of secret in this project and only one of them was
 * written down. `NEXT_PUBLIC_*` is inlined at build time, and CI greps the
 * built artifact for it — that is gate 2 of the deploy pipeline, and it exists
 * because a Sentry DSN was once verified against a local `out/` directory and
 * reported as live while production had never received the build.
 *
 * Everything under `functions/` is different. Those read `env.*` at REQUEST
 * time from Cloudflare Pages project bindings. They are not in the artifact,
 * so the artifact grep cannot see them, so all three deploy gates pass green
 * with every one of them missing. None of the five was documented anywhere.
 *
 * The sharp one is `SUPABASE_SERVICE_ROLE_KEY`. Without it,
 * `DELETE /api/delete-account` returns 500 and account deletion — a GDPR
 * obligation on Article 9 health data — does not happen. It fails safe: the
 * check runs after auth and before anything destructive, so nobody is left
 * half-deleted. But it fails silently from outside, and the endpoint cannot be
 * verified end-to-end without a real user session, which means the only
 * defence available is knowing the binding has to be there.
 *
 * This file proves the list a human would check against is still the right
 * list. It does NOT prove the bindings are set — the sentence that used to sit
 * here said nothing in the repo ever could, and that was wrong for as long as
 * it was written. `wrangler pages secret list` reports binding NAMES with a
 * token the deploy workflow already holds, so gate 4
 * (`dev/scripts/check-runtime-bindings.sh`) now asserts existence against the
 * live project before every deploy. The tests below guard that gate: a check
 * that can be quietly dropped from the workflow is not a gate.
 */
const FUNCTIONS = path.resolve(process.cwd(), "functions");
const CLAUDE_MD = path.resolve(process.cwd(), "..", "CLAUDE.md");

function envVarsRead(dir: string, found = new Set<string>()): Set<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      envVarsRead(full, found);
      continue;
    }
    if (!/\.tsx?$/.test(e.name)) continue;
    const src = fs.readFileSync(full, "utf8");
    for (const m of src.matchAll(/\benv\.([A-Z_][A-Z0-9_]*)/g)) found.add(m[1]);
  }
  return found;
}

describe("every runtime Pages binding is documented", () => {
  it("CLAUDE.md names each env var the functions read", () => {
    if (!fs.existsSync(FUNCTIONS) || !fs.existsSync(CLAUDE_MD)) return;

    const read = [...envVarsRead(FUNCTIONS)].sort();
    expect(read.length, "no functions read env — did the directory move?").toBeGreaterThan(0);

    // Scoped to the runtime paragraph, not the whole file. A build-time var
    // listed elsewhere must not vouch for a runtime binding: they are
    // configured in different systems, and that difference is the whole point.
    const doc = fs.readFileSync(CLAUDE_MD, "utf8");
    const start = doc.indexOf("**Runtime — Cloudflare Pages project bindings.**");
    expect(start, "the runtime-bindings paragraph is gone").toBeGreaterThan(-1);
    const para = doc.slice(start, doc.indexOf("\n\n", start + 1) + 200);

    const undocumented = read.filter((v) => !para.includes(v));
    expect(
      undocumented,
      "runtime binding read by a Pages function but not documented — CI cannot " +
        "see these, so an undocumented one ships green and fails on first use",
    ).toEqual([]);
  });

  it("the delete endpoint still fails safe on a missing service role", () => {
    // The property that makes a missing binding survivable: the config check
    // must come AFTER identity is established and BEFORE anything is removed.
    // If deletion ever moves ahead of it, a misconfigured project could strip
    // rows and leave the auth user, or the reverse.
    const src = fs.readFileSync(path.join(FUNCTIONS, "api", "delete-account.ts"), "utf8");
    const guard = src.indexOf("SUPABASE_SERVICE_ROLE_KEY");
    const destructive = src.indexOf("method: \"DELETE\"");
    expect(guard).toBeGreaterThan(-1);
    expect(destructive).toBeGreaterThan(-1);
    expect(
      guard < destructive,
      "the service-role check must precede the admin delete call",
    ).toBe(true);
  });
});

/**
 * Gate 4 is a shell script referenced from a YAML file. Nothing else in the
 * suite would notice if either end went away, which is the same shape of
 * failure as the lint step that was never wired: present in the repo, absent
 * from the pipeline, believed to be running.
 */
const WORKFLOW = path.resolve(process.cwd(), "..", ".github", "workflows", "deploy.yml");
const GATE = path.resolve(process.cwd(), "..", "dev", "scripts", "check-runtime-bindings.sh");

describe("gate 4 - runtime bindings are asserted before deploy", () => {
  it("the gate script exists and is executable", () => {
    expect(fs.existsSync(GATE), "check-runtime-bindings.sh is gone").toBe(true);
    expect((fs.statSync(GATE).mode & 0o111) !== 0, "gate script is not executable").toBe(true);
  });

  it("derives its expected list rather than hardcoding one", () => {
    const src = fs.readFileSync(GATE, "utf8");
    // The whole point: a binding added to a function is covered on the same
    // commit. A literal list here would drift the first time someone forgot.
    expect(
      src.includes("grep -rhoE") && src.includes("functions"),
      "the gate must scan functions/ for env reads, not carry a typed list",
    ).toBe(true);
    for (const v of envVarsRead(FUNCTIONS)) {
      expect(
        src.includes(`"${v}"`) || src.includes(`'${v}'`) || src.includes(` ${v} `),
        `gate script hardcodes ${v} - the list must be derived`,
      ).toBe(false);
    }
  });

  it("CI runs the gate, and runs it before the deploy", () => {
    if (!fs.existsSync(WORKFLOW)) return;
    const yml = fs.readFileSync(WORKFLOW, "utf8");
    // Comments stripped first. Every guard in this repo that matched raw text
    // has at some point been satisfied by its own explanatory comment.
    const code = yml
      .split("\n")
      .filter((l) => !l.trim().startsWith("#"))
      .join("\n");

    const gate = code.indexOf("check-runtime-bindings.sh");
    expect(gate, "gate 4 is not referenced by the deploy workflow").toBeGreaterThan(-1);

    const deploy = code.indexOf("wrangler@4 pages deploy");
    expect(deploy, "the deploy step moved - this guard needs rewriting").toBeGreaterThan(-1);
    expect(
      gate < deploy,
      "gate 4 must run BEFORE the deploy: a build that would 500 on first " +
        "use should not replace a working one",
    ).toBe(true);
  });
});
