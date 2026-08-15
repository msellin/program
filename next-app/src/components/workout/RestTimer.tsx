"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "60s", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
] as const;

type Props = {
  autoStartSeconds?: number | null;
  onClose?: () => void;
};

export function RestTimer({ autoStartSeconds, onClose }: Props) {
  const [target, setTarget] = useState<number>(autoStartSeconds ?? 120);
  const [elapsed, setElapsed] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(autoStartSeconds != null);
  const [hit, setHit] = useState<boolean>(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoStartSeconds != null) {
      setTarget(autoStartSeconds);
      setElapsed(0);
      setRunning(true);
      setHit(false);
    }
  }, [autoStartSeconds]);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  useEffect(() => {
    if (elapsed >= target && !hit) {
      setHit(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([80, 60, 80]);
      }
    }
  }, [elapsed, target, hit]);

  const remaining = Math.max(0, target - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const fmt = `${mins}:${String(secs).padStart(2, "0")}`;
  const pct = Math.min(1, elapsed / target);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-3 right-3 bottom-[calc(60px+env(safe-area-inset-bottom))] z-40 mx-auto max-w-[760px]"
    >
      <div className="rounded-lg border border-line bg-surface shadow-xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-line-soft relative">
          <div
            className={cn(
              "h-full transition-all duration-500",
              hit ? "bg-green" : "bg-bronze",
            )}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2 p-3">
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setElapsed(0);
              setHit(false);
            }}
            aria-label="Reset timer"
            className="w-10 h-10 flex items-center justify-center rounded hover:bg-surface-2 text-muted hover:text-ink"
          >
            <RotateCcw size={16} />
          </button>
          <div
            className={cn(
              "flex-1 text-center font-mono text-2xl font-semibold tabular-nums leading-none",
              hit ? "text-green" : "text-strong",
            )}
            aria-label={`${remaining} seconds remaining`}
          >
            {fmt}
          </div>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? "Pause timer" : "Start timer"}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full border",
              running ? "bg-amber text-ground border-amber" : "bg-bronze text-ground border-bronze",
            )}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close timer"
              className="w-10 h-10 flex items-center justify-center rounded hover:bg-surface-2 text-muted"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
        <div className="flex gap-1 px-3 pb-2 justify-center">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setTarget(p.seconds);
                setElapsed(0);
                setHit(false);
                setRunning(true);
              }}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[11px]",
                target === p.seconds
                  ? "bg-ink text-ground"
                  : "bg-line-soft text-muted hover:text-ink",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
