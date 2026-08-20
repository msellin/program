"use client";

import { useRef, useState } from "react";
import { Info, X, Plus, Footprints, Upload } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { InfoSheet } from "@/components/InfoSheet";
import { EngineReadsNotesHint } from "./EngineReadsNotesHint";
import { parseGpx } from "@/lib/gpx";
import { cn } from "@/lib/utils";
import type { RunLog } from "@/lib/schemas";

type ActivityType = NonNullable<RunLog["activity_type"]>;

/**
 * Extra-session slot on Today.
 *
 * Covers anything the user might do outside the barbell block: run, HYROX
 * simulation, CrossFit class, ride, row, ski erg, walk. Recommendation is
 * per-day-of-week (48h squat spacing enforced). Log form supports manual
 * entry or GPX import from a Garmin/Suunto/Coros/Wahoo export; parsed
 * client-side, file never leaves the device.
 */
export function RunSlotCard({ date }: { date: string }) {
  const store = useStore((s) => s.store);
  const logRun = useStore((s) => s.logRun);
  const removeRun = useStore((s) => s.removeRun);
  const activeProgramSlug = store.user_profile?.active_program_id;
  // slotForDow's copy is anterior-hip-specific (heavy-squat days, 48h squat
  // spacing) — for other programs it misleads. Show a generic "log extras" card
  // instead so aerobic / skill users can still record cross-modal work without
  // being told to keep it easy on their primary lift day.
  const useGenericSlot = activeProgramSlug !== "anterior-hip-rebuild";

  const [open, setOpen] = useState(false);
  const [primerOpen, setPrimerOpen] = useState(false);
  // Default modality per program. Rowing users defaulting to "run" silently
  // dropped their sessions from `retest_metrics where modality == 'row'`.
  const defaultActivity: ActivityType =
    activeProgramSlug === "rowing-2k-test-prep" ? "row" : "run";
  const [activity, setActivity] = useState<ActivityType>(defaultActivity);
  const [distance, setDistance] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");
  const [avgHr, setAvgHr] = useState<string>("");
  const [maxHr, setMaxHr] = useState<string>("");
  const [intensity, setIntensity] = useState<RunLog["intensity"]>("easy");
  const [note, setNote] = useState<string>("");
  const [sessionType, setSessionType] = useState<string>("");
  const [twoKTime, setTwoKTime] = useState<string>(""); // mm:ss for 2K tests
  const [watts, setWatts] = useState<string>("");
  const [importedMeta, setImportedMeta] = useState<{
    source: "gpx";
    avg_hr: number | null;
    max_hr: number | null;
    elevation_gain_m: number;
    device_name: string | null;
    started_at: string | null;
    raw_gpx: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dow = new Date(date + "T12:00:00").getDay();
  const slot = useGenericSlot
    ? {
        type: "optional" as const,
        // Batch 36 P1 (audit 2026-08-21 · app-copy) — matched §2.13
        // CTA vocabulary. "Log an extra session" → "Log extra session →"
        // (dropped article, added arrow suffix per §2.13 row 8).
        title: "Log extra session →",
        detail:
          "Cross-modal work, walks, class attendance, mobility — anything not in the prescribed block. Optional. Nothing here changes the plan.",
      }
    : slotForDow(dow);
  const runs = store.logs[date]?.runs ?? [];
  // Card always renders — even on rest / heavy-lift days — because the user
  // may still do a walk, mobility session, easy row, or class. The slot copy
  // adjusts to warn on ill-advised choices; nothing is blocked.

  const toneClass = {
    primary: "border-l-green bg-green/10 border-green/30",
    optional: "border-l-slate bg-surface border-line-soft",
    none: "border-l-line border-line-soft bg-surface",
  }[slot.type];

  const reset = () => {
    setActivity("run");
    setDistance("");
    setMinutes("");
    setSeconds("");
    setAvgHr("");
    setMaxHr("");
    setIntensity("easy");
    setNote("");
    setSessionType("");
    setTwoKTime("");
    setWatts("");
    setImportedMeta(null);
    setImportError(null);
    setOpen(false);
  };

  const parseTimeToSeconds = (mmss: string): number | null => {
    const trimmed = mmss.trim();
    if (!trimmed) return null;
    // Accept "7:35", "7:35.4", or bare seconds "455".
    const parts = trimmed.split(":");
    if (parts.length === 1) {
      const s = Number(parts[0]);
      return Number.isFinite(s) && s > 0 ? s : null;
    }
    if (parts.length === 2) {
      const min = Number(parts[0]);
      const sec = Number(parts[1]);
      if (!Number.isFinite(min) || !Number.isFinite(sec)) return null;
      const total = min * 60 + sec;
      return total > 0 ? total : null;
    }
    return null;
  };

  const submit = () => {
    const d = distance ? Number(distance) : null;
    // Duration accepts either minutes only, seconds only, or both. Compose to
    // a single decimal-minutes value stored on `minutes`; also stash the exact
    // integer second count on `total_seconds` for retest queries.
    const mRaw = minutes ? Number(minutes) : null;
    const sRaw = seconds ? Number(seconds) : null;
    const durationSeconds =
      (mRaw != null && Number.isFinite(mRaw) && mRaw > 0 ? mRaw * 60 : 0) +
      (sRaw != null && Number.isFinite(sRaw) && sRaw > 0 ? sRaw : 0);
    const m = durationSeconds > 0 ? durationSeconds / 60 : null;
    const twoK = parseTimeToSeconds(twoKTime);
    const wattsNum = watts ? Number(watts) : null;
    const avgHrNum = avgHr ? Number(avgHr) : null;
    const maxHrNum = maxHr ? Number(maxHr) : null;
    const hasNote = note.trim().length > 0;
    // Save requires SOMETHING — distance, duration, 2K time, imported file,
    // OR a written note. Before the note check the form silently reset on
    // notes-only entries (e.g., "stretching class, felt loose"), giving
    // the illusion of "saved". Now a note alone qualifies.
    if (d == null && m == null && twoK == null && !importedMeta && !hasNote) {
      reset();
      return;
    }
    const entry: RunLog = {
      activity_type: activity,
      distance_km: d != null && isFinite(d) && d > 0 ? d : null,
      minutes: m,
      intensity: intensity ?? "easy",
      note: note.trim() || undefined,
    };
    // Assign total_seconds from duration only if the 2K-time input didn't
    // supply one — a rower filling both fields would otherwise get the 2K
    // test time overwritten by the interval-session duration below.
    if (durationSeconds > 0 && twoK == null) entry.total_seconds = Math.round(durationSeconds);
    // Manual HR entries (GPX-imported values override these below).
    if (avgHrNum != null && Number.isFinite(avgHrNum) && avgHrNum >= 30 && avgHrNum <= 230)
      entry.avg_hr = avgHrNum;
    if (maxHrNum != null && Number.isFinite(maxHrNum) && maxHrNum >= 30 && maxHrNum <= 230)
      entry.max_hr = maxHrNum;
    // Rowing-native fields (also usable by ski erg / bike programs later).
    if (sessionType) entry.session_type = sessionType as RunLog["session_type"];
    if (wattsNum != null && Number.isFinite(wattsNum) && wattsNum > 0)
      entry.avg_watts = wattsNum;
    if (twoK != null) {
      entry.total_seconds = twoK;
      // Derive 500m split ONLY for a genuine 2K test. Dividing a 32-min
      // 4×8-min threshold session's total by 4 gives 8:00/500m, which is
      // nonsense. Round-3 Persona B caught this.
      if (sessionType === "2k_test") {
        entry.avg_pace_500m_seconds = Math.round(twoK / 4);
      }
      // Fall back to filling distance/minutes so the session shows up in
      // ranged views even if the user didn't type them.
      if (entry.distance_km == null && (sessionType === "2k_test")) {
        entry.distance_km = 2;
      }
      if (entry.minutes == null) entry.minutes = Math.round(twoK / 60);
    }
    if (importedMeta) {
      entry.source = importedMeta.source;
      if (importedMeta.avg_hr != null) entry.avg_hr = importedMeta.avg_hr;
      if (importedMeta.max_hr != null) entry.max_hr = importedMeta.max_hr;
      if (importedMeta.elevation_gain_m > 0)
        entry.elevation_gain_m = importedMeta.elevation_gain_m;
      if (importedMeta.device_name) entry.device_name = importedMeta.device_name;
      if (importedMeta.started_at) entry.started_at = importedMeta.started_at;
      // Only store raw GPX if it's compact — spare the sync PUT budget.
      if (importedMeta.raw_gpx.length <= 500_000) entry.raw_gpx = importedMeta.raw_gpx;
    }
    logRun(date, entry);
    reset();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      setImportError("GPX file is over 5 MB — that's larger than expected. Try exporting shorter activities.");
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
      return;
    }
    const parsed = parseGpx(text);
    if ("error" in parsed) {
      setImportError(parsed.error);
      return;
    }
    // Guess activity type from filename if user hasn't picked one yet.
    const fname = file.name.toLowerCase();
    const guessed: ActivityType =
      fname.includes("hyrox") ? "hyrox"
      : fname.includes("ride") || fname.includes("cycl") || fname.includes("bike") ? "cycle"
      : fname.includes("row") ? "row"
      : fname.includes("ski") ? "ski_erg"
      : fname.includes("walk") ? "walk"
      : "run";
    setActivity(guessed);
    setDistance(String(parsed.distance_km));
    setMinutes(String(parsed.minutes));
    setImportedMeta({
      source: "gpx",
      avg_hr: parsed.avg_hr,
      max_hr: parsed.max_hr,
      elevation_gain_m: parsed.elevation_gain_m,
      device_name: parsed.device_name,
      started_at: parsed.started_at,
      raw_gpx: text,
    });
    setOpen(true);
    // Reset the file input so re-picking the same file re-fires onChange.
    e.target.value = "";
  };

  return (
    <section
      aria-label="Extra session slot"
      className={cn("border border-l-4 rounded-md p-3 space-y-2", toneClass)}
    >
      <header className="flex items-center gap-2">
        <Footprints size={16} className="text-slate flex-shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-strong">{slot.title}</p>
          <p className="text-[14px] text-muted mt-0.5">{slot.detail}</p>
        </div>
        <button
          type="button"
          onClick={() => setPrimerOpen(true)}
          aria-label="Warm-up + cool-down"
          className="w-11 h-11 flex items-center justify-center text-muted hover:text-ink rounded"
        >
          <Info size={16} strokeWidth={1.75} />
        </button>
      </header>

      {runs.length > 0 ? (
        <ul className="space-y-1.5 pt-1">
          {runs.map((r, i) => (
            <li
              key={i}
              className="flex items-baseline justify-between gap-2 text-[14px] px-2 py-1.5 rounded bg-line-soft/50"
            >
              <div className="font-mono text-slate min-w-0">
                <span className="text-strong">{prettyActivity(r.activity_type)}</span>
                {" · "}
                {[
                  r.session_type ? r.session_type.replace(/_/g, " ") : null,
                  r.total_seconds != null
                    ? `${Math.floor(r.total_seconds / 60)}:${String(r.total_seconds % 60).padStart(2, "0")}`
                    : null,
                  r.avg_pace_500m_seconds != null
                    ? `${Math.floor(r.avg_pace_500m_seconds / 60)}:${String(Math.round(r.avg_pace_500m_seconds % 60)).padStart(2, "0")}/500m`
                    : null,
                  r.avg_watts != null ? `${r.avg_watts} W` : null,
                  r.distance_km != null ? `${r.distance_km} km` : null,
                  r.minutes != null && r.total_seconds == null ? `${r.minutes} min` : null,
                  r.intensity ? r.intensity : null,
                  r.avg_hr != null ? `avg HR ${r.avg_hr}` : null,
                  r.max_hr != null ? `max ${r.max_hr}` : null,
                  r.elevation_gain_m != null && r.elevation_gain_m > 5
                    ? `+${r.elevation_gain_m} m`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                {r.source === "gpx" ? (
                  <span className="ml-2 text-[10px] uppercase tracking-wider bg-slate/30 text-slate px-1 py-0.5 rounded">
                    gpx
                  </span>
                ) : null}
                {r.note ? (
                  <span className="ml-2 text-muted italic font-sans">{r.note}</span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeRun(date, i)}
                aria-label="Remove logged session"
                className="text-muted hover:text-red w-11 h-11 -my-1 flex items-center justify-center flex-shrink-0"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div className="pt-1 space-y-2.5">
          {/* Activity type picker */}
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_ORDER.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setActivity(a)}
                aria-pressed={activity === a}
                className={cn(
                  "px-2.5 py-1.5 min-h-[36px] rounded-full font-mono text-[11px]",
                  activity === a
                    ? "bg-slate text-surface"
                    : "bg-line-soft text-muted hover:text-ink",
                )}
              >
                {prettyActivity(a)}
              </button>
            ))}
          </div>

          {importedMeta ? (
            <div className="rounded border border-line-soft bg-surface p-2 text-[12px] space-y-0.5">
              <p className="text-slate font-mono">
                Imported from {importedMeta.device_name ?? "device"}
              </p>
              <p className="text-muted">
                {importedMeta.avg_hr != null ? `avg HR ${importedMeta.avg_hr}` : "no HR data"}
                {importedMeta.max_hr != null ? ` · max ${importedMeta.max_hr}` : ""}
                {importedMeta.elevation_gain_m > 5
                  ? ` · +${importedMeta.elevation_gain_m} m elevation`
                  : ""}
              </p>
            </div>
          ) : null}

          {/* Distance + Duration.
              - Distance hidden for crossfit_class, other, row, ski_erg
                (classes have no distance; ergs use the bottom-block Total
                time instead). For those the Duration input takes the full
                row width.
              - Duration always visible — every session has a length. */}
          {(() => {
            const showDistance =
              activity !== "crossfit_class" &&
              activity !== "other" &&
              activity !== "row" &&
              activity !== "ski_erg";
            return (
              <div className={showDistance ? "grid grid-cols-2 gap-2" : ""}>
                {showDistance ? (
                  <label className="text-[12px] text-muted">
                    Distance (km)
                    <input
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      min={0}
                      max={500}
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="e.g. 5"
                      className="mt-0.5 block w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                    />
                  </label>
                ) : null}
                {/* Duration hidden for row/ski_erg — they use the bottom
                    block Total time instead. Cycle keeps the top duration
                    because distance + duration is the natural bike pair. */}
                {activity !== "row" && activity !== "ski_erg" ? (
                  <div className="text-[12px] text-muted">
                    Duration
                    <div className="mt-0.5 flex gap-1 items-center">
                      <input
                        type="number"
                        inputMode="numeric"
                        step={1}
                        min={0}
                        max={600}
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        placeholder="min"
                        aria-label="Minutes"
                        className="block w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                      />
                      <span className="font-mono text-muted">:</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        step={1}
                        min={0}
                        max={59}
                        value={seconds}
                        onChange={(e) => setSeconds(e.target.value)}
                        placeholder="sec"
                        aria-label="Seconds"
                        className="block w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()}

          {/* HR — only render for cardio-relevant activities and only when a
              GPX wasn't imported (GPX auto-fills these values). Manual entry
              helps users who wore a chest strap but didn't have a GPX device. */}
          {!importedMeta && activity !== "walk" && activity !== "other" ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[12px] text-muted">
                Avg HR (bpm)
                <input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={30}
                  max={230}
                  value={avgHr}
                  onChange={(e) => setAvgHr(e.target.value)}
                  placeholder="optional"
                  className="mt-0.5 block w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                />
              </label>
              <label className="text-[12px] text-muted">
                Max HR (bpm)
                <input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={30}
                  max={230}
                  value={maxHr}
                  onChange={(e) => setMaxHr(e.target.value)}
                  placeholder="optional"
                  className="mt-0.5 block w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                />
              </label>
            </div>
          ) : null}
          <div className="flex gap-1.5">
            {(["easy", "moderate", "hard"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setIntensity(v)}
                aria-pressed={intensity === v}
                className={cn(
                  "flex-1 min-h-[36px] px-3 rounded font-mono text-[12px] uppercase tracking-wider",
                  intensity === v
                    ? "bg-slate text-surface"
                    : "bg-line-soft text-muted hover:text-ink",
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Rowing / erg-specific fields — show when the activity picks that
              modality OR the active program is a rowing test-prep, so the
              user can log a 2K test time even from an "other" slot. */}
          {(activity === "row" || activity === "ski_erg" || activity === "cycle" ||
            activeProgramSlug === "rowing-2k-test-prep") ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(["z2", "technique", "threshold", "race_pace", "2k_test", "recovery"] as const).map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSessionType(sessionType === t ? "" : t)}
                      aria-pressed={sessionType === t}
                      className={cn(
                        "px-2.5 py-1.5 min-h-[36px] rounded-full font-mono text-[11px]",
                        sessionType === t
                          ? "bg-slate text-surface"
                          : "bg-line-soft text-muted hover:text-ink",
                      )}
                    >
                      {t === "2k_test" ? "2K test" : t.replace(/_/g, " ")}
                    </button>
                  ),
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[12px] text-muted">
                  Total time (mm:ss)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={twoKTime}
                    onChange={(e) => setTwoKTime(e.target.value)}
                    placeholder="e.g. 7:35"
                    className="mt-0.5 block w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                  />
                </label>
                <label className="text-[12px] text-muted">
                  Avg watts
                  <input
                    type="number"
                    inputMode="numeric"
                    step={1}
                    min={20}
                    max={2000}
                    value={watts}
                    onChange={(e) => setWatts(e.target.value)}
                    placeholder="optional"
                    className="mt-0.5 block w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                  />
                </label>
              </div>
              {twoKTime && parseTimeToSeconds(twoKTime) ? (
                <p className="text-[11px] text-muted font-mono">
                  ≈ {Math.round(parseTimeToSeconds(twoKTime)! / 4)}s per 500m split
                </p>
              ) : null}
            </div>
          ) : null}

          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note — WOD name, felt like…"
            className="block w-full text-[14px] px-2 py-1.5 border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate resize-y min-h-[44px] break-words [overflow-wrap:anywhere] whitespace-pre-wrap"
          />
          <EngineReadsNotesHint variant="run" />

          {/* Pre-flight interference warning — fires BEFORE the user logs a
              hard cardio session near a scheduled lift. Concurrent programs
              (CSM, Engine Builder's implicit concurrent policy) want ≥6h
              separation. Round-3 Persona C flagged: banner only fires after
              logging; the fix is to also warn before. */}
          {intensity === "hard" &&
          (activeProgramSlug === "concurrent-strength-maintenance" ||
            activeProgramSlug === "engine-builder") ? (
            <div className="rounded border border-amber/40 bg-amber/10 border-l-4 border-l-amber px-3 py-2 text-[11px]">
              <p className="font-semibold text-amber">Heads up — interference window.</p>
              <p className="text-muted mt-0.5">
                Hard cardio wants ≥6h between it and any heavy lift. If you have
                a strength session on the schedule for today, log this only if
                the two are that far apart.
              </p>
            </div>
          ) : null}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={submit}
              className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-slate text-surface"
            >
              Save session
            </button>
            <button
              type="button"
              onClick={reset}
              className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 min-h-[44px] py-2 pr-2 text-[14px] text-slate hover:text-ink"
          >
            <Plus size={14} />
            Log session
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 min-h-[44px] py-2 pr-2 text-[14px] text-slate hover:text-ink"
          >
            <Upload size={14} />
            Import GPX
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        onChange={onFile}
        className="hidden"
        aria-hidden
      />

      {importError ? (
        <p className="text-[14px] text-red">Couldn&apos;t import: {importError}</p>
      ) : null}

      {primerOpen ? (
        <InfoSheet title="Around your session" onClose={() => setPrimerOpen(false)}>
          <PrimerContent activity={activity} activeProgramSlug={activeProgramSlug} />
        </InfoSheet>
      ) : null}
    </section>
  );
}

/**
 * Warm-up / cool-down guidance per activity type. Running-specific strides
 * are wrong on a bike day; hip-flexor iso is wrong for a rower. Content
 * swaps based on the picked activity.
 */
function PrimerContent({
  activity,
  activeProgramSlug,
}: {
  activity: ActivityType;
  activeProgramSlug: string | null | undefined;
}) {
  const isHip = activeProgramSlug === "anterior-hip-rebuild";
  const before: string[] = (() => {
    switch (activity) {
      case "row":
      case "ski_erg":
        return [
          "5 min very easy on the erg (Z1) — drive/return sequence, no power",
          "T-spine open books × 8/side",
          "Hip hinge × 10 (no load, feel the pull)",
          "Legs-arms-body drill × 10 strokes",
        ];
      case "cycle":
        return [
          "5 min very easy spin (Z1) — 90 rpm, no resistance",
          "Standing knee raise × 8/side",
          "Hip 90/90 switches × 6/side",
          "Two 20-sec spin-up efforts at ~85% before workset",
        ];
      case "crossfit_class":
        return [
          "The box's own warm-up replaces this — arrive on time",
          "If early: 3 min row or bike at Z1",
          "5-10 shoulder passes with a PVC / dowel",
        ];
      case "hyrox":
        return [
          "5 min alternating easy row + easy run (Z1)",
          "Hip hinge × 10",
          "Wall sit 20 s + goblet squat × 5 (light)",
          "Two 20-sec pickup efforts",
        ];
      case "walk":
        return ["Just walk — start slow. This is the warm-up."];
      default:
        return [
          "Glute bridge × 15",
          "Controlled leg swings",
          "A-march",
          isHip ? "Bent-knee adductor iso — 5 × 10 s" : "Skips or strides — 4 × 20 m at rising effort",
          isHip ? "Seated hip-flexor iso — 2 × 20 s" : "One 30-sec stride at target pace",
        ];
    }
  })();
  const after: string[] = (() => {
    switch (activity) {
      case "row":
      case "ski_erg":
        return [
          "3-5 min easy stroke / paddle down before stopping",
          "Standing forward fold — passive, no push",
          "Child's pose × 30 s",
        ];
      case "cycle":
        return [
          "Spin down 3 min at low resistance",
          "Standing quad stretch × 30 s/side",
          "Hip flexor lunge stretch × 30 s/side",
        ];
      case "crossfit_class":
        return ["Class cool-down usually covers this", "One long deep breath sequence"];
      default:
        return [
          "Walk 3-5 min before stopping",
          "90/90 hip switches",
          isHip ? "Easy kneeling hip-flexor stretch" : "Standing calf stretch × 30 s/side",
        ];
    }
  })();
  return (
    <>
      <p className="text-[14px] text-muted">
        {activity === "crossfit_class"
          ? "The box's own warm-up replaces this."
          : "Session-specific primer + cool-down. Skip the ones that don't apply."}
      </p>
      <div>
        <p className="font-semibold text-strong">Before (~5 min)</p>
        <ul className="mt-1 list-disc pl-5 space-y-1 text-muted">
          {before.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-semibold text-strong">After (~5 min)</p>
        <ul className="mt-1 list-disc pl-5 space-y-1 text-muted">
          {after.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="text-[14px] text-red mt-2">
          No aggressive static stretching straight after — tissue is warm and stretches too far.
        </p>
      </div>
    </>
  );
}

const ACTIVITY_ORDER: ActivityType[] = [
  "run",
  "hyrox",
  "crossfit_class",
  "cycle",
  "row",
  "ski_erg",
  "walk",
  "other",
];

function prettyActivity(a: ActivityType | undefined): string {
  const map: Record<ActivityType, string> = {
    run: "Run",
    hyrox: "HYROX",
    crossfit_class: "CrossFit class",
    cycle: "Bike",
    row: "Row",
    ski_erg: "Ski erg",
    walk: "Walk",
    other: "Other",
  };
  return a ? map[a] : "Session";
}

function slotForDow(dow: number): {
  type: "primary" | "optional" | "none";
  title: string;
  detail: string;
} {
  if (dow === 2 || dow === 5) {
    return {
      type: "primary",
      title: "Primary conditioning day",
      detail:
        "30-45 min. CrossFit class, run, HYROX simulation, or intervals of your choice.",
    };
  }
  if (dow === 3 || dow === 6) {
    return {
      type: "optional",
      title: "Optional easy session",
      detail:
        "Up to 20-30 min Z1 only — after the barbell work, never before. Keep it conversational.",
    };
  }
  if (dow === 1 || dow === 4) {
    return {
      type: "none",
      title: "Heavy squat day — keep conditioning light",
      detail:
        "The plan doesn't schedule anything here. If you do something, keep it easy (walk, mobility, easy row) — a hard session eats into next barbell day.",
    };
  }
  return {
    type: "none",
    title: "Rest day — nothing scheduled",
    detail:
      "The plan wants a full rest. If you did something anyway (walk, class, easy ride), log it here so the engine sees the load.",
  };
}
