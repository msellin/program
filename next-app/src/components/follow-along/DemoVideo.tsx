"use client";

import { useEffect, useState } from "react";

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
  // A vetted clip plays only the movement: autoplay muted, looping the window.
  // `loop` needs `playlist` set to the same id to work on a single video.
  if (clip?.start != null || clip?.end != null) {
    q.set("autoplay", "1");
    q.set("mute", "1");
    q.set("loop", "1");
    q.set("playlist", m[1]);
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
  const src = ytEmbedSrc(url, { start, end });
  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);
  if (!src) return null;

  const toggle = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };

  if (open) {
    return (
      <div className="absolute inset-0 bg-ground">
        <iframe
          src={src}
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
