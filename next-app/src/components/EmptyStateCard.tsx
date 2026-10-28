"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

/**
 * Shared empty-state block. Every tab that shows "nothing here yet" copy
 * uses this component so the H1, subtext, and CTA button match across
 * Today / Week / Progress / History / Report / Extras.
 *
 * Founder observed 2026-08-17 on test@terav.fit that per-tab empty states
 * were massively inconsistent — different H1 sizes (text-h3 / text-h1 /
 * text-3xl), different CTA verbs ("Browse programs" / "Pick your program"
 * / "Start a program" / "Pick a program"), different button styles, some
 * inside dashed cards, some not. This is the one-shape fix.
 */
export function EmptyStateCard({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="pt-4 space-y-3">
      <h1 className="text-h1 tracking-tight text-strong">{title}</h1>
      <p className="text-small text-muted leading-relaxed max-w-lg">{body}</p>
      {cta ? (
        <Button href={cta.href}>
          {cta.label}
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
