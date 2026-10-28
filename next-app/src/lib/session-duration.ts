/**
 * One honest session-length rule, shared by every screen that states one.
 *
 * Before this, the brief summed the UPPER bound of each block ("about 32 min"),
 * Today's hero did the same with its own copy, the quick-start plan screen
 * showed a hand-typed tier number (15) and the program page showed a
 * hand-typed range (15–30) — four numbers for one session.
 *
 * Rule: sum the authored `duration_min` of every REQUIRED block (a block's own
 * duration, else the sum of its segments). A range stays a range — the lower
 * ends add to the lower end, the upper to the upper. Blocks marked
 * `optional: true` are left out. Returns null when nothing is authored.
 */
export type DurationBlock = {
  duration_min?: number | readonly [number, number] | number[];
  segments?: ReadonlyArray<{ duration_min?: number }>;
  optional?: boolean;
};

export type MinutesRange = { min: number; max: number };

function blockRange(b: DurationBlock): [number, number] | null {
  const d = b.duration_min;
  if (Array.isArray(d)) {
    const lo = d[0] ?? d[1] ?? 0;
    const hi = d[1] ?? d[0] ?? 0;
    return lo > 0 || hi > 0 ? [Math.min(lo, hi), Math.max(lo, hi)] : null;
  }
  if (typeof d === "number" && d > 0) return [d, d];
  const seg = (b.segments ?? []).reduce((n, s) => n + (s.duration_min ?? 0), 0);
  return seg > 0 ? [seg, seg] : null;
}

export function sessionMinutes(blocks: readonly DurationBlock[]): MinutesRange | null {
  let min = 0;
  let max = 0;
  for (const b of blocks) {
    if (b.optional) continue;
    const r = blockRange(b);
    if (!r) continue;
    min += r[0];
    max += r[1];
  }
  return max > 0 ? { min, max } : null;
}

const to5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

/**
 * "about 30 min" when the rounded ends meet, else "25–35 min". Ends round to
 * the nearest 5: a 23–32 min session is "25–30 min", never false precision.
 * Exact single-number authoring under 10 min stays exact ("about 3 min").
 */
export function formatMinutes(r: MinutesRange | null): string | null {
  if (!r) return null;
  if (r.max < 10) return `about ${Math.round(r.max)} min`;
  const lo = to5(r.min);
  const hi = to5(r.max);
  return lo === hi ? `about ${hi} min` : `${lo}–${hi} min`;
}
