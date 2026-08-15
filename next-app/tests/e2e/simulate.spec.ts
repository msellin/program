import { test, expect } from "./fixtures";
import { runSimulation } from "./harness/simulator";
import { ARCHETYPES } from "./harness/archetype";
import * as fs from "node:fs";
import * as path from "node:path";

const SIM_ROOT = "tests/e2e/screenshots/simulate";

test.describe("6-month user simulation", () => {
  // Quick proof-of-concept: one archetype × one program, 30 days.
  test("SMOKE — overperformer × anterior-hip-rebuild × 30 days", async ({ authedPage: page }) => {
    const dir = path.join(SIM_ROOT, "overperformer-anterior-hip-30d");
    fs.mkdirSync(dir, { recursive: true });

    const result = await runSimulation(page, {
      archetype: ARCHETYPES.overperformer,
      programSlug: "anterior-hip-rebuild",
      startDate: "2026-08-12",
      days: 30,
      snapshotDays: [0, 7, 14, 21, 30],
      screenshotDir: dir,
    });

    fs.writeFileSync(
      path.join(dir, "result.json"),
      JSON.stringify(
        {
          archetypeId: result.archetypeId,
          programSlug: result.programSlug,
          daysSimulated: result.daysSimulated,
          snapshotCount: result.snapshots.length,
          finalLogsCount: Object.keys((result.finalStore as { logs?: Record<string, unknown> })?.logs ?? {}).length,
        },
        null,
        2,
      ),
    );

    // Sanity: we should have some logs after 30 sim days.
    const finalStore = result.finalStore as { logs?: Record<string, unknown> };
    expect(Object.keys(finalStore.logs ?? {}).length).toBeGreaterThan(15);
  });
});
