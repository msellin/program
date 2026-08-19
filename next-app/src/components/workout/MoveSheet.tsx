"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { hapticTap, iso } from "@/lib/utils";
import { useStore } from "@/lib/useStore";

/**
 * F6 (Batch 24) — MoveSheet.
 *
 * Bottom sheet for "move this day's session to another day." Radio-list
 * of the current week's other days + optional next-week overflow, each
 * annotated with what's already scheduled there so the user can see what
 * they're stacking onto. Optional "why?" text captures `override.reason`.
 *
 * Confirm-first: selecting a radio does NOT commit. Only the sticky
 * "Move session" primary at the bottom commits. Design brief:
 * `dev/audits/app/2026-08-19-design-brief-features.md` §F6.
 */

type DayEntry = {
  dateISO: string;
  label: string;   // "Mon 17 Aug"
  hasSession: boolean;
  summary: string; // "Barbell reintro + Zone 1/2" / "Rest day" / "Logged"
  isSource: boolean;
  isLogged: boolean;
};

export function MoveSheet({
  open,
  fromDate,
  fromLabel,
  sessionSummary,
  blockIds,
  weekDays,
  onClose,
}: {
  open: boolean;
  /** ISO date being moved from. */
  fromDate: string;
  /** "Wed 19 Aug" style label for the header. */
  fromLabel: string;
  /** e.g. "Barbell reintro session" — sits under the sheet header. */
  sessionSummary: string;
  /** Block IDs that should copy to the target date via the override. */
  blockIds: string[];
  /** All candidate target days: this week + next week, minus the source. */
  weekDays: DayEntry[];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, onClose, open);
  const moveSession = useStore((s) => s.moveSession);

  const [selected, setSelected] = useState<string | null>(null);
  const [confirmedStack, setConfirmedStack] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setConfirmedStack(null);
    setReason("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // P1-62 (Batch 26) — the focus-trap picks first-DOM-focusable which
    // is the close X. Design intent: user lands on a target-day radio.
    // Explicitly focus the first non-source, non-disabled radio after
    // the panel mounts.
    const raf = requestAnimationFrame(() => {
      const firstRadio = panelRef.current?.querySelector<HTMLInputElement>(
        'input[type="radio"]:not(:disabled)',
      );
      firstRadio?.focus({ preventScroll: true });
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
    };
  }, [open, onClose]);

  // Group days: this week (Mon-Sun bracketing fromDate) vs. next week.
  const { thisWeek, nextWeek } = useMemo(() => splitWeeks(weekDays, fromDate), [weekDays, fromDate]);

  const targetHasSession =
    selected != null &&
    weekDays.find((d) => d.dateISO === selected)?.hasSession === true;
  const needsSecondTap = targetHasSession && confirmedStack !== selected;

  if (!open) return null;

  const commit = () => {
    if (!selected) return;
    if (needsSecondTap) {
      setConfirmedStack(selected);
      return;
    }
    hapticTap("medium");
    moveSession(fromDate, selected, blockIds, reason);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="movesheet-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ground/80 flex items-end sm:items-center justify-center"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-surface-2 border border-line rounded-t-lg sm:rounded-lg max-h-[85vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header — sticky at the top of the sheet body */}
        <div className="flex items-start justify-between gap-3 p-4 pb-2 border-b border-line-soft">
          <div className="min-w-0 flex-1">
            <p id="movesheet-title" className="font-semibold text-strong pr-4">
              Move {fromLabel}&rsquo;s session
            </p>
            <p className="text-[13px] text-muted mt-0.5 truncate">{sessionSummary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close move sheet"
            className="text-muted hover:text-ink w-11 h-11 flex items-center justify-center flex-shrink-0 -mt-2 -mr-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable list — radios, this week + next week */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <DayList
            heading="This week"
            days={thisWeek}
            selected={selected}
            fromDate={fromDate}
            onPick={(d) => {
              setSelected(d);
              setConfirmedStack(null);
            }}
          />
          {nextWeek.length > 0 ? (
            <DayList
              heading="Next week"
              days={nextWeek}
              selected={selected}
              fromDate={fromDate}
              onPick={(d) => {
                setSelected(d);
                setConfirmedStack(null);
              }}
            />
          ) : null}

          {targetHasSession && selected ? (
            <p
              role="alert"
              className="text-[12px] text-amber border-l-4 border-amber pl-2 leading-snug"
            >
              {confirmedStack === selected
                ? "OK — this will stack two sessions on that day."
                : "That day already has a session. Tap Move session again to confirm you want to stack them."}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="movesheet-reason"
              className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1"
            >
              Why? (optional)
            </label>
            <input
              id="movesheet-reason"
              type="text"
              maxLength={80}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family thing came up"
              className="w-full text-[14px] px-3 py-2 min-h-[44px] border border-line rounded bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
            />
          </div>
        </div>

        {/* Sticky primary. Confirm-first: this is the only commit path. */}
        <div className="p-3 border-t border-line-soft">
          <button
            type="button"
            onClick={commit}
            disabled={!selected}
            className="w-full inline-flex items-center justify-center gap-2 bg-bronze text-ground rounded py-2 min-h-[44px] text-sm font-semibold hover:bg-bronze-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {needsSecondTap ? "Confirm — stack the session" : "Move session"}
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DayList({
  heading,
  days,
  selected,
  fromDate,
  onPick,
}: {
  heading: string;
  days: DayEntry[];
  selected: string | null;
  fromDate: string;
  onPick: (dateISO: string) => void;
}) {
  return (
    <fieldset>
      <legend className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
        {heading}
      </legend>
      <ul className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
        {days.map((d) => {
          const isSource = d.dateISO === fromDate;
          const isSelected = selected === d.dateISO;
          return (
            <li key={d.dateISO}>
              <label
                htmlFor={`movesheet-day-${d.dateISO}`}
                className={
                  isSource
                    ? "flex items-center gap-3 px-3 py-3 min-h-[48px] text-muted italic cursor-not-allowed"
                    : "flex items-center gap-3 px-3 py-3 min-h-[48px] cursor-pointer active:bg-line-soft/50"
                }
              >
                <input
                  id={`movesheet-day-${d.dateISO}`}
                  type="radio"
                  name="movesheet-target"
                  value={d.dateISO}
                  checked={isSelected}
                  disabled={isSource}
                  onChange={() => onPick(d.dateISO)}
                  className="w-4 h-4 accent-bronze flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-strong">{d.label}</p>
                  <p className="text-[11px] text-muted truncate">
                    {isSource ? "moving from here" : d.summary}
                  </p>
                </div>
                {d.hasSession && !isSource ? (
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/20 text-amber flex-shrink-0">
                    has session
                  </span>
                ) : null}
                {d.isLogged ? (
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-green/20 text-green flex-shrink-0">
                    logged
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function splitWeeks(days: DayEntry[], fromDate: string): { thisWeek: DayEntry[]; nextWeek: DayEntry[] } {
  const from = new Date(fromDate + "T00:00:00");
  const monday = new Date(from);
  const dayOfWeek = (from.getDay() + 6) % 7; // 0 = Mon
  monday.setDate(from.getDate() - dayOfWeek);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const nextSunday = new Date(monday);
  nextSunday.setDate(monday.getDate() + 13);

  const mondayISO = iso(monday);
  const sundayISO = iso(sunday);
  const nextSundayISO = iso(nextSunday);

  const thisWeek = days.filter((d) => d.dateISO >= mondayISO && d.dateISO <= sundayISO);
  const nextWeek = days.filter((d) => d.dateISO > sundayISO && d.dateISO <= nextSundayISO);
  return { thisWeek, nextWeek };
}
