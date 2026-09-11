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
 * This does not prove the bindings are SET — nothing in the repo can. It
 * proves the list a human would check against is still the right list.
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
