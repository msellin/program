"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/session/shared/BottomSheet";
import { useStore } from "@/lib/useStore";
import type { RailExercise } from "@/components/session/DaySession";

const CHIPS = ["Felt heavy", "Form broke down", "Pain or tweak"] as const;

/**
 * Screen 6d from the Day redesign. Offered unprompted only after a
 * Grind (RestTakeover), or reached deliberately from the ⋯ overflow
 * sheet. Per-set notes are cut (decision 2 in the README) — this is the
 * one note, per exercise, per day.
 *
 * "Pain or tweak" is the one chip that changes behavior: it flags the
 * exercise (prefixes the saved note so it's visible on History/Coach)
 * and, on a skill program, offers to stop the session — the app's
 * existing shoulder-pain safety rule, previously a static banner. There
 * is no dedicated "end session" store action; stopping just means
 * landing back on Brief, which is already the safe, non-lifting state.
 */
export function NoteSheet({
  active,
  date,
  isSkillProgram,
  onClose,
  onStopSession,
}: {
  active: RailExercise;
  date: string;
  isSkillProgram: boolean;
  onClose: () => void;
  onStopSession: () => void;
}) {
  const setNotes = useStore((s) => s.setNotes);
  const [selected, setSelected] = useState<Set<(typeof CHIPS)[number]>>(new Set());
  const [detail, setDetail] = useState("");
  const [offerStop, setOfferStop] = useState(false);

  const toggle = (chip: (typeof CHIPS)[number]) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  };

  const save = () => {
    const parts = [...selected, detail.trim()].filter(Boolean);
    setNotes(active.blockId, active.exercise.id, parts.join(" · "), date);
    if (selected.has("Pain or tweak") && isSkillProgram) {
      setOfferStop(true);
      return;
    }
    onClose();
  };

  if (offerStop) {
    return (
      <BottomSheet titleId="note-stop-title" onClose={onClose}>
        <p id="note-stop-title" className="text-[16px] font-semibold text-strong mb-1 tracking-[-.015em]">
          Stop the session?
        </p>
        <p className="text-[13.5px] leading-snug text-ink mb-[14px]">
          Any sharp pain during skill work — end the block, take rest. Non-negotiable.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onStopSession}
            className="flex-1 h-[54px] rounded-[10px] bg-amber text-ground text-[16px] font-semibold"
          >
            Stop session
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-24 h-[54px] rounded-[10px] border border-line-strong text-ink text-[15px]"
          >
            Continue
          </button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet titleId="note-title" onClose={onClose}>
      <p id="note-title" className="text-[16px] font-semibold text-strong mb-1 tracking-[-.015em]">
        Anything worth knowing?
      </p>
      <p className="text-[13.5px] leading-snug text-ink mb-3.5">
        The engine reads this when it plans next week.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {CHIPS.map((chip) => {
          const isOn = selected.has(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => toggle(chip)}
              className={
                "rounded-full px-[15px] py-[11px] text-[14px] font-medium border " +
                (isOn
                  ? "border-bronze bg-[rgba(200,150,102,.14)] text-strong"
                  : "border-line-strong bg-surface-2 text-ink")
              }
            >
              {chip}
            </button>
          );
        })}
      </div>
      <textarea
        rows={2}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="Add a detail — optional"
        className="w-full bg-surface-2 border border-line-strong rounded-[9px] text-strong text-[14.5px] p-3 resize-none outline-none mb-3.5"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          className="flex-1 h-[54px] rounded-[10px] bg-bronze text-ground text-[16px] font-semibold"
        >
          Save to {active.exercise.name}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-24 h-[54px] rounded-[10px] border border-line-strong text-ink text-[15px]"
        >
          Not now
        </button>
      </div>
    </BottomSheet>
  );
}
