import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");

/**
 * QA-1 — "shipped" and "archived" are not the same word.
 *
 * On 2026-08-18 a batch's Shipped section claimed eleven fixes. A rerun found
 * at least three only partially executed: the plan was archived as complete
 * while the shipped JSON still said otherwise. The ask was a verification step
 * rather than a convention.
 *
 * This is the machine-checkable half. It does not verify a fix is CORRECT —
 * that needs a reader, and the data-integrity guards cover the specific cases
 * we have been bitten by. It verifies the one thing free to check: a line
 * marked `- [x]` that names a source file should name a file that exists.
 *
 * It already pays for itself. `saas-launch/tasks.md` ticks
 * `functions/api/state.ts`, `middleware.ts` and `src/lib/sync.ts` as done, and
 * none of the three exists — they belong to the Clerk-and-KV design that was
 * replaced by Supabase and Postgres. Three "done" items describing an
 * architecture the project does not have.
 *
 * The policy half — whether a batch may be archived without a proof line — is
 * a founder call and is not what this asserts.
 */
describe("done items name files that exist", () => {
  it("no NEW unresolvable claim, and no stale baseline entry", () => {
    let out = "";
    let failed = false;
    try {
      out = execFileSync(
        "python3",
        ["dev/scripts/verify-shipped-claims.py", "--check"],
        { cwd: ROOT, encoding: "utf8" },
      );
    } catch (e) {
      failed = true;
      out = String((e as { stdout?: string }).stdout ?? e);
    }
    expect(
      failed,
      `${out.trim()}\n\nEither a DONE line names a file that was never written, ` +
        "or a baselined claim resolves now and should be delisted from " +
        "dev/scripts/verify-shipped-claims.py.",
    ).toBe(false);
    expect(out).toContain("OK");
  });
});
