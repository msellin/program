import type { KeyboardEvent } from "react";

/**
 * Arrow-key navigation for a role="radiogroup" of buttons (roving tabindex).
 * Only the checked radio (or the first, when none is) is in the tab order;
 * arrows move and select, like native radios.
 */
export function rovingKeyDown(e: KeyboardEvent<HTMLElement>, count: number, current: number, select: (i: number) => void) {
  let next = current;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % count;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + count) % count;
  else return;
  e.preventDefault();
  select(next);
  const radios = e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
  radios[next]?.focus();
}
