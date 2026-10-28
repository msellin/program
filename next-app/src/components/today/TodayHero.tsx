"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cardClass } from "@/components/ui/Card";
import { ExerciseFigure } from "@/components/follow-along/ExerciseFigure";
import { WeeklySessionStrip, type WeeklySessionStripDay } from "@/components/ui/WeeklySessionStrip";
import { figureFor } from "@/lib/figures/exercise-figures";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/schemas";

/** The first exercise (in plan order) that has an illustration, or null. */
export function leadFigureId(blocks: Block[]): string | null {
  for (const b of blocks) {
    const items = [...(b.items ?? []), ...(b.segments ?? []).flatMap((s) => s.items)];
    for (const it of items) {
      const f = it.exercise_id ? figureFor(it.exercise_id) : null;
      if (f) return f;
    }
  }
  return null;
}

/** Authored minutes for the day: block duration, else its segments. Null when nothing is authored. */
export function estimatedMinutes(blocks: Block[]): number | null {
  let total = 0;
  for (const b of blocks) {
    const d = b.duration_min;
    if (Array.isArray(d)) total += d[1] ?? d[0] ?? 0;
    else if (typeof d === "number") total += d;
    else total += (b.segments ?? []).reduce((n, s) => n + (s.duration_min ?? 0), 0);
  }
  return total > 0 ? Math.round(total) : null;
}

function LeadFigure({ figure }: { figure: string }) {
  const [start, setStart] = useState(0);
  useEffect(() => setStart(Date.now()), []);
  const getElapsed = useCallback(() => Date.now() - start, [start]);
  return (
    <div aria-hidden className="h-28 w-28 shrink-0 rounded-xl bg-ground p-1.5">
      <ExerciseFigure figure={figure} side="B" playing getElapsed={getElapsed} />
    </div>
  );
}

type Props = {
  eyebrow: string;
  title: string;
  /** Phase and week, one short line. */
  lede?: string;
  blocks: Block[];
  accent?: "green" | "amber";
  startHref?: string;
  weekStart?: string;
  weekDays?: WeeklySessionStripDay[];
  /** Short block list under the title; kept so the plan stays scannable. */
  children?: ReactNode;
};

/**
 * One hero card for a training day: lead figure, title, minutes and the Start
 * button. Never rendered on a red day; TodaySession returns the rest card first.
 */
export function TodayHero({ eyebrow, title, lede, blocks, accent, startHref, weekStart, weekDays, children }: Props) {
  const figure = leadFigureId(blocks);
  const minutes = estimatedMinutes(blocks);
  return (
    <section className={cn(cardClass({ status: accent }), "space-y-4")}>
      <div className="flex items-start gap-4">
        {figure ? <LeadFigure figure={figure} /> : null}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-eyebrow uppercase tracking-widest text-muted">{eyebrow}</p>
          <h2 className="text-h3 text-strong">{title}</h2>
          {lede ? <p className="text-small text-muted">{lede}</p> : null}
          {minutes ? (
            <p className="font-mono text-eyebrow uppercase tracking-widest text-muted tabular-nums">
              About {minutes} min
            </p>
          ) : null}
        </div>
      </div>
      {children}
      {weekDays && weekStart ? <WeeklySessionStrip weekStart={weekStart} days={weekDays} /> : null}
      {startHref ? (
        <Link
          href={startHref}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-bronze bg-bronze px-3.5 py-2 text-small font-semibold text-ground hover:bg-bronze-hover active:bg-bronze-active"
        >
          Open session
          <ChevronRight size={14} />
        </Link>
      ) : null}
    </section>
  );
}
