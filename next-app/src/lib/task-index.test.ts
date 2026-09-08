import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
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
    expect(
      failed,
      `${out.trim()}\n\nA workstream was added or its tasks changed without ` +
        "regenerating the index. Run: python3 dev/scripts/task-index.py",
    ).toBe(false);
    expect(out).toContain("already current");
  });
});
