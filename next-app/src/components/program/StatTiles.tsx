import { cn } from "@/lib/utils";

type Tile = { value: string; label: string };

export function StatTiles({ tiles }: { tiles: Tile[] }) {
  if (!tiles.length) return null;
  return (
    <dl className="grid grid-cols-3 gap-2">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-xl border border-line-soft bg-surface px-2 py-3 text-center">
          <dd
            className={cn(
              "font-semibold tabular-nums text-strong leading-none whitespace-nowrap",
              // A range ("15–30") at metric size wraps in a third of a 375 screen.
              t.value.length > 3 ? "text-h1" : "text-metric",
            )}
          >
            {t.value}
          </dd>
          <dt className="mt-1.5 font-mono text-eyebrow uppercase tracking-widest text-muted">{t.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/** "3–5" for a range, "4" when both ends match. */
export function rangeText(r: readonly [number, number] | undefined): string | null {
  if (!r) return null;
  return r[0] === r[1] ? String(r[0]) : `${r[0]}–${r[1]}`;
}
