"use client";

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
  return (
    <nav
      aria-label="Primary"
      className="fixed left-0 right-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[760px] items-stretch">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            (href === "/" && pathname === "/") ||
            (href !== "/" && (pathname === href || pathname === href.replace(/\/$/, "")));
          return (
            <li key={href} className="flex-1 min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-0.5 text-[9px] font-medium tracking-wide uppercase min-h-[52px]",
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
