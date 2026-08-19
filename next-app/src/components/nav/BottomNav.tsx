"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Dumbbell,
  TrendingUp,
  History as HistoryIcon,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 5 primary tabs — Coach lives inside Profile until it actually works. Per IA audit 2026-08-11.
const TABS = [
  { href: "/", label: "Today", Icon: Dumbbell },
  { href: "/week/", label: "Week", Icon: CalendarDays },
  { href: "/progress/", label: "Progress", Icon: TrendingUp },
  { href: "/history/", label: "History", Icon: HistoryIcon },
  { href: "/profile/", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const keyboardOpen = useKeyboardOpen();
  // Hide while the iOS on-screen keyboard is up so the fixed nav doesn't
  // cover the input field the user is typing in (e.g. Notes on /check,
  // Coach textarea, log-form numerics). No effect on desktop or Android's
  // resize-viewport model.
  if (keyboardOpen) return null;
  // Hide during focused single-purpose flows — intake owns its own
  // Back/Next footer and the user should not wander mid-questionnaire.
  // "Back to program" at the top gives them the escape hatch.
  if (pathname && /^\/programs\/[^/]+\/intake\/?$/.test(pathname)) return null;
  return (
    <nav
      aria-label="Primary"
      className="fixed left-0 right-0 bottom-0 z-40 border-t border-line bg-surface-2 pb-[env(safe-area-inset-bottom)]"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <ul className="mx-auto flex max-w-[760px] items-stretch">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            (href === "/" && pathname === "/") ||
            (href !== "/" && (pathname === href || pathname === href.replace(/\/$/, "")));
          return (
            <li key={href} className="flex-1 min-w-0 relative">
              {/* P1-8 — 3-px bronze top-border on the active tab. Prior
                  active state relied on ink vs muted color + stroke
                  weight, which fails WCAG 1.4.1 (color-alone signal)
                  and is invisible in peripheral vision. */}
              {active ? (
                <span
                  aria-hidden
                  className="absolute inset-x-2 top-0 h-[3px] rounded-b-sm bg-bronze"
                />
              ) : null}
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-0.5 text-[10px] font-medium tracking-[0.08em] uppercase min-h-[52px]",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                  className={active ? "text-ink" : "text-muted"}
                />
                <span className="truncate max-w-full">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Detects iOS soft-keyboard presence via visualViewport height delta.
 * When the keyboard rises, iOS Safari shrinks the visual viewport but the
 * layout viewport (window.innerHeight) stays the same — a delta > ~100px
 * is a reliable "keyboard up" signal. Android already resizes the whole
 * viewport so this returns false there.
 */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const check = () => {
      // Threshold 100px — accounts for the URL bar shrinking on scroll (~50-60px)
      // without false-triggering. Real keyboards are 250-400px tall.
      setOpen(window.innerHeight - vv.height > 100);
    };
    vv.addEventListener("resize", check);
    check();
    return () => vv.removeEventListener("resize", check);
  }, []);
  return open;
}
