// Validated measurement primitives for the video-analysis spike.
// Every function here was checked against real clips on 2026-09-01 and, where
// noted, against NEGATIVE controls. Read `../context.md` for the evidence.
//
// THE RULE, derived from five failures in one session:
//   A measure must be (a) a difference normalised by an intrinsic body scale,
//   and (b) cross-checked against at least one INDEPENDENT second condition.
//   Every measure built as a single scalar comparison in raw image coordinates
//   has been confounded. Every one built to this rule has survived.
//
// REFUTED — do not rebuild these:
//   * MediaPipe `z` for front/back rack. +0.38 was 3.1x shoulder width, an
//     implied 124 cm offset. It is a regressed pose prior, not depth.
//   * hip_y / knee_y as a depth ratio. Not translation-invariant: identical
//     posture scores 0.714 or 0.750 depending on frame position.
//   * Hip-angle VARIANCE for kip detection. Confounds shape with magnitude:
//     ramp 0.289E vs sine 0.354E, so an honest 50 deg tuck (14.44) and a real
//     40 deg kip (14.14) are 2% apart.
//   * Accumulated path length for distance. 69% landmark tremor on a real clip.
//   * Time gaps as a proxy for "the athlete came back down". Measure it instead.

const L = { nose:0, l_sh:11, r_sh:12, l_el:13, r_el:14, l_wr:15, r_wr:16,
            l_hip:23, r_hip:24, l_kn:25, r_kn:26, l_an:27, r_an:28,
            l_heel:29, r_heel:30, l_toe:31, r_toe:32 };

const smooth = (a, w = 1) => a.map((_, i) => {
  let s = 0, n = 0;
  for (let j = Math.max(0, i - w); j <= Math.min(a.length - 1, i + w); j++) { s += a[j]; n++; }
  return s / n;
});
const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length * p)]; };

// Drop frames where the detector jumped to a bystander or collapsed.
// Both founder gyms had other people in frame; this is the cheap guard until
// real subject tracking (V1-12) exists.
function clean(frames) {
  const posed = frames.filter(f => f.lm);
  const hy = posed.map(f => (f.lm[L.l_hip][1] + f.lm[L.r_hip][1]) / 2);
  const med = [...hy].sort((a, b) => a - b)[hy.length >> 1];
  return posed.filter(f => {
    const h = (f.lm[L.l_hip][1] + f.lm[L.r_hip][1]) / 2;
    const a = (f.lm[L.l_an][1] + f.lm[L.r_an][1]) / 2;
    return Math.abs(h - med) < 0.25 && a > h;   // ankles below hips = upright-ish
  });
}

// Pick the camera-near side. The far limb is unusable on bar/ring work:
// 0.20 visibility on ring MUs, 0.58-0.72 on band bar MUs.
// Handstand walks are the exception - both sides run 0.78-0.92.
function nearSide(summary) {
  const v = summary.vis;
  return (v.r_wr + v.r_el) >= (v.l_wr + v.l_el) ? 'right' : 'left';
}

// Intrinsic scale. NEVER normalise by frame height - that is what made
// depth_ratio and the "% of frame" hip-travel figures dimensionally invalid.
function bodyScale(F, t, { refBefore = 2.5, side = 'right' } = {}) {
  const SH = side === 'right' ? L.r_sh : L.l_sh, HIP = side === 'right' ? L.r_hip : L.l_hip;
  const ref = t.map((_, i) => i).filter(i => t[i] < refBefore);
  if (!ref.length) throw new Error('no still reference at the start of the clip');
  const torso = ref.reduce((s, i) => s + Math.hypot(
    F[i].lm[HIP][1] - F[i].lm[SH][1], F[i].lm[HIP][0] - F[i].lm[SH][0]), 0) / ref.length;
  const hangShoulderY = ref.reduce((s, i) => s + F[i].lm[SH][1], 0) / ref.length;
  return { torso, hangShoulderY, ref };
}

// ---------------------------------------------------------------------------
// SUPPORT POSITION (bar / ring muscle-up)
// Validated 2026-09-01: fires on both band-MU clips, ZERO on both ring-MU
// attempt clips. The single-condition version fired on 4 and 26 ring frames.
// Condition 2 rejects a horizontal swing; condition 3 rejects the drop-off.
// ---------------------------------------------------------------------------
const SUPPORT = { ENTER: 0.55, EXIT: 0.25, MAX_TORSO_ANGLE_DEG: 45, MIN_RISE: 0.30 };

function supportSeries(F, t, side, scale) {
  const SH = side === 'right' ? L.r_sh : L.l_sh, WR = side === 'right' ? L.r_wr : L.l_wr,
        HIP = side === 'right' ? L.r_hip : L.l_hip;
  const wr = smooth(F.map(f => f.lm[WR][1])), sh = smooth(F.map(f => f.lm[SH][1]));
  const hip = smooth(F.map(f => f.lm[HIP][1]));
  const shx = smooth(F.map(f => f.lm[SH][0])), hipx = smooth(F.map(f => f.lm[HIP][0]));
  return {
    margin: t.map((_, i) => (wr[i] - sh[i]) / scale.torso),                       // shoulders above hands
    torsoAngle: t.map((_, i) => Math.atan2(Math.abs(hipx[i] - shx[i]), hip[i] - sh[i]) * 180 / Math.PI),
    rise: t.map((_, i) => (scale.hangShoulderY - sh[i]) / scale.torso),
  };
}

// Rep count. THE BOUNDARY IS STRUCTURAL, NOT TEMPORAL: a new rep requires the
// athlete to descend between supports. Measured 0.85 torso within one rep vs
// -0.66..-0.71 between reps - a 1.5-torso gap, so any threshold in [-0.5, 0.8]
// agrees. The 0.8s time gap this replaced separated 0.9s from 2.3s and got
// clip A wrong (5 instead of 4).
const DESCEND_BELOW = 0.35;

function countSupports(t, s, { minHold = 0.2 } = {}) {
  const inS = []; let on = false;
  for (let i = 0; i < t.length; i++) {
    const gate = s.torsoAngle[i] < SUPPORT.MAX_TORSO_ANGLE_DEG && s.rise[i] > SUPPORT.MIN_RISE;
    if (!on && gate && s.margin[i] > SUPPORT.ENTER) on = true;
    else if (on && (s.margin[i] < SUPPORT.EXIT || !gate)) on = false;
    inS.push(on);
  }
  const raw = []; let st = null;
  for (let i = 0; i < inS.length; i++) {
    if (inS[i] && st === null) st = i;
    if (!inS[i] && st !== null) { raw.push([st, i - 1]); st = null; }
  }
  if (st !== null) raw.push([st, inS.length - 1]);

  const out = [];
  for (const r of raw) {
    const last = out[out.length - 1];
    if (!last) { out.push([...r]); continue; }
    let minRise = Infinity;
    for (let j = last[1]; j <= r[0]; j++) minRise = Math.min(minRise, s.rise[j]);
    if (minRise < DESCEND_BELOW) out.push([...r]); else last[1] = r[1];  // never came down => same rep
  }
  return out.filter(([a, b]) => t[b] - t[a] >= minHold);
}

// ---------------------------------------------------------------------------
// HANDSTAND WALK
// Validated on three clips. Bilateral visibility is good here (0.78-0.92),
// unlike bar/ring work.
// ---------------------------------------------------------------------------

// Inversion by strict vertical ordering. Structural: no thresholds to tune,
// pan-invariant, scale-invariant. Fills wall_hold_max_seconds and
// freestand_hold_max_seconds.
function invertedFrames(F, t) {
  const mid = (f, a, b, i) => (f.lm[L[a]][i] + f.lm[L[b]][i]) / 2;
  return t.map((_, i) => {
    const f = F[i];
    const an = mid(f, 'l_an', 'r_an', 1), hip = mid(f, 'l_hip', 'r_hip', 1);
    const sh = mid(f, 'l_sh', 'r_sh', 1), wr = mid(f, 'l_wr', 'r_wr', 1);
    return an < hip && hip < sh && sh < wr;
  });
}

// Body-line straightness: the best-separating measure found in this project.
// Median 8 deg vs 31-32 deg across three clips. Fully body-internal.
// ALWAYS use the median - one clip's max was 129 deg (a landmark glitch)
// against a p90 of 53.
function bodyBendDeg(F, idx) {
  const mid = (f, a, b, i) => (f.lm[L[a]][i] + f.lm[L[b]][i]) / 2;
  const vals = idx.map(i => {
    const f = F[i];
    const sx = mid(f, 'l_sh', 'r_sh', 0), sy = mid(f, 'l_sh', 'r_sh', 1);
    const hx = mid(f, 'l_hip', 'r_hip', 0), hy = mid(f, 'l_hip', 'r_hip', 1);
    const ax = mid(f, 'l_an', 'r_an', 0), ay = mid(f, 'l_an', 'r_an', 1);
    const v1 = [hx - sx, hy - sy], v2 = [ax - hx, ay - hy];
    const d1 = Math.hypot(...v1), d2 = Math.hypot(...v2);
    return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (d1 * d2)))) * 180 / Math.PI;
  });
  return { median: pct(vals, 0.5), p90: pct(vals, 0.9), max: Math.max(...vals) };
}

// Distance: REFUSES rather than guesses.
// Two independent failures, both real on the founder's clips:
//   1. Accumulated path length is 69% landmark tremor (4.95 bh reported vs a
//      3.41 bh noise floor; net displacement was 1.40).
//   2. Camera pan cannot be told from subject stillness using pose alone.
//      Needs background optical flow.
// walk_distance_max_metres therefore stays a self-reported physical_test.
function walkDistance(F, t, idx, { bodyHeight }) {
  const wx = smooth(F.map(f => (f.lm[L.l_wr][0] + f.lm[L.r_wr][0]) / 2), 2);
  const xs = idx.map(i => wx[i]);
  const range = Math.max(...xs) - Math.min(...xs);
  const steps = [];
  for (let k = 1; k < idx.length; k++) {
    const a = idx[k - 1], b = idx[k];
    if (t[b] - t[a] < 0.35) steps.push(Math.abs(wx[b] - wx[a]));
  }
  const noiseFloor = pct(steps, 0.5) * steps.length;   // what jitter alone would accumulate
  const acc = steps.reduce((s, x) => s + x, 0);
  return {
    netBodyHeights: range / bodyHeight,
    accumulatedBodyHeights: acc / bodyHeight,
    noiseFloorBodyHeights: noiseFloor / bodyHeight,
    trustworthy: false,
    refuseReason: range < 0.25
      ? 'subject stays put in frame: camera pan and subject stillness are indistinguishable from pose alone'
      : 'accumulated path length is dominated by landmark tremor; net range is a lower bound only',
  };
}

module.exports = { L, smooth, pct, clean, nearSide, bodyScale, supportSeries,
                   countSupports, invertedFrames, bodyBendDeg, walkDistance,
                   SUPPORT, DESCEND_BELOW };
