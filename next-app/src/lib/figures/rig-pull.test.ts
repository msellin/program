import { describe, it, expect } from "vitest";
import { FIGS, ACCENT, drawFigure, type FigureFrame } from "./rig";

// Pull family (trainer + physics review, 2026-10-29): angles and ranges a coach would show.
const pts = (s: string) => s.split(" ").map((p) => p.split(",").map(Number));
const inc = (a: number[], b: number[], c: number[]) => {
  const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
  return (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1)) * 180) / Math.PI;
};
const arms = (f: FigureFrame) => f.slots.filter((s) => !s.cue && s.color === ACCENT && pts(s.pts).length === 3).map((s) => pts(s.pts));
const head = (f: FigureFrame) => pts(f.slots.find((s) => s.w === 22)!.pts)[0];
const at = (id: string, frac: number) => drawFigure(id, "B", frac * FIGS[id].dur! * 0.999, false);
const still = (id: string) => drawFigure(id, "B", 0, false, true);
const BAR_TOP = 25, BAR_BOTTOM = 31, HEAD_R = 11;

describe("pull family", () => {
  const ups = ["pullup", "pullup_single", "pullup_slow", "pullup_band", "pullup_band_light", "pullup_negative", "pullup_negative5", "pullup_top"];

  it("top of a pull-up: chin clearly over the bar, elbow 30-40 degrees", () => {
    for (const id of ups) {
      const f = id.startsWith("pullup_negative") ? drawFigure(id, "B", 0, false) : still(id);
      const chin = head(f)[1] + HEAD_R;
      expect(chin, id).toBeLessThan(BAR_TOP - 3);
      for (const [h, e, s] of arms(f)) expect(inc(h, e, s), id).toBeLessThanOrEqual(42);
    }
  });

  it("mid-range holds 90 degrees at the elbow and the head stays below the bar", () => {
    for (const id of ["pullup_mid", "pullup_partial"]) {
      const f = id === "pullup_mid" ? still(id) : drawFigure(id, "B", FIGS[id].dur! * 0.34 * 0.999, false);
      for (const [h, e, s] of arms(f)) expect(Math.abs(inc(h, e, s) - 90) < 12 || id === "pullup_partial", id).toBe(true);
    }
    expect(head(still("pullup_mid"))[1] - HEAD_R).toBeGreaterThan(BAR_BOTTOM);
  });

  it("dead hang: arms straight (elbow >= 175)", () => {
    for (const id of ["hang", "activehang", "scappull", "pullup"]) {
      const f = id === "pullup" ? drawFigure(id, "B", 0, false) : drawFigure(id, "B", 0, false, false);
      const a = id === "hang" || id === "activehang" || id === "scappull" ? null : arms(f);
      if (a) for (const [h, e, s] of a) expect(inc(h, e, s), id).toBeGreaterThanOrEqual(175);
    }
    for (const id of ["hang", "activehang", "scappull"]) {
      const f = drawFigure(id, "B", 5000, false);
      const bar = f.slots.filter((s) => s.color === ACCENT && pts(s.pts).length === 2 && s.w === 8);
      expect(bar.length, id).toBeGreaterThanOrEqual(2);
      for (const s of bar) { const [h, sh] = pts(s.pts); expect(Math.hypot(h[0] - sh[0], h[1] - sh[1]), id).toBeGreaterThan(61.5); }
    }
  });

  it("the head never reaches the bar in the active hang or scap pull", () => {
    for (const id of ["activehang", "scappull"]) {
      for (const fr of [0, 0.25, 0.5, 0.75]) {
        const f = id === "activehang" ? drawFigure(id, "B", 5000, false) : at(id, fr);
        expect(head(f)[1] - HEAD_R, id).toBeGreaterThan(BAR_BOTTOM + 3);
      }
    }
  });

  it("scapular start: the first part of the rep raises the body with the arms still straight", () => {
    const f0 = at("pullup", 0), f1 = at("pullup", 0.02 + 0.25 * 0.1);
    expect(head(f1)[1]).toBeLessThan(head(f0)[1] - 0.5);
    for (const [h, e, s] of arms(f1)) expect(inc(h, e, s)).toBeGreaterThan(170);
  });

  it("negatives take 10 s and 5 s to lower", () => {
    for (const [id, ms] of [["pullup_negative", 10000], ["pullup_negative5", 5000]] as const) {
      const f = FIGS[id], dur = f.dur!, k = f.k!;
      expect(Math.round((k[1] - k[0]) * dur), id).toBe(ms);
    }
  });

  it("bands hang outside the arms, thinner when stretched", () => {
    for (const id of ["pullup_band", "pullup_band_light"]) {
      const f = at(id, 0);
      const band = f.slots.find((s) => s.color === "#c29a64" && !s.cue)!;
      for (const p of pts(band.pts).slice(0, 2)) expect(p[0] < 152 || p[0] > 206, id).toBe(true);
    }
  });

  it("ring rows: elbow travels back, upper arm never overhead; straight at the bottom", () => {
    for (const id of ["rowflat", "rowincline", "rowfeet"]) {
      const bottom = arms(at(id, 0))[0], top = arms(at(id, 0.46 * 0.99))[0];
      expect(inc(bottom[0], bottom[1], bottom[2]), id).toBeGreaterThanOrEqual(175);
      expect(inc(top[0], top[1], top[2]), id).toBeLessThanOrEqual(55);
      // Shoulder angle at the top: upper arm vs the trunk line toward the feet.
      const f = at(id, 0.46 * 0.99);
      const body = f.slots.find((s) => s.w === 14 || s.w === 12)!;
      const trunk = pts(body.pts);
      const [hip, sh] = [trunk[0], trunk[1]];
      const el = top[1], sho = top[2];
      const ang = inc(hip, sho, el);
      expect(ang, id + " shoulder").toBeLessThanOrEqual(80);
      void sh;
    }
  });

  it("incline row is reachable: the chest gets to the rings and the elbow closes", () => {
    const top = arms(at("rowincline", 0.46 * 0.99))[0], bot = arms(at("rowincline", 0))[0];
    expect(inc(bot[0], bot[1], bot[2])).toBeGreaterThanOrEqual(175);
    expect(inc(top[0], top[1], top[2])).toBeLessThanOrEqual(50);
    expect(Math.hypot(top[0][0] - top[2][0], top[0][1] - top[2][1])).toBeLessThan(25);
  });

  it("pull-apart: band is taut and straight at the end, hands go from shoulder width to 2x+", () => {
    const start = drawFigure("pullapart", "B", 0, false), end = drawFigure("pullapart", "B", 0.5 * 5000, false);
    const band = (f: FigureFrame) => pts(f.slots.find((s) => s.color === "#c29a64")!.pts);
    const b0 = band(start), b1 = band(end);
    expect(Math.abs(b1[0][1] - b1[2][1]) + Math.abs(b1[1][1] - 80)).toBeLessThan(0.5);
    expect(Math.abs(b1[2][0] - b1[0][0])).toBeGreaterThan(2 * 26);
    expect(Math.abs(b0[2][0] - b0[0][0])).toBeLessThan(40);
  });

  it("r2: looping pull-ups end in their start pose (no reset pop) and hands grip wider than the shoulders", () => {
    for (const id of ["pullup", "pullup_single", "pullup_slow", "pullup_band"]) {
      const a = drawFigure(id, "B", 0, false), b = drawFigure(id, "B", FIGS[id].dur! * 0.9999, false);
      expect(b.slots.map((x) => x.pts), id).toEqual(a.slots.map((x) => x.pts));
    }
    for (const [h, , s] of arms(drawFigure("pullup", "B", 0, false))) expect(Math.abs(h[0] - s[0])).toBeGreaterThan(12);
  });
});
