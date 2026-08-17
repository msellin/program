/**
 * Bottom nav strip that mirrors the actual shipped app — 5 tabs, line-art icons,
 * one active at a time. Kept in one component so every phone mockup stays in
 * sync with the product. If BottomNav.tsx in the app changes tabs, update here
 * to match.
 */

type Tab = "today" | "week" | "progress" | "history" | "profile";

const ICONS: Record<Tab, React.ReactNode> = {
  today: (
    // dumbbell
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
    </svg>
  ),
  week: (
    // calendar
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  progress: (
    // trending-up
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 7l-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </svg>
  ),
  history: (
    // history clock
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
  profile: (
    // user
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const LABELS: Record<Tab, string> = {
  today: "Today",
  week: "Week",
  progress: "Progress",
  history: "History",
  profile: "Profile",
};

export function BottomNavStrip({ active }: { active: Tab }) {
  const tabs: Tab[] = ["today", "week", "progress", "history", "profile"];
  return (
    <div className="mt-4 border-t border-white/[0.06] bg-[#0e0f12]">
      <div className="flex items-stretch">
        {tabs.map((t) => {
          const isActive = t === active;
          return (
            <div
              key={t}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium uppercase tracking-wide ${
                isActive ? "text-white" : "text-[var(--color-muted)]"
              }`}
            >
              <span className="h-5 w-5">{ICONS[t]}</span>
              <span className="text-[8.5px]">{LABELS[t]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
