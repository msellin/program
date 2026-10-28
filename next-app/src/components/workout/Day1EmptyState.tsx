"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { firstSessionOffer, FIRST_SESSION_MOVE_REASON } from "@/lib/engine/first-session";
import { Button } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";

/**
 * Day-1 empty-state card. Fix for Bug #3 from the 2026-08-17 flow-review
 * brief.
 *
 * Shows for fresh users with no morning check saved and no logs on record.
 * Owns the "start here" attention — no competing HeroStateCard tile, no
 * SignalsStrip nudge, no RestDayCard.
 *
 * The engine has nothing to work with until this first tap happens; the
 * one-CTA framing makes that call load-bearing rather than one option
 * among many.
 */
export function Day1EmptyState({ sessionHref, slug }: { sessionHref?: string; slug?: string }) {
  const store = useStore((s) => s.store);
  const moveWholeDay = useStore((s) => s.moveWholeDay);
  const today = todayISO();
  // G-01: day 1 is a rest day in the weekly template — pull the next session forward.
  const offer = slug ? firstSessionOffer(store, slug, today) : null;
  return (
    <section
      aria-labelledby="day1-title"
      className={`${cardClass()} space-y-3`}
    >
      <p className="font-mono text-eyebrow uppercase tracking-widest text-bronze">
        Setup · one minute
      </p>
      <h2 id="day1-title" className="text-h3 text-strong leading-snug">
        Week 1. Start with your first session.
      </h2>
      <p className="text-small text-muted leading-relaxed">
        {sessionHref || offer
          ? "Do it at an easy effort and log what you get. A morning check is optional."
          : "Start with a morning check. It takes a minute and sets today's load."}
      </p>
      <div className="flex flex-wrap items-center gap-x-4">
        {offer ? (
          <Button onClick={() => moveWholeDay(offer.fromDate, today, FIRST_SESSION_MOVE_REASON)}>
            Start your first session now
            <ArrowRight size={14} />
          </Button>
        ) : (
        <Button href={sessionHref ?? "/check/"}>
          {sessionHref ? "Start your first session" : "Open morning check"}
          <ArrowRight size={14} />
        </Button>
        )}
        {sessionHref || offer ? (
          <Button variant="tertiary" href="/check/">
            Do a morning check first
          </Button>
        ) : null}
      </div>
    </section>
  );
}
