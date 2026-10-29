import type { DayLog, ScheduledBlock } from "@/lib/schemas";

export type TrackState = "done" | "skipped" | "moved" | "notLogged" | "planned";

export const TRACK_STATE_LABEL: Record<TrackState, string> = {
  done: "Done",
  skipped: "Skipped",
  moved: "Moved",
  notLogged: "Not logged",
  planned: "Planned",
};

/**
 * Each active programme with something on this day, primary first, and
 * whether it was done (plan-tab-review D6, 2026-10-29).
 *
 * Done reads the day's log as well as the block state: the founder's Mon
 * back squat and Wed block pull were logged, yet both tracks still read
 * "planned", because the block state is not always flipped on log (exercise
 * keys carry the session's block id, which is not always the scheduled
 * instance id). A logged exercise under one of this track's blocks counts.
 * A past day with nothing logged reads "Not logged", never "planned".
 */
export function dayTracks({
  activeSlugs,
  displayBlocks,
  blocksByProgram,
  dayLog,
  isPast,
  names,
}: {
  activeSlugs: string[];
  displayBlocks: { id: string; programSlug?: string }[];
  blocksByProgram: Record<string, ScheduledBlock[]>;
  dayLog: DayLog | undefined;
  isPast: boolean;
  names: Record<string, string>;
}): { slug: string; name: string; state: TrackState }[] {
  const doneKeys = Object.entries(dayLog?.exercises ?? {})
    .filter(([, e]) => e.done)
    .map(([k]) => k);
  const out: { slug: string; name: string; state: TrackState }[] = [];
  for (const slug of activeSlugs) {
    const scheduled = blocksByProgram[slug] ?? [];
    const shown = displayBlocks.filter((b) => b.programSlug === slug);
    if (!scheduled.length && !shown.length) continue;
    const prefixes = [
      ...shown.map((b) => b.id),
      ...scheduled.flatMap((b) => [b.id, b.block_template_id]),
    ].map((id) => `${id}:`);
    const logged =
      scheduled.some((b) => b.state === "done") ||
      doneKeys.some((k) => prefixes.some((p) => k.startsWith(p)));
    let state: TrackState;
    if (logged) state = "done";
    else if (scheduled.length && scheduled.every((b) => b.state === "skipped")) state = "skipped";
    else if (!shown.length && scheduled.some((b) => b.state === "moved")) state = "moved";
    else state = isPast ? "notLogged" : "planned";
    out.push({
      slug,
      name: names[slug] ?? slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
      state,
    });
  }
  return out;
}
