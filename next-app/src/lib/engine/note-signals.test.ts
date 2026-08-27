import { describe, it, expect } from "vitest";
import { extractSignals } from "./note-signals";

describe("neural language and site (2026-08-27)", () => {
  // Verbatim from the founder's own log. Before this, the strongest neural
  // language in his entire history scored as ordinary stiffness, and the
  // site was discarded entirely — "a little bit front groin left" and a
  // sore shoulder produced the same signal.
  it("catches numbing pulsation, and names the site and side", () => {
    const s = extractSignals(
      "left buttocks stiff from squat, when deadlifting, gives numbing pulsation there. also little bit front groin left.",
    );
    expect(s.radicular).toBe(true);
    expect(s.sites).toContain("buttock/SI (left)");
    expect(s.sites).toContain("groin (left)");
  });

  it("catches 'make lower back pulsate'", () => {
    const s = extractSignals(
      "Dealift weights are heavy, make lower back pulsate and left buttocks also feels like its working more or stiffer than right.",
    );
    expect(s.radicular).toBe(true);
    expect(s.sites.some((x) => x.startsWith("low back"))).toBe(true);
  });

  it("names no site when the note names none", () => {
    expect(extractSignals("felt heavy today, tough week").sites).toEqual([]);
  });

  it("still reports plain stiffness without inventing a neural signal", () => {
    const s = extractSignals("legs felt stiff and slow");
    expect(s.radicular).toBe(false);
    expect(s.sites).toEqual([]);
  });
});
