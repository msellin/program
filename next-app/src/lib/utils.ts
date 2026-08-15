import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ISO date (YYYY-MM-DD) in the LOCAL timezone.
 * We deliberately don't use `toISOString()` because it converts to UTC — in any
 * timezone east of UTC that flips the calendar date at local midnight, causing
 * off-by-one bugs everywhere date strings are used as keys (skipped, overrides,
 * logs, streak counter, etc.).
 */
export const iso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * The app's notion of "today". Supports a `?today=YYYY-MM-DD` URL override
 * for testing the engine at fixed dates without changing the OS clock.
 */
export const today = (): string => {
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search).get("today");
    if (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
  }
  return iso(new Date());
};
