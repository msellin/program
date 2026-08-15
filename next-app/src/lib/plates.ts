/**
 * Plate calculator with closest-attainable behaviour.
 *
 * Returns the plate composition PER SIDE and the actual weight the bar
 * will hold. If the exact target can't be built with available plates,
 * picks whichever is closer — under- or over-shoot.
 */

export const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
export const DEFAULT_BAR_KG = 20;

export type PlateResult = {
  plates: number[];        // plate values per side, descending
  achievedKg: number;      // actual total on the bar
  diffKg: number;          // achievedKg - target (positive = over, negative = under, 0 = exact)
  exact: boolean;
};

function greedyUnder(target: number, plates: number[]): { plates: number[]; sum: number } {
  let remaining = target;
  const out: number[] = [];
  for (const p of plates) {
    while (remaining >= p - 1e-6) {
      out.push(p);
      remaining -= p;
    }
  }
  return { plates: out, sum: out.reduce((a, b) => a + b, 0) };
}

/**
 * Compute the plate loadout for a target weight. If the target is not
 * exactly buildable, returns whichever attempt is closer.
 */
export function loadFor(
  targetKg: number,
  barKg: number = DEFAULT_BAR_KG,
  plates: number[] = STANDARD_PLATES_KG,
): PlateResult {
  if (!isFinite(targetKg) || targetKg <= 0) {
    return { plates: [], achievedKg: 0, diffKg: -targetKg, exact: false };
  }
  if (targetKg <= barKg) {
    return { plates: [], achievedKg: barKg, diffKg: barKg - targetKg, exact: Math.abs(barKg - targetKg) < 1e-6 };
  }
  const perSide = (targetKg - barKg) / 2;
  const under = greedyUnder(perSide, plates);
  const underKg = barKg + under.sum * 2;
  const underDiff = underKg - targetKg;
  if (Math.abs(underDiff) < 1e-6) {
    return { plates: under.plates, achievedKg: underKg, diffKg: 0, exact: true };
  }
  // Try the smallest overshoot: greedyUnder result plus one smallest-plate increment
  const smallest = plates[plates.length - 1];
  const over = { plates: [...under.plates, smallest], sum: under.sum + smallest };
  const overKg = barKg + over.sum * 2;
  const overDiff = overKg - targetKg;
  if (Math.abs(overDiff) < Math.abs(underDiff)) {
    return { plates: over.plates, achievedKg: overKg, diffKg: overDiff, exact: false };
  }
  return { plates: under.plates, achievedKg: underKg, diffKg: underDiff, exact: false };
}

/** Convenience: string label for the plate loadout. */
export function platesLabel(targetKg: number, barKg: number = DEFAULT_BAR_KG): string {
  const r = loadFor(targetKg, barKg);
  if (!r.plates.length) {
    if (Math.abs(r.diffKg) < 1e-6) return `bar only (${barKg} kg)`;
    return `bar only (${barKg} kg, ${r.diffKg > 0 ? "over" : "under"} target)`;
  }
  const per = r.plates.join(" + ");
  if (r.exact) return `${per} kg /side`;
  const label = r.diffKg > 0 ? `${r.achievedKg} kg (+${r.diffKg.toFixed(2)})` : `${r.achievedKg} kg (${r.diffKg.toFixed(2)})`;
  return `${per} kg /side → ${label}`;
}
