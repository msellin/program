import { Card } from "@/components/ui/Card";
import { LevelLadder, stripTierPrefix } from "@/components/program/LevelLadder";
import { StatTiles } from "@/components/program/StatTiles";
import type { BestSet } from "./session-stats";

export function DoneStats({ sets, movements, reps, holdSeconds }: { sets: number; movements: number; reps: number; holdSeconds: number }) {
  const tiles = [
    { value: String(sets), label: sets === 1 ? "Set" : "Sets" },
    { value: String(movements), label: movements === 1 ? "Movement" : "Movements" },
    holdSeconds > 0 && reps <= 0
      ? { value: `${holdSeconds}s`, label: "Held" }
      : { value: String(reps), label: reps === 1 ? "Rep" : "Reps" },
  ];
  return <StatTiles tiles={tiles} />;
}

export function BestSetCard({ best }: { best: BestSet }) {
  return (
    <Card as="section" aria-label="Best set" className={best.isPB ? "border-bronze" : undefined}>
      <p className="text-eyebrow uppercase tracking-widest text-muted">
        {best.isPB ? "New personal best" : "Best set"}
      </p>
      <p className="mt-1 text-h3 font-semibold text-strong">{best.label}</p>
      <p className="text-small text-muted">{best.name}</p>
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
