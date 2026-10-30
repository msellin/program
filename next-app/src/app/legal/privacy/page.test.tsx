import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import PrivacyPage from "./page";

/**
 * M-022: the three-column "What we store" table crushed to a word per line at
 * 393 px. Narrow screens get one labelled card per row; the table is sm+ only,
 * and both carry the same rows.
 */
afterEach(() => cleanup());

describe("privacy page: what we store", () => {
  it("stacks rows as cards on narrow screens and keeps the table for wide ones", () => {
    const { container } = render(<PrivacyPage />);
    const cards = screen.getByRole("list", { name: "What we store" });
    expect(cards.className).toContain("sm:hidden");
    const table = container.querySelector("table")!;
    expect(table.className).toMatch(/(^|\s)hidden(\s|$)/);
    expect(table.className).toContain("sm:table");

    const items = within(cards).getAllByRole("listitem");
    const rows = table.querySelectorAll("tbody tr");
    expect(items.length).toBe(rows.length);
    expect(items.length).toBeGreaterThan(5);
    rows.forEach((tr, i) => {
      expect(items[i].textContent).toContain(tr.querySelector("td")!.textContent);
    });
    expect(within(cards).getAllByText(/Kept:/).length).toBe(items.length);
  });
});
