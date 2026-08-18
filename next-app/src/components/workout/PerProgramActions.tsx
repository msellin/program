"use client";

/**
 * Block-object rebuild · Phase C — per-program Skip / Move menu.
 * See dev/active/block-object-rebuild-2026-08-18.md §0.2, §3.
 *
 * Replaces the whole-day <SessionActions> when block_object is on.
 * Renders directly below each program's block group on Today. Each menu
 * scopes its Skip / Move actions to blocks belonging to THIS program on
 * the current date — so with 2+ active programs the founder can skip
 * handstand-walk while keeping engine-builder.
 *
 * Undo affordance: when every block for this program on this date is
 * currently skipped or moved, this renders as an amber "Skipped today"
 * banner with an Undo button — matches the legacy SessionActions'
 * skipped-state UI (components.md#callouts).
 */

import { useMemo, useRef, useState } from "react";
import { CalendarClock, SkipForward, X } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { iso } from "@/lib/utils";
import type { ScheduledBlock } from "@/lib/schemas";

type Props = {
  programSlug: string;
  programName: string;
  date: string;
  scheduledBlocks: ScheduledBlock[];
};

export function PerProgramActions({ programSlug, programName, date, scheduledBlocks }: Props) {
  const [open, setOpen] = useState<"move" | "skip" | null>(null);
  const skipBlock = useStore((s) => s.skipBlock);
  const moveBlock = useStore((s) => s.moveBlock);
  const restoreBlock = useStore((s) => s.restoreBlock);

  const { plannedIds, skippedIds, movedIds } = useMemo(() => {
    const planned: string[] = [];
    const skipped: string[] = [];
    const moved: string[] = [];
    for (const b of scheduledBlocks) {
      if (b.state === "planned" || b.state === "amber_downshifted") planned.push(b.id);
      else if (b.state === "skipped") skipped.push(b.id);
      else if (b.state === "moved") moved.push(b.id);
    }
    return { plannedIds: planned, skippedIds: skipped, movedIds: moved };
  }, [scheduledBlocks]);

  // Undo banner state: every block on this program+date is skipped or
  // moved (not a mix with planned). Shows an Undo affordance.
  const everythingSkipped = plannedIds.length === 0 && skippedIds.length > 0 && movedIds.length === 0;
  const everythingMoved = plannedIds.length === 0 && movedIds.length > 0 && skippedIds.length === 0;

  if (everythingSkipped || everythingMoved) {
    // Audit 2026-08-18 (visual-craft) — border-l was `border-l-amber` for
    // BOTH states. tokens.md accent economy: amber = warn/skipped, slate
    // = moved/rescheduled. Split by state.
    const borderTone = everythingSkipped ? "border-l-amber" : "border-l-slate";
    return (
      <div className={`rounded border border-line-soft border-l-4 ${borderTone} bg-surface p-3 flex items-center justify-between gap-3`}>
        <div className="text-sm">
          <p className="font-semibold text-strong">
            {programName} — {everythingSkipped ? "skipped today" : "moved"}
          </p>
          {everythingMoved ? (
            <p className="text-muted text-[13px] mt-0.5">
              Rescheduled to {scheduledBlocks.find((b) => movedIds.includes(b.id))?.actual_date ?? "another day"}.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            for (const id of everythingSkipped ? skippedIds : movedIds) {
              restoreBlock(id);
            }
          }}
          className="text-[12px] mono-caps text-bronze hover:text-bronze-hover"
        >
          Undo
        </button>
      </div>
    );
  }

  if (plannedIds.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setOpen("move")}
          className="flex flex-col items-center justify-center gap-1 px-2 py-2 min-h-[52px] border border-line rounded bg-surface hover:bg-surface-2 text-[12px]"
        >
          <CalendarClock size={14} />
          <span>Move</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen("skip")}
          className="flex flex-col items-center justify-center gap-1 px-2 py-2 min-h-[52px] border border-line rounded bg-surface hover:bg-surface-2 text-[12px]"
        >
          <SkipForward size={14} />
          <span>Skip</span>
        </button>
      </div>

      {open === "skip" ? (
        <ConfirmSheet
          title={`Skip ${programName} today?`}
          body="This track's session on this date is marked skipped. Other tracks today are unaffected."
          confirmLabel="Skip"
          onCancel={() => setOpen(null)}
          onConfirm={(reason) => {
            for (const id of plannedIds) skipBlock(id, reason);
            setOpen(null);
          }}
          askReason
        />
      ) : null}

      {open === "move" ? (
        <MoveSheet
          fromDate={date}
          programName={programName}
          onCancel={() => setOpen(null)}
          onConfirm={(toDate) => {
            const todayIso = new Date().toISOString().slice(0, 10);
            if (toDate < todayIso) return;
            for (const id of plannedIds) moveBlock(id, toDate);
            setOpen(null);
          }}
        />
      ) : null}
    </>
  );
}

function ConfirmSheet({
  title,
  body,
  onCancel,
  onConfirm,
  confirmLabel,
  askReason,
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
  confirmLabel: string;
  askReason?: boolean;
}) {
  const [reason, setReason] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "ppa-confirm-title";
  useFocusTrap(panelRef, onCancel);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onCancel}
      className="fixed inset-0 z-50 bg-ground/80 flex items-end sm:items-center justify-center p-3"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-surface border border-line rounded-lg p-4 space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <p id={titleId} className="font-semibold text-strong">{title}</p>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted">{body}</p>
        {askReason ? (
          <div>
            <label className="mono-caps block mb-1" htmlFor="ppa-skip-reason">
              Reason (optional)
            </label>
            <input
              id="ppa-skip-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. travelling, tired"
              className="w-full px-3 py-3 min-h-[44px] border border-line rounded bg-surface text-[15px]"
            />
          </div>
        ) : null}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-line rounded py-2 text-sm hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason || undefined)}
            className="flex-1 bg-bronze text-ground rounded py-2 text-sm font-semibold hover:bg-bronze-hover"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function MoveSheet({
  fromDate,
  programName,
  onCancel,
  onConfirm,
}: {
  fromDate: string;
  programName: string;
  onCancel: () => void;
  onConfirm: (toDate: string) => void;
}) {
  const [date, setDate] = useState(() => {
    const t = new Date(fromDate + "T12:00:00");
    t.setDate(t.getDate() + 1);
    return iso(t);
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "ppa-move-title";
  useFocusTrap(panelRef, onCancel);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onCancel}
      className="fixed inset-0 z-50 bg-ground/80 flex items-end sm:items-center justify-center p-3"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-surface border border-line rounded-lg p-4 space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <p id={titleId} className="font-semibold text-strong">Move {programName}</p>
          <button type="button" onClick={onCancel} aria-label="Cancel" className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted">
          This track's session on {fromDate} moves to the chosen date. Other tracks
          today are unaffected.
        </p>
        <div>
          <label className="mono-caps block mb-1" htmlFor="ppa-move-date">
            Move to
          </label>
          <input
            id="ppa-move-date"
            type="date"
            value={date}
            min={iso(new Date())}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-3 min-h-[44px] border border-line rounded bg-surface text-[15px]"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel} className="flex-1 border border-line rounded py-2 text-sm hover:bg-surface-2">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(date)}
            className="flex-1 bg-bronze text-ground rounded py-2 text-sm font-semibold hover:bg-bronze-hover"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
