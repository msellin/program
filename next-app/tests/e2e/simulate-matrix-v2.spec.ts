import { test } from "./fixtures";
import { runSimulationV2 } from "./harness/simulator-v2";
import { ARCHETYPES } from "./harness/archetype";
import * as fs from "node:fs";
import * as path from "node:path";

const SIM_ROOT = "tests/e2e/screenshots/matrix-v2";
const START_DATE = "2026-08-12";
const DAYS = 90;

const MATRIX: Array<{ archetype: keyof typeof ARCHETYPES; program: string; tier?: string }> = [
  { archetype: "consistent-average", program: "anterior-hip-rebuild" },
  { archetype: "overperformer", program: "anterior-hip-rebuild" },
  { archetype: "underperformer", program: "anterior-hip-rebuild" },
  { archetype: "erratic", program: "anterior-hip-rebuild" },
  { archetype: "injured-recovery", program: "anterior-hip-rebuild" },
];

test.describe.configure({ mode: "serial" });

for (const { archetype, program, tier } of MATRIX) {
  const label = `v2 · ${archetype} × ${program}${tier ? ` @ ${tier}` : ""}`;
  test(label, async ({ authedPage: page }) => {
    test.setTimeout(240_000);
    const dir = path.join(SIM_ROOT, `${archetype}_${program}${tier ? "_" + tier : ""}`);
    fs.mkdirSync(dir, { recursive: true });

    const result = await runSimulationV2(page, {
      archetype: ARCHETYPES[archetype],
      programSlug: program,
      tier,
      startDate: START_DATE,
      days: DAYS,
      snapshotDays: [0, 30, 60, 90],
      screenshotDir: dir,
    });

    const finalStore = result.finalStore as {
      logs?: Record<string, unknown>;
      skipped?: Record<string, unknown>;
      day_adjustments?: Record<string, unknown>;
      dismissed_proposals?: Record<string, unknown>;
      training_maxes?: Record<string, number>;
    };

    fs.writeFileSync(
      path.join(dir, "result.json"),
      JSON.stringify(
        {
          archetypeId: result.archetypeId,
          programSlug: result.programSlug,
          daysSimulated: result.daysSimulated,
          summary: {
            logs_count: Object.keys(finalStore.logs ?? {}).length,
            skipped_count: Object.keys(finalStore.skipped ?? {}).length,
            day_adjustments_count: Object.keys(finalStore.day_adjustments ?? {}).length,
            training_maxes: finalStore.training_maxes ?? {},
          },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(path.join(dir, "final-store.json"), JSON.stringify(result.finalStore, null, 2));
  });
}
