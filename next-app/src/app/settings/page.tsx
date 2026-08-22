"use client";

import Link from "next/link";
import { ChevronLeft, Volume2, Vibrate, Palette, Languages, Download } from "lucide-react";
import { useHapticPref, useSoundPref } from "@/lib/useUserPrefs";
import { useInstallPrompt } from "@/lib/useInstallPrompt";
import { hapticTap } from "@/lib/utils";
import { playConfirm } from "@/lib/sound";

/**
 * F8 Batch 29 · Settings v1.
 *
 * Live toggles: sound (gates lib/sound.ts — Accept/Confirm blip + rest-
 * timer 3-note ding), haptic (gates existing hapticTap). Theme + language
 * are placeholder rows with "coming soon" captions — visible roadmap
 * without a broken toggle. Add-to-home-screen row absorbs the P2-8
 * install prompt from Profile More.
 */
export default function SettingsPage() {
  const [sound, setSound] = useSoundPref();
  const [haptic, setHaptic] = useHapticPref();
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <div className="mt-6 space-y-6 max-w-md mx-auto">
      <Link
        href="/"
        aria-label="Back to Today"
        className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-ink"
      >
        <ChevronLeft size={16} />
        Back
      </Link>

      {/* Batch 36 · H1 sized per v1.1.1 §1 h1-display (32px). Settings
          is a top-level route; carries the display H1 like Progress /
          Profile / Programs / History / Week. */}
      <h1
        className="text-[32px] font-semibold tracking-tight text-strong leading-none"
        tabIndex={-1}
      >
        Settings
      </h1>

      <Section eyebrow="Sound">
        <ToggleRow
          icon={<Volume2 size={16} className="text-muted" aria-hidden />}
          label="Sound effects"
          hint="Timer complete, Accept confirm."
          value={sound}
          onToggle={(v) => {
            setSound(v);
            hapticTap("light");
            // Preview the sound on toggle-ON so users can confirm audio
            // actually plays (previously the toggle was a no-op placeholder).
            if (v) {
              // The store write happens synchronously via localStorage;
              // playConfirm reads the same key, so this fires audibly.
              queueMicrotask(() => playConfirm());
            }
          }}
        />
      </Section>

      <Section eyebrow="Haptics">
        <ToggleRow
          icon={<Vibrate size={16} className="text-muted" aria-hidden />}
          label="Haptic feedback"
          hint="Buzz on tap, accept, skip."
          value={haptic}
          onToggle={(v) => {
            setHaptic(v);
            if (v) hapticTap("medium");
          }}
        />
      </Section>

      <Section eyebrow="Appearance">
        <PlaceholderRow
          icon={<Palette size={16} className="text-muted" aria-hidden />}
          label="Theme"
          value="Dark (default)"
          hint="Light theme coming soon."
        />
      </Section>

      <Section eyebrow="Language">
        <PlaceholderRow
          icon={<Languages size={16} className="text-muted" aria-hidden />}
          label="Language"
          value="English"
          hint="Estonian, Finnish coming soon."
        />
      </Section>

      {canInstall ? (
        <Section eyebrow="Install">
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] rounded border border-line-soft bg-surface active:bg-line-soft/50 text-left"
          >
            <span className="flex items-center gap-3 text-sm text-strong">
              <Download size={16} className="text-muted" aria-hidden />
              Add to home screen
            </span>
            <ChevronLeft size={16} className="text-muted rotate-180" aria-hidden />
          </button>
        </Section>
      ) : null}
    </div>
  );
}

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {eyebrow}
      </p>
      {children}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onToggle(!value)}
      className="w-full flex items-center justify-between gap-3 px-3 py-3 min-h-[56px] rounded border border-line-soft bg-surface active:bg-line-soft/50 text-left"
    >
      <span className="flex items-start gap-3 min-w-0 flex-1">
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
        <span className="min-w-0">
          <span className="block text-sm text-strong">{label}</span>
          <span className="block text-[12px] text-muted mt-0.5">{hint}</span>
        </span>
      </span>
      <span
        aria-hidden
        className={`inline-flex h-6 w-11 rounded-full border transition-colors flex-shrink-0 ${
          value
            ? "bg-bronze border-bronze"
            : "bg-line-soft border-line-soft"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-surface my-0.5 transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function PlaceholderRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="w-full flex items-center justify-between gap-3 px-3 py-3 min-h-[56px] rounded border border-line-soft bg-surface opacity-70">
      <span className="flex items-start gap-3 min-w-0 flex-1">
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
        <span className="min-w-0">
          <span className="block text-sm text-strong">{label}</span>
          <span className="block text-[12px] text-muted mt-0.5">{hint}</span>
        </span>
      </span>
      <span className="font-mono text-[12px] text-muted flex-shrink-0">{value}</span>
    </div>
  );
}
