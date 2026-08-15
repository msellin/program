"use client";

import { useRef, useState } from "react";
import { CalendarClock, CalendarX2, SkipForward, X } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { today as todayISO, iso } from "@/lib/utils";
import type { Program } from "@/lib/schemas";

type Props = {
  blockIds: string[];
  date?: string;
  program?: Program | null;
};

export function SessionActions({ blockIds, date, program }: Props) {
  const active = date ?? todayISO();
  const [open, setOpen] = useState<"skip" | "move" | "week" | null>(null);
  const skipDay = useStore((s) => s.skipDay);
  const skipAndShiftWeek = useStore((s) => s.skipAndShiftWeek);
  const skipWholeWeek = useStore((s) => s.skipWholeWeek);
  const moveSession = useStore((s) => s.moveSession);
  const skipped = useStore((s) => s.store.skipped?.[active] ?? null);
  const clearSkip = useStore((s) => s.clearSkip);
  const undoSkip = useStore((s) => s.undoSkip);

  if (skipped) {
    return (
      <div className="rounded border border-line-soft border-l-4 border-l-amber bg-surface p-3 flex items-center justify-between gap-3">
        <div className="text-sm">
          <p className="font-semibold text-strong">Session skipped today</p>
          <p className="text-muted text-[13px] mt-0.5">
            {skipped.moved_to
              ? `Moved to ${skipped.moved_to}`
              : (skipped.reason ?? "No reason logged")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (program ? undoSkip(active, program) : clearSkip(active))}
          className="text-[12px] mono-caps text-bronze hover:text-bronze-hover"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setOpen("move")}
          className="flex flex-col items-center justify-center gap-1 px-2 py-2 min-h-[52px] border border-line rounded bg-surface hover:bg-surface-2 text-[12px]"
        >
          <CalendarClock size={14} />
          <span>Move day</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen("skip")}
          className="flex flex-col items-center justify-center gap-1 px-2 py-2 min-h-[52px] border border-line rounded bg-surface hover:bg-surface-2 text-[12px]"
        >
          <SkipForward size={14} />
          <span>Skip today</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen("week")}
          className="flex flex-col items-center justify-center gap-1 px-2 py-2 min-h-[52px] border border-line rounded bg-surface hover:bg-surface-2 text-[12px]"
        >
          <CalendarX2 size={14} />
          <span>Whole week</span>
        </button>
      </div>

      {open === "skip" ? (
        <SkipSheet
          date={active}
          onCancel={() => setOpen(null)}
          onSkip={(reason, shift) => {
            if (shift && program) {
              skipAndShiftWeek(active, program, reason);
            } else {
              skipDay(active, reason);
            }
            setOpen(null);
          }}
        />
      ) : null}

      {open === "move" ? (
        <MoveSheet
          fromDate={active}
          onCancel={() => setOpen(null)}
          onConfirm={(toDate) => {
            // Guard: moving into the past is nonsensical for schedule reasoning.
            // The date input's `min` attribute is advisory; browsers on desktop
            // let a user paste any date. Validate here.
            const today = new Date().toISOString().slice(0, 10);
            if (toDate < today) return;
            moveSession(active, toDate, blockIds);
            setOpen(null);
          }}
        />
      ) : null}

      {open === "week" ? (
        <WeekSheet
          date={active}
          program={program}
          onCancel={() => setOpen(null)}
          onConfirm={(reason) => {
            if (program) skipWholeWeek(active, program, reason);
            setOpen(null);
          }}
        />
      ) : null}
    </>
  );
}

function WeekSheet({
  date,
  program,
  onCancel,
  onConfirm,
}: {
  date: string;
  program: Pick<Program, "phases"> | null | undefined;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "ws-title";
  useFocusTrap(panelRef, onCancel);
  const weekStart = new Date(date + "T00:00:00");
  const dow = weekStart.getDay();
  const daysBack = (dow + 6) % 7; // Mon = 0
  weekStart.setDate(weekStart.getDate() - daysBack);
  const weekLabel = weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  // Warn if the shift would push a date past the current phase window. The
  // whole-week shift adds 7 days to every session, so if the last session in
  // this week is within 7 days of the phase end, some sessions would land
  // in the next phase (or after the program's last phase entirely).
  const activePhase = program
    ? program.phases.find(
        (p) => date >= p.starts && (!p.ends || date <= p.ends),
      )
    : undefined;
  const phaseEndsSoon = (() => {
    if (!activePhase?.ends) return false;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const shifted = new Date(weekEnd);
    shifted.setDate(weekEnd.getDate() + 7);
    return shifted.toISOString().slice(0, 10) > activePhase.ends;
  })();
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
          <p id={titleId} className="font-semibold text-strong">Skip whole week?</p>
          <button type="button" onClick={onCancel} aria-label="Cancel" className="text-muted hover:text-ink w-11 h-11 -m-2 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted">
          Every strength day in the week of <strong className="text-strong">{weekLabel}</strong> gets marked skipped and its session moves forward by seven days.
        </p>
        <div className="rounded border border-line-soft bg-surface-2/40 p-3 text-[12.5px] leading-snug space-y-1.5">
          <p><span className="text-ink font-semibold">Zero sessions lost.</span> Every strength day this week reappears next week.</p>
          <p><span className="text-ink font-semibold">Phase runs 1 week longer.</span> If your phase was 4 weeks, it&apos;s now 5.</p>
          <p><span className="text-ink font-semibold">Rest / accessory days unchanged.</span> Only strength blocks shift.</p>
        </div>
        <p className="text-[12px] text-muted italic">
          Use this for travel, illness, or any planned week off — not a single missed day (use plain Skip for that).
        </p>
        {phaseEndsSoon ? (
          <p className="text-[12px] text-amber border-l-4 border-amber pl-2">
            Shifting this week pushes some sessions past the current phase
            (&ldquo;{activePhase?.name}&rdquo;). Those sessions may collide with the
            next phase&apos;s prescription. Consider skipping day-by-day instead.
          </p>
        ) : null}
        <div>
          <label className="mono-caps block mb-1" htmlFor="week-reason">Reason (optional)</label>
          <input
            id="week-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="travelling, sick, deload…"
            className="w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-bronze/40 focus:border-bronze"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel} className="flex-1 border border-line rounded py-2 min-h-[44px] text-sm hover:bg-surface-2">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason || undefined)}
            className="flex-1 bg-bronze text-ground rounded py-2 min-h-[44px] text-sm font-semibold hover:bg-bronze-hover"
          >
            Shift whole week
          </button>
        </div>
      </div>
    </div>
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
  const titleId = "cs-title";
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
            <label className="mono-caps block mb-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. travelling, hip flared, tired"
              className="w-full px-2 py-1.5 border border-line rounded bg-surface text-sm"
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

function SkipSheet({
  date,
  onCancel,
  onSkip,
}: {
  date: string;
  onCancel: () => void;
  onSkip: (reason: string | undefined, shiftWeek: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [shift, setShift] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "sk-title";
  useFocusTrap(panelRef, onCancel);
  const isToday = date === todayISO();
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
          <p id={titleId} className="font-semibold text-strong">
            {isToday ? "Skip today's session?" : `Skip ${date}?`}
          </p>
          <button type="button" onClick={onCancel} aria-label="Cancel" className="text-muted hover:text-ink w-11 h-11 -m-2 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted">
          Pick how the rest of your week responds. No TM change either way; your trajectory continues from your last completed session.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShift(false)}
            className={`w-full text-left rounded border p-3 space-y-1 ${
              !shift
                ? "border-bronze bg-bronze/10"
                : "border-line hover:border-slate/40 bg-surface"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${!shift ? "border-bronze bg-bronze" : "border-line"}`}>
                {!shift ? <span className="w-1.5 h-1.5 rounded-full bg-ground" /> : null}
              </span>
              <p className="font-semibold text-[13.5px] text-strong">Skip only</p>
            </div>
            <p className="text-[12px] text-muted pl-6 leading-snug">
              This session is lost. Rest of the week runs as scheduled.
              <br />
              <span className="text-ink">Cost:</span> −1 session this week. Progression order breaks if you&apos;re on a wave (5/3/1 etc.).
            </p>
          </button>

          <button
            type="button"
            onClick={() => setShift(true)}
            className={`w-full text-left rounded border p-3 space-y-1 ${
              shift
                ? "border-bronze bg-bronze/10"
                : "border-line hover:border-slate/40 bg-surface"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${shift ? "border-bronze bg-bronze" : "border-line"}`}>
                {shift ? <span className="w-1.5 h-1.5 rounded-full bg-ground" /> : null}
              </span>
              <p className="font-semibold text-[13.5px] text-strong">Skip &amp; shift the week</p>
            </div>
            <p className="text-[12px] text-muted pl-6 leading-snug">
              This session takes over the next scheduled strength day. Everything cascades one slot forward.
              <br />
              <span className="text-ink">Cost:</span> −1 session (the last one of the week drops). Progression order preserved — recommended for wave-based programs.
            </p>
          </button>
        </div>

        <div>
          <label className="mono-caps block mb-1" htmlFor="skip-reason">Reason (optional)</label>
          <input
            id="skip-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="travelling, hip flared, tired…"
            className="w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-bronze/40 focus:border-bronze"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-line rounded py-2 min-h-[44px] text-sm hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSkip(reason || undefined, shift)}
            className="flex-1 bg-bronze text-ground rounded py-2 min-h-[44px] text-sm font-semibold hover:bg-bronze-hover"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function MoveSheet({
  fromDate,
  onCancel,
  onConfirm,
}: {
  fromDate: string;
  onCancel: () => void;
  onConfirm: (toDate: string) => void;
}) {
  const [date, setDate] = useState(() => {
    const t = new Date(fromDate + "T12:00:00");
    t.setDate(t.getDate() + 1);
    return iso(t);
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "ms-title";
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
          <p id={titleId} className="font-semibold text-strong">Move today&apos;s session</p>
          <button type="button" onClick={onCancel} aria-label="Cancel" className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted">
          Session moves to the chosen date. Today is marked skipped-because-moved. Progression trajectory
          continues from wherever the last completed session landed.
        </p>
        <div>
          <label className="mono-caps block mb-1">Move to</label>
          <input
            type="date"
            value={date}
            min={iso(new Date())}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2 py-1.5 border border-line rounded bg-surface text-sm"
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
