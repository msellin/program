"use client";

/**
 * Cut C · Week 4b redirect · /extras → /off-plan
 *
 * Extras route renamed to Off-plan per D3 (locked decisions 2026-08-21).
 * "Off-plan" reads honest — negation of Plan (the sibling tab under D4) —
 * without engineering-flavored language. "Absorb into Day peek-strip"
 * (the second half of D3) is deferred; rename alone lands 80% of the
 * semantic win per copy-clarity panel note.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExtrasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/off-plan/");
  }, [router]);
  return (
    <div className="mt-8 text-center">
      <p className="text-[14px] text-muted">
        Extras moved to <a href="/off-plan/" className="text-bronze underline">Off-plan</a>.
      </p>
      <p className="text-[12px] text-muted mt-2 italic">Redirecting…</p>
    </div>
  );
}
