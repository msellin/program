import { Card } from "@/components/ui/Card";
import { LevelLadder, stripTierPrefix } from "@/components/program/LevelLadder";
import { StatTiles } from "@/components/program/StatTiles";
import type { BestSet } from "./session-stats";

export function DoneStats({
  sets,
  planned,
  movements,
  reps,
  holdSeconds,
}: {
  sets: number;
  /** Required sets the day prescribed; shown as "3/5" when the day ended short. */
  planned?: number;
  movements: number;
  reps: number;
  holdSeconds: number;
}) {
  const short = planned != null && planned > sets;
  const tiles = [
    { value: short ? `${sets}/${planned}` : String(sets), label: short ? "Sets done" : sets === 1 ? "Set" : "Sets" },
    { value: String(movements), label: movements === 1 ? "Exercise" : "Exercises" },
    holdSeconds > 0 && reps <= 0
      ? { value: `${holdSeconds}s`, label: "Held" }
      : { value: String(reps), label: reps === 1 ? "Rep" : "Reps" },
  ];
  // Borderless with hairline dividers (round 6): three boxed tiles out-shouted
  // the best set, which is the screen's point.
  return (
    <dl className="grid grid-cols-3 divide-x divide-line-soft border-y border-line-soft py-3">
      {tiles.map((t) => (
        <div key={t.label} className="text-center">
          <dd className="text-h2 font-semibold tabular-nums leading-none text-strong">{t.value}</dd>
          <dt className="mt-1 text-caption text-muted">{t.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function BestSetCard({ best, lastTime }: { best: BestSet; lastTime?: string | null }) {
  return (
    <Card as="section" aria-label="Best set" className="border-bronze/70">
      <p className="text-eyebrow uppercase tracking-widest text-muted">
        {best.isPB ? "New personal best" : "Best set"}
      </p>
      <p className="mt-1 text-h1 font-semibold tabular-nums tracking-[-.03em] text-strong">{best.label}</p>
      <p className="text-small text-muted">{best.name}</p>
      {lastTime ? <p className="mt-2 border-t border-line-soft pt-2 text-small text-ink">{lastTime}</p> : null}
    </Card>
  );
}

export function DoneLadder({ levels, activeId }: { levels: { id: string; label: string }[]; activeId: string }) {
  const idx = levels.findIndex((l) => l.id === activeId);
  if (levels.length < 2 || idx < 0) return null;
  const next = levels[idx + 1];
  return (
    <Card as="section" aria-label="Your level">
      <LevelLadder levels={levels} activeId={activeId} />
      <p className="mt-3 text-small text-muted">
        {next ? `Next level: ${stripTierPrefix(next.label)}.` : "You are on the top level."}
      </p>
    </Card>
  );
}

export function NextSessionCard({ dayLabel, focus }: { dayLabel: string; focus?: string }) {
  return (
    <Card as="section" aria-label="Next session">
      <p className="text-eyebrow uppercase tracking-widest text-muted">Next session</p>
      <p className="mt-1 text-h3 font-semibold text-strong">{dayLabel}</p>
      {focus ? <p className="text-small text-muted">{focus}</p> : null}
    </Card>
  );
}
