"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { hapticTap } from "@/lib/utils";

/**
 * In-app modal that replaces `window.confirm()`. Same yes/no semantics, but
 * proper app chrome — no more browser "webpage is asking..." dialog.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <button onClick={() => setOpen(true)}>Delete</button>
 *   <ConfirmSheet
 *     open={open}
 *     title="Delete this?"
 *     body="Cannot be undone."
 *     confirmLabel="Delete"
 *     danger
 *     onConfirm={() => { setOpen(false); doDelete(); }}
 *     onCancel={() => setOpen(false)}
 *   />
 */
export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, onCancel, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    // iOS Safari body-scroll lock. Without this the underlying page
    // rubber-bands behind the sheet and the modal loses its "modal" feel.
    // Mobile-UX audit 2026-08-18.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cs-title"
      onClick={onCancel}
      className="fixed inset-0 z-50 bg-ground/80 flex items-end sm:items-center justify-center p-3"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-surface-2 border border-line rounded-lg p-4 space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Reserve space so the wrap-line-2 title can't slip under the
              close-X's tap rect on SE 375. Mobile-UX audit 2026-08-18. */}
          <p id="cs-title" className="font-semibold text-strong pr-11">
            {title}
          </p>
          <button
            type="button"
            onClick={onCancel}
            aria-label={cancelLabel}
            className="text-muted hover:text-ink w-11 h-11 flex items-center justify-center flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-[13px] text-muted leading-relaxed">{body}</div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-line rounded py-2 min-h-[44px] text-sm hover:bg-line-soft"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              hapticTap(danger ? "medium" : "light");
              onConfirm();
            }}
            className={`flex-1 rounded py-2 min-h-[44px] text-sm font-semibold ${
              danger
                ? "bg-red text-ground hover:bg-red/90"
                : "bg-bronze text-ground hover:bg-bronze-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
