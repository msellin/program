"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { humanizeExerciseId } from "@/lib/humanize-metrics";
import { checkTrainingMaxes } from "@/lib/engine/tm-plausibility";
import { cardClass } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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
export function BeliefsSection({ programLifts }: { programLifts?: string | null } = {}) {
  const store = useStore((s) => s.store);
  const setTM = useStore((s) => s.setTM);
  const [openRow, setOpenRow] = useState<string | null>(null); // exId, or "tier"
  const [editingTM, setEditingTM] = useState<string | null>(null);
  const [draft, setDraft] = useState(0);

  // P-07 (2026-10-27): a max shows only if the active program names that lift or the user
  // set it themselves. Intake seeds and cross-program maxes made a pull-up user see squats.
  // `programLifts` is the active program's JSON; undefined means "not loaded / don't filter".
  const provenance = store.training_max_provenance ?? {};
  const tmEntries = Object.entries(store.training_maxes ?? {}).filter(
    (entry): entry is [string, number] =>
      typeof entry[1] === "number" &&
      entry[1] > 0 &&
      (programLifts == null ||
        programLifts.includes(`"${entry[0]}"`) ||
        provenance[entry[0]]?.source === "manual" ||
        provenance[entry[0]]?.source === "test"),
  );

  // Does each training max agree with what the user has actually lifted?
  // Nothing checked until 2026-09-03: the founder's front-squat TM sat at
  // 110 — identical to his back squat, and above the single his log could
  // evidence — and the way it surfaced was him working to a 115 in a gym.
  // Surfaced here because this is the one screen where a TM is looked at and
  // edited. It proposes nothing and changes nothing.
  const tmFindings = useMemo(() => checkTrainingMaxes(store), [store]);
  const findingFor = (exId: string) => tmFindings.find((f) => f.liftId === exId);

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

  // P-07: no lifts, no heading.
  if (tmEntries.length === 0) return null;

  return (
    <div>
      <p className="text-eyebrow uppercase tracking-widest text-muted mb-2">
        Your working maxes
      </p>
      <div className={cn(cardClass({ flush: true }), "divide-y divide-line-soft")}>
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
                <span className="flex-1 min-w-0 text-body text-ink truncate capitalize">
                  {humanizeExerciseId(exId)}
                </span>
                <span className="text-body font-semibold text-strong flex-shrink-0">{kg} kg</span>
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
                  <p className="text-small text-ink leading-snug mb-2.5">{tmWhy(exId)}</p>
                  {(() => {
                    const f = findingFor(exId);
                    if (!f) return null;
                    return (
                      <div className="mb-2.5 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2">
                        <p className="text-small text-strong leading-snug">{f.message}</p>
                        {f.suggestedTM != null ? (
                          <p className="mt-1 text-caption text-muted">
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
                        className="w-11 h-11 flex-shrink-0 rounded-lg border border-line-strong bg-surface-2 text-strong text-h2"
                      >
                        −
                      </button>
                      <span className="font-mono flex-1 text-center text-body font-semibold text-strong">
                        {draft} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => setDraft((v) => v + 2.5)}
                        className="w-11 h-11 flex-shrink-0 rounded-lg border border-line-strong bg-surface-2 text-strong text-h2"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTM(exId, draft);
                          setEditingTM(null);
                        }}
                        className="ml-1 px-3 py-2 min-h-[44px] rounded-lg bg-bronze text-ground text-caption font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTM(null)}
                        className="px-2 py-2 min-h-[44px] text-muted text-caption"
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
                      className="text-caption border border-line-strong rounded-lg px-3 py-1.5 min-h-[36px] text-ink"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
