"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/session/shared/BottomSheet";
import { RunSlotCard } from "@/components/workout/RunSlotCard";
import { humanBlockName } from "@/lib/day-format";
import type { Program } from "@/lib/schemas";

/**
 * Off-plan sheet from the Day redesign — the single footer line in Brief
 * replaces the old `/off-plan` dashboard block + RunSlotCard entry point
 * on Day itself (README's "what moves off Day" table).
 *
 * "Log an activity" embeds the existing `RunSlotCard` form directly
 * (same component, same store actions — not rebuilt). The drill list
 * links to the existing `/off-plan` page rather than faking in-sheet
 * drill completion: the design mockup's drill rows are themselves
 * non-interactive stubs (`onClick` just closes the sheet), so building
 * fake interactivity here would be inventing behavior the reference
 * doesn't actually specify.
 */
export function OffPlanSheet({
  program,
  date,
  onClose,
}: {
  program: Program;
  date: string;
  onClose: () => void;
}) {
  const [loggingActivity, setLoggingActivity] = useState(false);
  const drillBlocks =
    program.blocks?.filter((b) => b.category === "accessory" || b.category === "run") ?? [];
  const drillCount = drillBlocks.reduce((n, b) => n + (b.items?.length ?? 0), 0);

  return (
    <BottomSheet titleId="off-plan-title" onClose={onClose}>
      <p id="off-plan-title" className="text-[16px] font-semibold text-strong mb-1 tracking-[-.015em]">
        Off-plan
      </p>
      <p className="text-[13.5px] leading-snug text-ink mb-[14px]">
        Anything that isn&apos;t the program. Logs to today, doesn&apos;t touch the progression.
      </p>

      {loggingActivity ? (
        <div className="mb-3">
          <RunSlotCard date={date} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setLoggingActivity(true)}
          className="w-full flex items-center justify-between gap-3 rounded border border-line-strong bg-surface-2 px-3.5 py-[13px] mb-[14px] text-left"
        >
          <span className="min-w-0">
            <span className="block text-[14.5px] font-semibold text-strong mb-0.5 tracking-[-.01em]">
              Log an activity
            </span>
            <span className="block text-[13px] text-ink">A run, a row, a class — time and effort</span>
          </span>
          <span className="flex-shrink-0 text-[15px] text-line">›</span>
        </button>
      )}

      {drillBlocks.length ? (
        <>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-line mb-2.5">
            Or pick a drill
          </p>
          <Link
            href="/off-plan/"
            className="flex items-center justify-between gap-3 rounded border border-line-soft bg-ground px-3.5 py-3 mb-3"
          >
            <span className="text-[14.5px] font-semibold text-strong tracking-[-.01em]">
              {drillCount} drill{drillCount === 1 ? "" : "s"} available
            </span>
            <span className="flex-shrink-0 text-[15px] text-line">›</span>
          </Link>
          <ul className="text-[13px] text-ink space-y-0.5 mb-3">
            {drillBlocks.slice(0, 4).map((b) => (
              <li key={b.id} className="truncate">
                · {humanBlockName(b.name)}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        className="w-full h-[50px] rounded-[10px] border border-line-strong text-ink text-[15px]"
      >
        Close
      </button>
    </BottomSheet>
  );
}
