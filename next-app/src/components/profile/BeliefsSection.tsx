"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { humanizeExerciseId } from "@/lib/humanize-metrics";
import { checkTrainingMaxes } from "@/lib/engine/tm-plausibility";

/**
 * Design package turn t2, screen 2b ("what Terav believes about you") —
 * scoped down from the mockup's open-ended belief list to two rows,
 * agreed with the user 2026-08-23. See
 * dev/active/profile-beliefs-plan.md for the full reasoning.
 *
 * Training max: editable (reuses `setTM`, already used elsewhere in the
 * app). Tier: permanently read-only by design — letting a user
 * self-declare tier would let them lie to the adaptive engine about
 * earned progression, which undermines the confirm-first model this app
 * is built on. The row always explains *why* it's what it is and *how*
 * it actually changes, so the absence of a Change button reads as
 * intentional rather than broken.
 */
export function BeliefsSection() {
  const store = useStore((s) => s.store);
  const setTM = useStore((s) => s.setTM);
  const [openRow, setOpenRow] = useState<string | null>(null); // exId, or "tier"
  const [editingTM, setEditingTM] = useState<string | null>(null);
  const [draft, setDraft] = useState(0);

  const tmEntries = Object.entries(store.training_maxes ?? {}).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] > 0,
  );

  // Does each training max agree with what the user has actually lifted?
  // Nothing checked until 2026-09-03: the founder's front-squat TM sat at
  // 110 — identical to his back squat, and above the single his log could
  // evidence — and the way it surfaced was him working to a 115 in a gym.
  // Surfaced here because this is the one screen where a TM is looked at and
  // edited. It proposes nothing and changes nothing.
  const tmFindings = useMemo(() => checkTrainingMaxes(store), [store]);
  const findingFor = (exId: string) => tmFindings.find((f) => f.liftId === exId);

  const activeSlug = store.user_profile?.active_program_id ?? null;
  const tierState = activeSlug ? store.user_profile?.program_states?.[activeSlug] : undefined;
  const tierLabel = formatTierLabel(tierState?.tier);
  const tierHistory = tierState?.tier_history ?? [];
  const latestTierChange = tierHistory.length ? tierHistory[tierHistory.length - 1] : null;

  if (tmEntries.length === 0 && !tierLabel) return null;

  const tmWhy = (exId: string): string => {
    const hits = (store.proposal_history ?? [])
      .filter((p) => {
        if (p.kind !== "tm_bump" || p.outcome !== "accepted") return false;
        const ids = p.id.split(":")[1]?.split(",") ?? [];
        return ids.includes(exId);
      })
      .sort((a, b) => b.at - a.at);
    if (hits.length === 0) return "Set from your intake baseline — no bumps accepted yet.";
    const dateStr = formatDate(hits[0].date);
    return hits.length === 1
      ? `Bumped once, accepted on ${dateStr}.`
      : `Bumped ${hits.length} times, most recently accepted on ${dateStr}.`;
  };

  const tierWhy = latestTierChange
    ? `Promoted from ${formatTierLabel(latestTierChange.from_tier)} to ${formatTierLabel(latestTierChange.to_tier)} on ${formatDate(latestTierChange.at)} — ${
        latestTierChange.trigger === "retest" ? "you cleared the retest gate" : "set manually"
      }.`
    : "Your intake answers put you here.";

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
        What Terav believes
      </p>
      <div className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
        {tmEntries.map(([exId, kg]) => {
          const isOpen = openRow === exId;
          const isEditing = editingTM === exId;
          return (
            <div key={exId}>
              <button
                type="button"
                onClick={() => setOpenRow(isOpen ? null : exId)}
                aria-expanded={isOpen}
                className="w-full flex items-baseline gap-3 px-3 py-3 min-h-[48px] text-left active:bg-line-soft/50"
              >
                <span className="flex-1 min-w-0 text-[15px] text-ink truncate capitalize">
                  {humanizeExerciseId(exId)}
                </span>
                <span className="text-[15px] font-semibold text-strong flex-shrink-0">{kg} kg</span>
                {findingFor(exId) ? (
                  <span
                    aria-label="This training max may not match your log"
                    className="flex-shrink-0 text-amber"
                  >
                    <AlertTriangle size={14} aria-hidden />
                  </span>
                ) : null}
                <ChevronDown
                  size={14}
                  aria-hidden
                  className={`text-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen ? (
                <div className="px-3 pb-3 -mt-1">
                  <p className="text-[13.5px] text-ink leading-snug mb-2.5">{tmWhy(exId)}</p>
                  {(() => {
                    const f = findingFor(exId);
                    if (!f) return null;
                    return (
                      <div className="mb-2.5 rounded border border-amber/40 bg-amber/10 px-3 py-2">
                        <p className="text-[13.5px] text-strong leading-snug">{f.message}</p>
                        {f.suggestedTM != null ? (
                          <p className="mt-1 text-[12.5px] text-muted">
                            Convention would put it near{" "}
                            <span className="font-mono text-ink">{f.suggestedTM} kg</span>. Edit
                            below if you agree — nothing changes on its own.
                          </p>
                        ) : null}
                      </div>
                    );
                  })()}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDraft((v) => Math.max(0, v - 2.5))}
                        className="w-11 h-11 flex-shrink-0 rounded border border-line-strong bg-surface-2 text-strong text-[20px]"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-mono text-[16px] font-semibold text-strong">
                        {draft} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => setDraft((v) => v + 2.5)}
                        className="w-11 h-11 flex-shrink-0 rounded border border-line-strong bg-surface-2 text-strong text-[20px]"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTM(exId, draft);
                          setEditingTM(null);
                        }}
                        className="ml-1 px-3 py-2 min-h-[44px] rounded bg-bronze text-ground text-[13px] font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTM(null)}
                        className="px-2 py-2 min-h-[44px] text-muted text-[13px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(kg);
                        setEditingTM(exId);
                      }}
                      className="text-[13px] border border-line-strong rounded px-3 py-1.5 min-h-[36px] text-ink"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
        {activeSlug && tierLabel ? (
          <div>
            <button
              type="button"
              onClick={() => setOpenRow(openRow === "tier" ? null : "tier")}
              aria-expanded={openRow === "tier"}
              className="w-full flex items-baseline gap-3 px-3 py-3 min-h-[48px] text-left active:bg-line-soft/50"
            >
              <span className="flex-1 min-w-0 text-[15px] text-ink truncate">Program tier</span>
              <span className="text-[15px] font-semibold text-strong flex-shrink-0">{tierLabel}</span>
              <ChevronDown
                size={14}
                aria-hidden
                className={`text-muted flex-shrink-0 transition-transform ${openRow === "tier" ? "rotate-180" : ""}`}
              />
            </button>
            {openRow === "tier" ? (
              <div className="px-3 pb-3 -mt-1">
                <p className="text-[13.5px] text-ink leading-snug mb-1.5">{tierWhy}</p>
                <p className="text-[12px] text-muted leading-snug">
                  Changes automatically when you clear your next retest gate — Terav promotes you,
                  you don&apos;t self-select it.{" "}
                  <Link href="/progress" className="text-slate underline decoration-slate/40">
                    See Progress →
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatTierLabel(tier: string | undefined): string | null {
  if (!tier) return null;
  if (tier === "foundation" || tier === "progression" || tier === "push") {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
  const short = tier.replace(/^tier_[a-z]_?/i, "");
  return short.length ? short.charAt(0).toUpperCase() + short.slice(1) : tier;
}

function formatDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
