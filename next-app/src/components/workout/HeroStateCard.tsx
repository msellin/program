"use client";

import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { StreakChip } from "@/components/StreakChip";

type Copy = { title: string; sub: string; tone: "green" | "amber" | "red" | "neutral" };

const COPY: Record<string, Copy> = {
  green: { title: "Ready to work", sub: "Progress today. Feel it.", tone: "green" },
  amber: { title: "Load with care", sub: "Hold today's prescription. Don't push.", tone: "amber" },
  red: { title: "Ease off today", sub: "Reduce load or take rest. Listen to the signals.", tone: "red" },
  none: {
    title: "No check yet",
    sub: "Save a morning check to calibrate today.",
    tone: "neutral",
  },
};

export function HeroStateCard({ date }: { date: string }) {
  const derived = useStore((s) => s.store.logs[date]?.derived_state ?? null);
  const symptoms = useStore((s) => s.store.logs[date]?.symptoms ?? null);
  const isToday = date === todayISO();
  const state = derived ?? (symptoms ? "green" : "none");
  const copy = COPY[state] ?? COPY.none;

  const toneRing =
    copy.tone === "green"
      ? "ring-1 ring-green/30 bg-green/10"
      : copy.tone === "amber"
        ? "ring-1 ring-amber/30 bg-amber/10"
        : copy.tone === "red"
          ? "ring-1 ring-red/30 bg-red/10"
          : "ring-1 ring-line bg-surface";

  const dotColour =
    copy.tone === "green"
      ? "bg-green"
      : copy.tone === "amber"
        ? "bg-amber"
        : copy.tone === "red"
          ? "bg-red"
          : "bg-muted";

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 text-[12.5px] text-muted">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColour}`} />
          <span>{isToday ? "Today" : formatShort(date)}</span>
        </div>
        <StreakChip />
      </div>
      <p className="text-2xl font-semibold mt-2 text-strong">{copy.title}</p>
      <p className="text-[14px] text-muted mt-1">{copy.sub}</p>
    </>
  );

  if (!isToday) {
    // Non-today: not clickable — Check tab only makes sense for today.
    return (
      <div className={`block rounded-lg p-4 ${toneRing}`}>{content}</div>
    );
  }
  return (
    <Link
      href="/check/"
      className={`block rounded-lg p-4 ${toneRing} transition-colors active:scale-[0.98]`}
    >
      {content}
    </Link>
  );
}

function formatShort(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
