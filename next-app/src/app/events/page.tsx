"use client";

import { useState } from "react";
import { CalendarDays, X, Plus } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import type { Store } from "@/lib/schemas";
import { useIsSuperAdmin } from "@/lib/super-admin";

type UserEvent = NonNullable<NonNullable<Store["user_profile"]>["events"]>[number];

// Stable empty-array reference for the zustand selector. Without this, the
// `?? []` fallback allocates a new [] on every selector call, zustand's
// referential-equality check sees "state changed" every render, and we get
// React error #185 (Maximum update depth exceeded). Founder hit this on
// /events/ 2026-08-17.
const EMPTY_EVENTS: UserEvent[] = [];

type Kind = "race" | "competition" | "travel" | "other";

const KIND_LABELS: Record<Kind, string> = {
  race: "Race",
  competition: "Competition",
  travel: "Travel",
  other: "Other",
};

/**
 * User-added events (races, competitions, travel, weddings). Each event's
 * date becomes a forced rest day in the plan generator — no strength
 * scheduled, no session card. Optional pre_deload_days and rest_days_after
 * extend the rest window either side.
 *
 * Use case: a custom-built program can't know your race calendar. Rather
 * than editing the JSON per race, you add events here and the plan adapts.
 */
export default function EventsPage() {
  const hydrated = useStore((s) => s.hydrated);
  const events = useStore((s) => s.store.user_profile?.events ?? EMPTY_EVENTS);
  const addEvent = useStore((s) => s.addEvent);
  const removeEvent = useStore((s) => s.removeEvent);
  const isSuperAdmin = useIsSuperAdmin();

  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("race");
  const [preDeload, setPreDeload] = useState<number>(0);
  const [restAfter, setRestAfter] = useState<number>(0);
  const [note, setNote] = useState("");
  const [removeTarget, setRemoveTarget] = useState<null | (typeof events)[number]>(null);

  const canAdd = date && name.trim();
  const submit = () => {
    if (!canAdd) return;
    addEvent({
      date,
      name,
      kind,
      pre_deload_days: preDeload || undefined,
      rest_days_after: restAfter || undefined,
      note: note || undefined,
    });
    setDate("");
    setName("");
    setKind("race");
    setPreDeload(0);
    setRestAfter(0);
    setNote("");
  };

  const upcoming = events
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = events
    .filter((e) => e.date < new Date().toISOString().slice(0, 10))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!hydrated) return <div className="pt-4 text-sm text-muted">Loading…</div>;

  if (!isSuperAdmin) {
    return (
      <div className="pt-8 pb-6 text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Not available</h1>
        <p className="text-sm text-muted">
          Events are in private beta. Ask Margus if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Events</h1>
        <p className="mt-1 text-sm text-muted">
          Races, competitions, travel — anything the plan should schedule around.
          Event dates become forced rest days. Optional deload window either side.
        </p>
      </header>

      {/* Add form */}
      <section className="rounded border border-line-soft bg-surface p-4 space-y-3">
        <p className="font-semibold text-sm text-strong">Add an event</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-[13px] text-muted">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
            />
          </label>
          <label className="text-[13px] text-muted">
            Kind
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="mt-1 w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
            >
              {(Object.keys(KIND_LABELS) as Kind[]).map((k) => (
                <option key={k} value={k}>{KIND_LABELS[k]}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-[13px] text-muted">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aug 29 running race"
            className="mt-1 w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-[13px] text-muted">
            Rest days before
            <input
              type="number"
              min={0}
              max={14}
              value={preDeload}
              onChange={(e) => setPreDeload(Number(e.target.value) || 0)}
              className="mt-1 w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
            />
          </label>
          <label className="text-[13px] text-muted">
            Rest days after
            <input
              type="number"
              min={0}
              max={14}
              value={restAfter}
              onChange={(e) => setRestAfter(Number(e.target.value) || 0)}
              className="mt-1 w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
            />
          </label>
        </div>
        <label className="block text-[13px] text-muted">
          Note (optional)
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. 5K trail race, goal 22 min"
            className="mt-1 w-full px-2 py-2 min-h-[44px] border border-line rounded bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={!canAdd}
          className="w-full inline-flex items-center justify-center gap-2 bg-bronze text-ground rounded py-2 min-h-[44px] text-sm font-semibold hover:bg-bronze-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Add event
        </button>
      </section>

      {/* Upcoming */}
      {upcoming.length ? (
        <section className="space-y-2">
          <h2 className="font-mono text-[13px] uppercase tracking-widest">Upcoming</h2>
          <ul className="rounded border border-line-soft divide-y divide-line-soft">
            {upcoming.map((ev) => (
              <EventRow key={ev.id} event={ev} onRemove={() => setRemoveTarget(ev)} />
            ))}
          </ul>
        </section>
      ) : null}

      {/* Past */}
      {past.length ? (
        <section className="space-y-2">
          <h2 className="font-mono text-[13px] uppercase tracking-widest text-muted">Past</h2>
          <ul className="rounded border border-line-soft divide-y divide-line-soft opacity-70">
            {past.slice(0, 10).map((ev) => (
              <EventRow key={ev.id} event={ev} onRemove={() => setRemoveTarget(ev)} />
            ))}
          </ul>
        </section>
      ) : null}

      {!events.length ? (
        <p className="text-[13px] text-muted italic">
          No events yet. Add a race or competition above — Today and Week will schedule around it.
        </p>
      ) : null}

      <ConfirmSheet
        open={!!removeTarget}
        title={removeTarget ? `Remove "${removeTarget.name}"?` : ""}
        body="Your plan will no longer skip strength on this date."
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (removeTarget) removeEvent(removeTarget.id);
          setRemoveTarget(null);
        }}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function EventRow({
  event,
  onRemove,
}: {
  event: UserEvent;
  onRemove: () => void;
}) {
  const humanDate = new Date(event.date + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <li className="flex items-center gap-2 px-3 py-3">
      <CalendarDays size={16} className="text-muted flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-strong truncate">{event.name}</p>
        <p className="text-[11px] text-muted mt-0.5 truncate">
          {humanDate}
          {event.kind ? ` · ${KIND_LABELS[event.kind]}` : ""}
          {event.pre_deload_days ? ` · ${event.pre_deload_days}d before` : ""}
          {event.rest_days_after ? ` · ${event.rest_days_after}d after` : ""}
        </p>
        {event.note ? (
          <p className="text-[11px] text-muted italic mt-0.5 truncate">{event.note}</p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={`Remove ${event.name}`}
        onClick={onRemove}
        className="text-muted hover:text-red w-9 h-9 flex items-center justify-center rounded flex-shrink-0"
      >
        <X size={14} />
      </button>
    </li>
  );
}
