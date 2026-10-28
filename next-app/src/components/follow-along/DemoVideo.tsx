"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tap-to-load demo video (2026-10-28). Nothing is requested from YouTube, and no
 * iframe exists, until the user taps "Watch demo": the privacy page promises
 * exactly that. Official embed only (youtube-nocookie.com); we never download
 * or re-host video. No thumbnail either, since that would be a request too.
 */
export function ytEmbedSrc(url: string, clip?: { start?: number; end?: number }): string | null {
  const m = url.match(/(?:youtu\.be\/|shorts\/|[?&]v=|embed\/)([A-Za-z0-9_-]{6,})/);
  if (!m) return null;
  const q = new URLSearchParams({ rel: "0", playsinline: "1" });
  // A vetted clip plays only the movement, autoplaying muted. YouTube's own
  // `loop` restarts at 0:00 (the title card), not at `start`, so the window is
  // looped by DemoVideo through the IFrame API instead (`enablejsapi`).
  if (clip?.start != null || clip?.end != null) {
    q.set("autoplay", "1");
    q.set("mute", "1");
    q.set("enablejsapi", "1");
    if (typeof window !== "undefined") q.set("origin", window.location.origin);
    if (clip.start != null) q.set("start", String(clip.start));
    if (clip.end != null) q.set("end", String(clip.end));
  }
  return `https://www.youtube-nocookie.com/embed/${m[1]}?${q.toString()}`;
}

export function DemoVideo({
  url,
  start,
  end,
  title,
  hasFigure,
  onOpenChange,
}: {
  url: string;
  start?: number;
  end?: number;
  title: string;
  /** With a figure the control is a small chip over it; without, it fills the box. */
  hasFigure: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const src = ytEmbedSrc(url, { start, end });
  const clipped = start != null || end != null;
  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);

  // Loop the clip window: when the player reports "ended" (state 0), seek back
  // to `start` and play. Messages are accepted only from the YouTube frame.
  useEffect(() => {
    if (!open || !clipped) return;
    const post = (msg: object) =>
      frame.current?.contentWindow?.postMessage(JSON.stringify(msg), "https://www.youtube-nocookie.com");
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube-nocookie.com" || e.source !== frame.current?.contentWindow) return;
      let data: { event?: string; info?: unknown } | null = null;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : null;
      } catch {
        return;
      }
      const state =
        data?.event === "onStateChange"
          ? data.info
          : data?.event === "infoDelivery"
            ? (data.info as { playerState?: number } | undefined)?.playerState
            : undefined;
      if (state === 0) {
        post({ event: "command", func: "seekTo", args: [start ?? 0, true] });
        post({ event: "command", func: "playVideo", args: [] });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, clipped, start]);
  if (!src) return null;

  const toggle = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };

  if (open) {
    return (
      <div className="absolute inset-0 bg-ground">
        <iframe
          ref={frame}
          src={src}
          onLoad={() =>
            clipped &&
            frame.current?.contentWindow?.postMessage(
              JSON.stringify({ event: "listening", id: 1 }),
              "https://www.youtube-nocookie.com",
            )
          }
          title={`${title} demo video`}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <button
          type="button"
          onClick={() => toggle(false)}
          className="absolute right-2 top-2 flex h-11 items-center rounded-full bg-ground/80 px-3.5 text-caption font-semibold text-ink"
        >
          Close video
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(true)}
      aria-label={`Watch demo video of ${title}. Loads from YouTube`}
      className={
        hasFigure
          ? "absolute left-2.5 top-2.5 flex h-11 items-center gap-1.5 rounded-full bg-ground/70 px-3.5 text-caption font-semibold text-ink"
          : "absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink"
      }
    >
      <span aria-hidden="true">▶</span>
      <span className={hasFigure ? "" : "text-small font-semibold"}>Watch demo</span>
      {hasFigure ? null : <span className="text-caption text-muted">Loads from YouTube when you tap</span>}
    </button>
  );
}
