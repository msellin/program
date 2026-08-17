"use client";

import { useRef } from "react";
import { ExternalLink } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

/**
 * In-app video modal.
 *
 * - When `videoUrl` points at a specific YouTube video, embed it. This is reliable.
 * - When only `searchQuery` is available, we DO NOT embed — YouTube deprecated the
 *   `listType=search` embed URL, so it renders inconsistently (sometimes blank,
 *   sometimes "Video unavailable", region and login dependent). Instead we show a
 *   card with a big "Search on YouTube" tap target that opens the search page in
 *   a new tab. Not ideal, but always works. The proper long-term fix is to add
 *   curated `video_url` values to `exercises.json`.
 */
export function VideoModal({
  title,
  videoUrl,
  searchQuery,
  onClose,
}: {
  title: string;
  videoUrl?: string | null;
  searchQuery?: string | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `vm-${title.replace(/\W+/g, "-")}`;
  useFocusTrap(panelRef, onClose);

  const embedSrc = videoUrl ? ytEmbed(videoUrl) ?? videoUrl : null;
  const searchHref = searchQuery
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ground/85 flex items-center justify-center p-4"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-line rounded max-w-2xl w-full max-h-[90vh] overflow-auto"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-line gap-3">
          <h3 id={titleId} className="font-mono text-[13px] uppercase tracking-widest truncate">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-ink w-11 h-11 flex items-center justify-center text-xl leading-none rounded flex-shrink-0"
          >
            ×
          </button>
        </header>
        <div className="text-sm text-muted">
          {embedSrc ? (
            <>
              <iframe
                src={embedSrc}
                className="w-full aspect-video"
                allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                title={`${title} demo`}
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {videoUrl ? (
                <div className="px-4 py-2.5 border-t border-line-soft text-left">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink"
                  >
                    <ExternalLink size={12} />
                    Open on YouTube
                  </a>
                </div>
              ) : null}
            </>
          ) : searchHref ? (
            <div className="p-5 text-center space-y-3">
              <p className="text-sm text-ink">
                No embedded demo yet for this exercise.
              </p>
              <p className="text-[13px] text-muted">
                Search YouTube for &quot;<span className="text-ink">{searchQuery}</span>&quot; —
                opens in a new tab.
              </p>
              <a
                href={searchHref}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded bg-bronze text-ground"
              >
                <ExternalLink size={14} />
                Search on YouTube
              </a>
            </div>
          ) : (
            <p className="p-5 text-center">No demo linked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Convert any YouTube URL shape into an embed URL. Uses youtube-nocookie
 * for slightly better privacy defaults.
 */
function ytEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}
