"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/useStore";

type Slide = {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "01 — Your plan is live",
    title: "Today shows one session at a time.",
    body: (
      <>
        <p>
          Every day, Today prescribes the exact session your plan says you should do. Tap any block to
          expand — you&apos;ll see sets, reps, weight, notes, and (for logged exercises) the sets you
          did last time as a reference.
        </p>
        <p>
          Log what you actually did as you go. The engine reads from what you log — never from what
          the plan prescribed.
        </p>
      </>
    ),
  },
  {
    eyebrow: "02 — The morning check",
    title: "One-minute tap. Adjusts today.",
    body: (
      <>
        <p>
          Score how you feel (0-10) across a few regions the morning after training. Save it, and
          Today&apos;s prescription auto-adjusts: amber = −5% load, red = −10%.
        </p>
        <p className="text-muted">
          You can skip a check. The plan holds. Missing checks is fine; the engine reads them when
          they exist, ignores when they don&apos;t.
        </p>
      </>
    ),
  },
  {
    eyebrow: "03 — Proposes, never imposes",
    title: "Every change asks first.",
    body: (
      <>
        <p>
          When the engine sees a pattern that would change your plan — a signal in your notes, a
          missed session, cycle-end results — it proposes the change as a card. You Accept or Ignore.
        </p>
        <p>
          Nothing changes silently. If you don&apos;t tap, the plan continues as prescribed.
        </p>
      </>
    ),
  },
  {
    eyebrow: "04 — Where to look",
    title: "Five tabs. One overflow menu.",
    body: (
      <>
        <p className="space-y-1.5">
          <span className="block"><strong>Today</strong> — the session you&apos;re prescribed.</span>
          <span className="block"><strong>Week</strong> — the 7-day rhythm.</span>
          <span className="block"><strong>Progress</strong> — training maxes, retest metrics, trends.</span>
          <span className="block"><strong>History</strong> — every logged session, replayable.</span>
          <span className="block"><strong>Profile</strong> — account, active plans, menu.</span>
        </p>
        <p className="text-muted">
          The <span className="font-mono">⋮</span> menu (top right) holds Programs, Check, Extras, Coach, Report, Data, Guide.
        </p>
      </>
    ),
  },
  {
    eyebrow: "05 — Log honest, skip cleanly",
    title: "The plan responds to what really happened.",
    body: (
      <>
        <p>
          Did the session? Log it. Skipped it? Tap Skip and (optionally) a reason. Did something
          different (a WOD, a run)? Backdate to yesterday and log the extras.
        </p>
        <p className="text-muted">
          The engine reads what you logged. Missing entries look like nothing happened — no penalty,
          no shame, just a gap in the record.
        </p>
      </>
    ),
  },
];

/**
 * Intro gallery — shown once, per program, after the user picks a program.
 * Explains logging, morning checks, confirm-first cycle, and nav. Dismissible.
 * The flag is stored in localStorage per (userProfile.uid, program.slug) so it
 * fires exactly once per program pick and doesn't re-fire after browser sync.
 */
export function IntroGallery() {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!hydrated || !activeSlug || typeof window === "undefined") return;
    const key = `program.intro-gallery.seen.${activeSlug}`;
    // Bug fix 2026-08-17: OnboardingRunner (B3) and IntroGallery both fire on
    // fresh signup and both use `fixed inset-0 z-50`, so they stack — the
    // later-rendered IntroGallery paints on top and swallows every click meant
    // for OnboardingRunner's Skip / Next buttons. Wait for onboarding to be
    // dismissed before opening the gallery. Re-check on the custom
    // `terav:onboarding-done` event OnboardingRunner fires at dismiss time.
    const check = () => {
      if (window.localStorage.getItem(key) === "1") return;
      const onboardingDone =
        window.localStorage.getItem(`program.onboarding.done.${activeSlug}`) === "1";
      if (onboardingDone) setOpen(true);
    };
    check();
    window.addEventListener("terav:onboarding-done", check);
    return () => window.removeEventListener("terav:onboarding-done", check);
  }, [hydrated, activeSlug]);

  const close = () => {
    if (activeSlug && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(`program.intro-gallery.seen.${activeSlug}`, "1");
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    setIdx(0);
  };

  if (!open) return null;

  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-ground/80 flex items-end sm:items-center justify-center p-3"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-surface border border-line rounded-lg p-5 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-bronze">
            {slide.eyebrow}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-muted hover:text-ink w-9 h-9 -m-2 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-strong leading-tight">{slide.title}</h2>

        <div className="text-sm text-ink leading-relaxed space-y-2.5 min-h-[9rem]">
          {slide.body}
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-1">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-bronze" : "w-1.5 bg-line hover:bg-slate/40"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          {idx > 0 ? (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-muted hover:bg-line-soft min-h-[40px]"
            >
              <ChevronLeft size={13} />
              Back
            </button>
          ) : null}
          {isLast ? (
            <button
              type="button"
              onClick={() => {
                close();
                router.push("/");
              }}
              className="flex-1 font-mono text-[12px] uppercase tracking-wider px-4 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[40px]"
            >
              Take me to Today
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(SLIDES.length - 1, i + 1))}
              className="flex-1 flex items-center justify-center gap-1 font-mono text-[12px] uppercase tracking-wider px-4 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[40px]"
            >
              Next
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
