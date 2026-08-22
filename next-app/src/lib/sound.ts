"use client";

import { readSoundPref } from "./useUserPrefs";

/**
 * Web Audio API-driven sound effects. Two use cases:
 *   playConfirm()       — short 880 Hz blip on Accept / Confirm / commit
 *   playTimerComplete() — 3-note ding when RestTimer hits zero
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

export function playTimerComplete(): void {
  if (!readSoundPref()) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const notes = [659.25, 880, 1318.51]; // E5, A5, E6
  notes.forEach((freq, i) => {
    tone(c, now + i * 0.14, freq, 0.18, 0.18);
  });
}
