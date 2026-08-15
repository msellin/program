"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { buildRevealCopy } from "@/lib/personalization/reveal-copy";
import type { Program } from "@/lib/schemas";

/**
 * The "your plan is built" reveal card. Renders on Today for a user who has
 * just started a program AND hasn't dismissed the reveal for that program.
 *
 * Phase A of the personalization architecture: it takes data already in the
 * store (intake_answers, tier, capability_profile) and puts it in front of
 * the user. This is what makes "personal" stop being a marketing word.
 *
 * Persistence: dismissal writes `program_states[slug].reveal_seen = true`.
 * Card never re-appears for the same program.
 */
export function YourPlanCard({ program }: { program: Program }) {
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const programStates = useStore((s) => s.store.user_profile?.program_states);
  const capabilityProfile = useStore((s) => s.store.user_profile?.capability_profile);
  const dismissReveal = useStore((s) => s.dismissPlanReveal);
  const [dismissedLocal, setDismissedLocal] = useState(false);

  const slug = activeSlug ?? null;
  const state = slug ? programStates?.[slug] : undefined;
  const intakeAnswers = state?.intake_answers;
  const tierId = state?.tier;
  const revealSeen = state?.reveal_seen === true;

  // Belt-and-suspenders: local dismissal for instant response before the
  // debounced sync push lands. Combined with revealSeen for the persistent
  // check across reloads.
  const [copy, setCopy] = useState<ReturnType<typeof buildRevealCopy> | null>(null);
  useEffect(() => {
    if (!slug) {
      setCopy(null);
      return;
    }
    setCopy(buildRevealCopy(program, intakeAnswers, tierId, capabilityProfile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, tierId, JSON.stringify(intakeAnswers ?? {}), JSON.stringify(capabilityProfile ?? {})]);

  if (!slug || !copy || revealSeen || dismissedLocal) return null;

  const dismiss = () => {
    setDismissedLocal(true);
    dismissReveal(slug);
  };

  return (
    <section
      aria-label="Your plan is built"
      className="relative overflow-hidden rounded border border-bronze/30 bg-bronze/[0.06] px-4 py-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded text-muted hover:text-ink"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-2.5 pr-8">
        <Sparkles size={16} className="mt-0.5 text-bronze flex-shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-widest text-bronze">
              Your plan
            </p>
            <h2 className="mt-1 text-[15px] font-semibold text-strong leading-snug">
              {copy.headline}
            </h2>
          </div>
          <p className="text-[13px] text-ink leading-relaxed">{copy.schedule_line}</p>
          <p className="text-[13px] text-muted leading-relaxed">{copy.tier_line}</p>
          {copy.phase_lines.length ? (
            <ul className="mt-1 space-y-0.5 text-[12.5px] text-muted">
              {copy.phase_lines.map((line, i) => (
                <li key={i} className="pl-3 -indent-3 truncate">
                  <span className="text-bronze">·</span>{" "}
                  <span title={line}>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-[12px] text-slate italic leading-relaxed pt-1 border-t border-line-soft/60">
            {copy.attribution_line}
          </p>
        </div>
      </div>
    </section>
  );
}
