import { cn } from "@/lib/utils";

/** "Tier B — Hang established" -> "Hang established". Leaves other labels alone. */
export function stripTierPrefix(label: string): string {
  return label.replace(/^Tier\s+[A-Za-z0-9]+\s*(?:—|-|·|:)?\s*/i, "").trim() || label;
}

type Level = { id: string; label: string };

/**
 * A row of nodes joined by a line, one node per plan tier. `activeId` lights
 * one node ("you are here"); without it every node is neutral. Pure SVG-free
 * markup so it prints crisp at any width and needs no client JS.
 */
export function LevelLadder({
  levels,
  activeId,
  className,
}: {
  levels: Level[];
  activeId?: string | null;
  className?: string;
}) {
  if (levels.length < 2) return null;
  const activeIdx = activeId ? levels.findIndex((l) => l.id === activeId) : -1;
  return (
    <ol className={cn("flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-0", className)} aria-label="Levels">
      {levels.map((l, i) => {
        const lit = i === activeIdx;
        const passed = activeIdx >= 0 && i < activeIdx;
        return (
          <li key={l.id} className="relative flex min-w-0 items-center gap-2 sm:block sm:flex-1 sm:px-0.5 sm:text-center">
            {i > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 right-1/2 top-[11px] hidden sm:block h-0.5 -translate-y-1/2",
                  i <= activeIdx ? "bg-bronze" : "bg-line",
                )}
              />
            ) : null}
            {i < levels.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-1/2 right-0 top-[11px] hidden sm:block h-0.5 -translate-y-1/2",
                  i < activeIdx ? "bg-bronze" : "bg-line",
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative flex shrink-0 sm:mx-auto h-[22px] w-[22px] items-center justify-center rounded-full border-2 font-mono text-eyebrow tabular-nums",
                lit
                  ? "border-bronze bg-bronze text-ground"
                  : passed
                    ? "border-bronze bg-surface text-bronze"
                    : "border-line bg-surface text-muted",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "min-w-0 text-small leading-snug sm:mt-1.5 sm:block sm:text-eyebrow sm:leading-tight",
                lit ? "font-semibold text-strong" : "text-muted",
              )}
            >
              {stripTierPrefix(l.label)}
              {lit ? <span className="sr-only"> (you are here)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
