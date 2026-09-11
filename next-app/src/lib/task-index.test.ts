import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");

/**
 * Every workstream appears in the index.
 *
 * On 2026-09-08 the founder asked what the full task list was. Three files were
 * each behaving as the answer: `OPEN-TASKS.md`, whose own header claimed it
 * superseded the handovers; `2026-08-19-master-task-list.md`, recorded
 * elsewhere as THE task file; and `video-analysis/tasks.md`, a 56-item feature
 * plan with a passed GO/NO-GO that neither of the others mentioned.
 *
 * The cost was not abstract. Asked whether video analysis was planned, I read
 * the register, searched too narrowly, and told him it was not in the pipeline
 * — twice. It was: six documents and two rounds of expert review.
 *
 * A hand-maintained index drifts back within a fortnight, so it is generated
 * and this fails when it is stale. Same shape as the reviewer-packet check: the
 * document is derived, so let the suite own whether it is current.
 */
describe("the task index covers every workstream", () => {
  it("is not stale", () => {
    let out = "";
    let failed = false;
    try {
      out = execFileSync("python3", ["dev/scripts/task-index.py", "--check"], {
        cwd: ROOT,
        encoding: "utf8",
      });
    } catch (e) {
      failed = true;
      out = String((e as { stdout?: string }).stdout ?? e);
    }
    /**
     * The shallow-clone case gets its own message, because the generic one
     * sent three CI runs chasing the wrong thing.
     *
     * The index stamps each workstream with its own last-commit date. Under a
     * depth-1 checkout the runner holds one parentless commit, so
     * `git log -1 -- <path>` returns it for EVERY tracked file and all sixteen
     * dates come back as HEAD's. The index then differs from the committed one
     * no matter how recently anyone regenerated it, and the old message —
     * "a workstream was added or its tasks changed" — was false every time it
     * was printed. Someone reading it regenerates an already-current index,
     * sees no diff, and learns nothing.
     */
    const shallow = fs.existsSync(path.join(ROOT, ".git", "shallow"));
    expect(
      failed,
      shallow
        ? `${out.trim()}\n\nThis clone is SHALLOW, and that alone makes the ` +
          "index unreproducible: every workstream's date collapses to HEAD's. " +
          "The index is probably fine. Fetch full history " +
          "(actions/checkout with fetch-depth: 0) rather than regenerating."
        : `${out.trim()}\n\nA workstream was added or its tasks changed without ` +
          "regenerating the index. Run: python3 dev/scripts/task-index.py",
    ).toBe(false);
    expect(out).toContain("already current");
  });
});

/**
 * The workflow must keep fetching full history (added 2026-09-11).
 *
 * The test above cannot defend itself: it runs inside the very checkout whose
 * depth is the problem, and a shallow one makes it fail for a reason that has
 * nothing to do with the index. Deleting `fetch-depth: 0` would put CI back to
 * failing on every push, and the message it printed then sent people to
 * regenerate a file that was already correct.
 */
describe("CI fetches enough history for the index to be reproducible", () => {
  it("the verify job checks out with fetch-depth: 0", () => {
    const wf = path.join(ROOT, ".github", "workflows", "deploy.yml");
    if (!fs.existsSync(wf)) return;

    const src = fs.readFileSync(wf, "utf8");

    // Bounded to the verify job itself. The first version of this ended the
    // slice at `"  build:"`, a job that does not exist — `indexOf` returned -1,
    // the slice ran to end-of-file, and the assertion would have been satisfied
    // by the `fetch-depth` of ANY later job. Precise here, because a guard that
    // passes on the wrong evidence is how the thing it guards comes back.
    const jobs = [...src.matchAll(/^ {2}[a-z][a-z0-9_-]*:$/gm)].map((m) => m.index!);
    const start = src.indexOf("\n  verify:") + 1;
    const end = jobs.find((i) => i > start) ?? src.length;
    const verify = src.slice(start, end);
    // The `- uses:` line, not any prose mention of it — the comment directly
    // above that step explains the fix and names both the action and the
    // setting, so a looser match could be satisfied by the explanation of the
    // bug instead of the fix for it.
    const checkout = verify.indexOf("- uses: actions/checkout");

    expect(checkout, "verify job must check the repo out").toBeGreaterThan(-1);
    expect(
      verify.slice(checkout, checkout + 200),
      "verify's checkout needs `fetch-depth: 0` or the task-index guard fails on every push",
    ).toContain("fetch-depth: 0");
  });
});
