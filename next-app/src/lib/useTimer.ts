"use client";

import { create } from "zustand";

type TimerState = {
  active: boolean;
  autoStart: number | null; // seconds — bump this number to trigger a restart
  seq: number; // increments so consumers detect repeat starts
  start: (seconds: number) => void;
  stop: () => void;
};

export const useTimer = create<TimerState>((set) => ({
  active: false,
  autoStart: null,
  seq: 0,
  start: (seconds) =>
    set((s) => ({ active: true, autoStart: seconds, seq: s.seq + 1 })),
  stop: () => set({ active: false, autoStart: null }),
}));
