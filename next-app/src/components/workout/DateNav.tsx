"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { today as todayISO, iso, cn } from "@/lib/utils";

type Props = {
  date: string;
  onChange: (d: string) => void;
};

export function DateNav({ date, onChange }: Props) {
  const shift = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    onChange(iso(d));
  };
  const isToday = date === todayISO();
  const parsed = new Date(date + "T12:00:00");
  const label = parsed.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center gap-1.5 rounded border border-line bg-surface p-1">
      <button
        type="button"
        onClick={() => shift(-1)}
        aria-label="Previous day"
        className="w-11 h-11 flex items-center justify-center rounded text-muted hover:bg-surface-2 hover:text-ink focus:bg-surface-2 focus:text-ink active:bg-line-soft"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="flex-1 text-center">
        <p className="text-[15px] font-semibold text-strong leading-tight">{label}</p>
        <p className="mono-caps mt-0.5">
          {isToday ? "Today" : offsetLabel(date)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => shift(1)}
        aria-label="Next day"
        className="w-11 h-11 flex items-center justify-center rounded text-muted hover:bg-surface-2 hover:text-ink focus:bg-surface-2 focus:text-ink active:bg-line-soft"
      >
        <ChevronRight size={18} />
      </button>
      <button
        type="button"
        onClick={() => onChange(todayISO())}
        disabled={isToday}
        aria-label={isToday ? "Currently on today" : "Jump to today"}
        aria-hidden={isToday}
        tabIndex={isToday ? -1 : 0}
        className={cn(
          "w-11 h-11 flex items-center justify-center rounded",
          isToday
            ? "invisible pointer-events-none"
            : "hover:bg-surface-2 text-bronze",
        )}
      >
        <Home size={16} />
      </button>
    </div>
  );
}

function offsetLabel(date: string): string {
  const t = new Date(todayISO() + "T12:00:00");
  const d = new Date(date + "T12:00:00");
  const days = Math.round((d.getTime() - t.getTime()) / 864e5);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `+${days} days`;
  return `${days} days`;
}
