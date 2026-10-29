"use client";

import { useEffect, useState } from "react";

/**
 * F8 Batch 29 · user preferences persisted to localStorage. Simple boolean
 * toggles for now (sound + haptic). Theme + language are placeholder rows
 * in Settings — no useTheme / useLocale hooks needed yet.
 *
 * SSR-safe: reads default value on server, hydrates client value after mount.
 */

const KEYS = {
  sound: "terav.pref.sound",
  haptic: "terav.pref.haptic",
  demoAutoplay: "terav.pref.demo-autoplay",
} as const;

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw == null) return fallback;
  return raw === "true";
}

function useBoolPref(key: string, fallback: boolean) {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    setValue(readBool(key, fallback));
  }, [key, fallback]);
  const update = (v: boolean) => {
    setValue(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, String(v));
    }
  };
  return [value, update] as const;
}

export function useSoundPref() {
  return useBoolPref(KEYS.sound, true);
}

export function useHapticPref() {
  return useBoolPref(KEYS.haptic, true);
}

/**
 * Synchronous getter for gating side-effect calls (Audio, navigator.vibrate)
 * without pulling in a hook. Returns the fallback on SSR or unset key.
 */
export function readSoundPref(): boolean {
  return readBool(KEYS.sound, true);
}

export function readHapticPref(): boolean {
  return readBool(KEYS.haptic, true);
}

/**
 * Demo clips play on their own (owner decision, 2026-10-29). OFF until the
 * user says yes: the prompt after their first "Watch demo" tap, or Settings.
 * An unset key means "never asked", which is the only time we ask.
 */
export function useDemoAutoplayPref() {
  return useBoolPref(KEYS.demoAutoplay, false);
}

export function demoAutoplayAsked(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem(KEYS.demoAutoplay) != null;
}

export function readDemoAutoplayPref(): boolean {
  return readBool(KEYS.demoAutoplay, false);
}
