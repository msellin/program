"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListPlus,
  BookOpen,
  MoreVertical,
  FileText,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsSuperAdmin } from "@/lib/super-admin";

const LINKS = [
  // Programs promoted out of this menu into a top-level nav slot — a
  // multi-program app hides the program catalog at its peril. Check is also
  // its own nav slot (stethoscope). Order preserved for the remaining items.
  { href: "/extras/", label: "Extras", Icon: ListPlus, superAdminOnly: false },
  { href: "/events/", label: "Events", Icon: CalendarDays, superAdminOnly: true },
  // Coach removed from More dropdown 2026-08-17 per founder observation
  // (test@terav.fit was seeing it and it's a "Coming soon" placeholder).
  // Still reachable via Profile → Ask coach for super-admins, and via
  // direct /coach URL for founder debugging. Restore when the chat surface
  // + confirm-first proposal loop actually ships.
  { href: "/report/", label: "Report", Icon: FileText, superAdminOnly: false },
  // Data removed from More dropdown 2026-08-17 per founder observation.
  // Still reachable via Profile → Manage data (the GDPR-required export/
  // wipe path). No need to double-surface it — user's already on Profile
  // when they think about their data.
  { href: "/guide/", label: "Guide", Icon: BookOpen, superAdminOnly: false },
];

/**
 * Overflow menu for secondary destinations. Single (⋯) icon; tap → menu.
 *
 * Was: a 4-icon strip stapled to every Today header. ~28% of the header
 * row on a 390px viewport. Now a single icon, everything else 1 tap away.
 */
export function HeaderQuickLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isSuperAdmin = useIsSuperAdmin();
  const visibleLinks = LINKS.filter((l) => !l.superAdminOnly || isSuperAdmin);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-9 h-9 flex items-center justify-center rounded hover:bg-surface-2 text-muted"
      >
        <MoreVertical size={18} strokeWidth={1.75} aria-hidden />
      </button>
      {open ? (
        <nav
          role="menu"
          aria-label="More destinations"
          className="absolute right-0 mt-1 z-40 rounded border border-line bg-surface shadow-lg min-w-[180px] py-1"
        >
          {visibleLinks.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname === href.replace(/\/$/, "");
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 text-[14px] min-h-[44px]",
                  active
                    ? "text-strong bg-surface-2"
                    : "text-ink hover:bg-surface-2",
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
