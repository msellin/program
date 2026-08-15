"use client";

import { useTimer } from "@/lib/useTimer";
import { RestTimer } from "./RestTimer";

export function RestTimerHost() {
  const active = useTimer((s) => s.active);
  const autoStart = useTimer((s) => s.autoStart);
  const stop = useTimer((s) => s.stop);
  if (!active) return null;
  return <RestTimer autoStartSeconds={autoStart} onClose={stop} />;
}
