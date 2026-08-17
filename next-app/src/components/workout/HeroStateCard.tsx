"use client";

import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";

type Copy = { title: string; sub: string; tone: "green" | "amber" | "red" | "neutral" };

const COPY: Record<string, Copy> = {
  green: { title: "Green", sub: "Progress load. Nothing above 3/10 in your check.", tone: "green" },
  amber: { title: "Amber", sub: "Hold load. A 4-5/10 or morning stiffness over 30 min.", tone: "amber" },
  red: { title: "Red", sub: "Back off. Something above 5/10 or a red flag noted.", tone: "red" },
  none: {
    title: "No check yet",
    sub: "Save a morning check to calibrate today's load.",
    tone: "neutral",
  },
};

export function HeroStateCard({ date }: { date: string }) {
  const derived = useStore((s) => s.store.logs[date]?.derived_state ?? null);
  const symptoms = useStore((s) => s.store.logs[date]?.symptoms ?? null);
  const isToday = date === todayISO();
  const state = derived ?? (symptoms ? "green" : "none");
  const copy = COPY[state] ?? COPY.none;

  const dotColour =
    copy.tone === "green"
      ? "bg-green"
      : copy.tone === "amber"
        ? "bg-amber"
        : copy.tone === "red"
          ? "bg-red"
          : "bg-muted";
  const textColour =
    copy.tone === "green"
      ? "text-green"
      : copy.tone === "amber"
        ? "text-amber"
        : copy.tone === "red"
          ? "text-red"
          : "text-muted";

  // COMPACT mode — check already saved. The state is already surfaced by the
  // readiness dot in the top nav; here we render a single-line strip so the
  // primary session content dominates the fold. Tappable as a shortcut back
  // to the Check page for adjustments.
  if (isToday && state !== "none") {
    const escalate = state === "red";
    return (
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <Link href="/check/" className="flex items-center gap-2 hover:opacity-80">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColour}`} />
          <span className={`font-mono uppercase tracking-wider ${textColour}`}>{copy.title}</span>
          <span className="text-muted">· {copy.sub}</span>
        </Link>
        {escalate ? (
          <Link
            href="/guide/#red-flags"
            className="font-mono text-[11px] text-red border-b border-red/50 hover:opacity-80 whitespace-nowrap"
          >
            Escalate →
          </Link>
        ) : null}
      </div>
    );
  }

  // FULL card — only when today has no check yet, OR when viewing another day.
  const toneRing =
    copy.tone === "green"
      ? "ring-1 ring-green/30 bg-green/10"
      : copy.tone === "amber"
        ? "ring-1 ring-amber/30 bg-amber/10"
        : copy.tone === "red"
          ? "ring-1 ring-red/30 bg-red/10"
          : "ring-1 ring-line bg-surface";

  const content = (
    <>
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <span className={`w-2 h-2 rounded-full ${dotColour}`} />
        <span>{isToday ? "Today" : formatShort(date)}</span>
      </div>
      <p className="text-2xl font-semibold mt-2 text-strong">{copy.title}</p>
      <p className="text-[14px] text-muted mt-1">{copy.sub}</p>
    </>
  );

  if (!isToday) {
    return <div className={`block rounded-lg p-4 ${toneRing}`}>{content}</div>;
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
