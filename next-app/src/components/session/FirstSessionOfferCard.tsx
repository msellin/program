"use client";

import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { firstSessionOffer, FIRST_SESSION_MOVE_REASON } from "@/lib/engine/first-session";

/**
 * G-01 Today side: a new sign-up whose day 1 is a rest day gets one tap to pull
 * the next planned session forward to today. Derivation lives in
 * `lib/engine/first-session.ts`; this only renders and applies the move.
 */
export function FirstSessionOfferCard({ slug }: { slug: string }) {
  const store = useStore((s) => s.store);
  const moveWholeDay = useStore((s) => s.moveWholeDay);
  const today = todayISO();
  const offer = firstSessionOffer(store, slug, today);
  if (!offer) return null;
  return (
    <button
      type="button"
      onClick={() => moveWholeDay(offer.fromDate, today, FIRST_SESSION_MOVE_REASON)}
      className="w-full min-h-[52px] rounded-lg bg-bronze text-ground font-semibold text-[15px] hover:bg-bronze-hover active:bg-bronze-active focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-strong"
    >
      Start your first session now
    </button>
  );
}
