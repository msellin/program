/**
 * Client-side GPX parser.
 *
 * Runs on the device — the file never leaves the phone. Extracts what a
 * training log actually cares about: distance, duration, avg + max HR,
 * elevation gain, start time, device name. Ignores per-point noise (splits
 * and full GPS track live in the raw XML if we ever want them).
 *
 * GPX flavour we handle: schema 1.1 + Garmin TrackPointExtension for HR /
 * cadence. Suunto, Coros, and Wahoo all export compatible files.
 */

export type ParsedGpx = {
  distance_km: number;
  minutes: number;
  avg_hr: number | null;
  max_hr: number | null;
  elevation_gain_m: number;
  started_at: string | null; // ISO datetime
  device_name: string | null;
  point_count: number;
};

export function parseGpx(text: string): ParsedGpx | { error: string } {
  if (typeof window === "undefined") return { error: "GPX parsing must run in the browser" };
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  const parseErr = doc.querySelector("parsererror");
  if (parseErr) return { error: "File isn't valid XML." };

  const points = Array.from(doc.getElementsByTagName("trkpt"));
  if (points.length < 2) return { error: "No track points found in this GPX." };

  let distanceM = 0;
  let elevGain = 0;
  let hrSum = 0;
  let hrCount = 0;
  let hrMax = 0;
  let firstTime: string | null = null;
  let lastTime: string | null = null;
  let prevLat: number | null = null;
  let prevLon: number | null = null;
  let prevEle: number | null = null;

  for (const p of points) {
    const lat = parseFloat(p.getAttribute("lat") ?? "");
    const lon = parseFloat(p.getAttribute("lon") ?? "");
    if (!isFinite(lat) || !isFinite(lon)) continue;

    if (prevLat != null && prevLon != null) {
      distanceM += haversine(prevLat, prevLon, lat, lon);
    }
    prevLat = lat;
    prevLon = lon;

    const eleText = p.getElementsByTagName("ele")[0]?.textContent;
    if (eleText) {
      const ele = parseFloat(eleText);
      if (isFinite(ele)) {
        if (prevEle != null && ele > prevEle) elevGain += ele - prevEle;
        prevEle = ele;
      }
    }

    const timeText = p.getElementsByTagName("time")[0]?.textContent;
    if (timeText) {
      if (firstTime == null) firstTime = timeText;
      lastTime = timeText;
    }

    // HR lives under <extensions><ns3:TrackPointExtension><ns3:hr>… but the
    // namespace prefix varies (gpxtpx:, ns3:, ns:). Search all descendants
    // whose tag ends in "hr".
    const hrEls = p.getElementsByTagName("*");
    for (let i = 0; i < hrEls.length; i++) {
      const el = hrEls[i];
      const local = el.tagName.split(":").pop()?.toLowerCase();
      if (local === "hr") {
        const hr = parseFloat(el.textContent ?? "");
        if (isFinite(hr) && hr > 30 && hr < 230) {
          hrSum += hr;
          hrCount++;
          if (hr > hrMax) hrMax = hr;
        }
        break; // one HR per trkpt is enough
      }
    }
  }

  const minutes =
    firstTime && lastTime
      ? Math.max(1, Math.round((Date.parse(lastTime) - Date.parse(firstTime)) / 60_000))
      : 0;

  const creator =
    doc.getElementsByTagName("gpx")[0]?.getAttribute("creator") ??
    doc.getElementsByTagName("metadata")[0]?.getElementsByTagName("name")[0]?.textContent ??
    null;

  return {
    distance_km: Math.round((distanceM / 1000) * 100) / 100,
    minutes,
    avg_hr: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
    max_hr: hrMax > 0 ? Math.round(hrMax) : null,
    elevation_gain_m: Math.round(elevGain),
    started_at: firstTime,
    device_name: creator,
    point_count: points.length,
  };
}

/** Great-circle distance in metres between two lat/lon points. */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Classify effort from heart rate (2026-08-27).
 *
 * GPX import filled distance, duration and HR but left `intensity` to a
 * manual pick — and `intensity` is precisely what the retest metrics
 * filter on: engine-builder, engine-builder-block-2 and
 * concurrent-strength-maintenance all read
 * `runs[].avg_hr where intensity == 'easy'`. Import a ride, leave the
 * dropdown on its default, and the session is invisible to the thing
 * measuring whether the programme works. The same silent-drop as the
 * rowing-modality bug already noted in RunSlotCard.
 *
 * Calibrated against the highest max HR ever logged rather than a
 * 220-minus-age guess: it needs no profile field, and it sharpens as the
 * log grows. Returns null when there is nothing to go on, so the user
 * still picks.
 */
export function intensityFromHr(
  avgHr: number | null | undefined,
  observedMaxHr: number | null | undefined,
): "easy" | "moderate" | "hard" | null {
  if (avgHr == null || observedMaxHr == null || observedMaxHr <= 0) return null;
  // Below roughly 70% of max is conversational; above 85% is genuinely hard.
  // Deliberately conservative at the top: mislabelling a moderate session
  // "hard" costs an interference warning, mislabelling a hard one "easy"
  // corrupts the retest trend.
  const pct = avgHr / observedMaxHr;
  if (pct < 0.72) return "easy";
  if (pct < 0.85) return "moderate";
  return "hard";
}

/** The highest max HR ever recorded, used to calibrate the above. */
export function observedMaxHrFrom(
  logs: Record<string, { runs?: Array<{ max_hr?: number | null }> }> | undefined,
): number | null {
  let best = 0;
  for (const day of Object.values(logs ?? {})) {
    for (const r of day.runs ?? []) {
      if (typeof r.max_hr === "number" && r.max_hr > best) best = r.max_hr;
    }
  }
  return best > 0 ? best : null;
}
