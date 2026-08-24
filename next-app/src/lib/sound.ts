"use client";

import { readSoundPref } from "./useUserPrefs";

/**
 * Web Audio API-driven sound effects. Three use cases:
 *   playConfirm()        — short 880 Hz blip on Accept / Confirm / commit
 *   playCountdownTick()  — quiet click at 3, 2, 1 before rest ends
 *   playTimerComplete()  — the rest-over chime
 *
 * Both gated on the `Sound effects` Settings toggle via readSoundPref().
 * Uses synthesized tones (no audio assets, no network, works offline).
 *
 * iOS Safari note: AudioContext creation and the first sound must be
 * inside a user-gesture stack. `playConfirm` fires from tap handlers;
 * `playTimerComplete` fires from a setInterval but by then the context
 * has already been created inside the gesture that started the timer.
 * If the context lands in `suspended` we attempt `.resume()`.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  return ctx;
}

function tone(
  c: AudioContext,
  startAt: number,
  freq: number,
  duration: number,
  peak: number,
): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

export function playConfirm(): void {
  if (!readSoundPref()) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  tone(c, now, 880, 0.12, 0.14);
}

/**
 * The 3-2-1 lead-in. Deliberately quiet and short — it should read as
 * "get ready", clearly not as "go". The end chime is the event; this is
 * the warning that it's coming, which is what was missing: the only
 * pre-zero cue used to be an `aria-live` announcement, silent unless a
 * screen reader was running.
 */
export function playCountdownTick(): void {
  if (!readSoundPref()) return;
  const c = getCtx();
  if (!c) return;
  tone(c, c.currentTime, 587.33, 0.07, 0.09); // D5
}

/**
 * Rest-over chime. Was three notes over ~0.46s at peak 0.18 — easy to
 * miss mid-set in a loud gym, which is exactly what happened in testing
 * (2026-08-24). Now ~1.3s: an alternating two-note figure repeated, then
 * a held final note. Longer, a little louder, and rhythmically distinct
 * from `playConfirm`'s single blip so the two can't be confused.
 */
export function playTimerComplete(): void {
  if (!readSoundPref()) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // A5 / D6 alternating — an interval that carries over background noise
  // better than the old rising triad — resolving up to E6, held.
  const figure = [880, 1174.66, 880, 1174.66];
  figure.forEach((freq, i) => {
    tone(c, now + i * 0.18, freq, 0.16, 0.22);
  });
  tone(c, now + figure.length * 0.18, 1318.51, 0.55, 0.22); // E6, held
}
