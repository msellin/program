/**
 * /dev/primitives — v1.1.1 §6 migration step 1 "story route."
 *
 * Every Batch 36 primitive rendered in isolation with realistic props.
 * Visual-craft QA runs against this route BEFORE any primitive touches
 * a surface. Explicit gate per §6: "if not alive by end of week 1,
 * PAUSE and rescope."
 *
 * Not linked from anywhere in the app. Reachable only via direct URL.
 * Not gated by auth for now — the primitives don't leak user data (all
 * examples are dummy). If prod-hardening becomes necessary, wrap in an
 * env flag or auth check.
 */

"use client";

import { useState } from "react";
import { Dumbbell, Wind, RefreshCw, Timer, Sparkles, ShieldCheck } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { MetricStripCluster } from "@/components/ui/MetricStripCluster";
import { WorkoutHero } from "@/components/ui/WorkoutHero";
import { WeeklySessionStrip } from "@/components/ui/WeeklySessionStrip";
import { ArcProgressBar } from "@/components/ui/ArcProgressBar";
import { CategoryTileGrid } from "@/components/ui/CategoryTileGrid";
import { WeeklyHeatmap, type WeeklyHeatmapCell } from "@/components/ui/WeeklyHeatmap";
import { OutcomeBar } from "@/components/ui/OutcomeBar";
import { ProposalCard } from "@/components/ui/ProposalCard";
import { StickyCta } from "@/components/ui/StickyCta";
import { Sparkline } from "@/components/charts/Sparkline";
import { InfoSheet } from "@/components/InfoSheet";

export default function PrimitivesStory() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stickyDemo, setStickyDemo] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<"pending" | "accepted" | "ignored">(
    "pending",
  );

  return (
    <div className="min-h-screen bg-ground text-ink pb-24">
      <div className="max-w-[760px] mx-auto px-4 py-6 space-y-10">
        <header className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-bronze">
            /dev/primitives
          </p>
          <h1 className="text-[32px] font-semibold text-strong tracking-[-0.03em] leading-tight">
            Terav primitive story
          </h1>
          <p className="text-[14px] text-muted leading-snug">
            v1.1.1 primitives in isolation. Visual-craft QA runs against this route
            before any primitive touches a surface. See{" "}
            <code className="font-mono text-[12px] text-bronze">
              dev/audits/app/2026-08-20-terav-design-system-v1.1.md
            </code>{" "}
            for the contract.
          </p>
        </header>

        <Section title="StatusPill · §2.12">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill label="Workout ready" tone="green" />
            <StatusPill label="Check first" tone="amber" />
            <StatusPill label="Back off" tone="red" />
            <StatusPill label="Moved from Tue" tone="slate" />
            <StatusPill label="Rest day" tone="muted" />
            <StatusPill label="Interactive" tone="slate" interactive />
          </div>
        </Section>

        <Section title="MetricStripCluster · §2.7">
          <div className="rounded border border-line-soft bg-surface p-3">
            <MetricStripCluster
              items={[
                { label: "Duration", value: "48 min" },
                { label: "Blocks", value: "3" },
                { label: "Target", value: "Z2" },
              ]}
              ariaGroupLabel="Session metrics"
            />
          </div>
          <div className="rounded border border-line-soft bg-surface p-3">
            <MetricStripCluster
              items={[
                { label: "Baseline", value: "70 kg", tone: "muted" },
                { label: "Current", value: "82.5 kg", tone: "strong" },
                { label: "Δ", value: "+12.5 kg", tone: "green" },
              ]}
              ariaGroupLabel="5RM press delta"
            />
          </div>
        </Section>

        <Section title="WorkoutHero · §2.2 (Today variant, headingLevel=1)">
          <WorkoutHero
            scope="today"
            eyebrow="TODAY · WEEK 3 OF 6"
            title="Norwegian 4×4"
            headingLevel={1}
            lede="Row/Ski alternate · concurrent engine maintenance"
            status={{ label: "Workout ready", tone: "green" }}
            metrics={[
              { label: "Duration", value: "48 min" },
              { label: "Blocks", value: "3" },
              { label: "Target", value: "Z2" },
            ]}
            blocks={[
              { number: 1, name: "Warm-up · dynamic mobility", setsLabel: "5 min", citationCount: 1 },
              { number: 2, name: "Main set · 4×4 min at Z4, 3 min recovery", setsLabel: "4 × 4 min" },
              { number: 3, name: "Cool down · easy Z1", setsLabel: "8 min" },
            ]}
            onBlockCite={(n) => alert(`Cite block ${n}`)}
            onExplain={() => setSheetOpen(true)}
            primaryCta={{ label: "Open session", href: "#" }}
          />
        </Section>

        <Section title="WeeklySessionStrip · §2.5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Display variant (Today hero)
          </p>
          <WeeklySessionStrip
            weekStart="2026-08-18"
            days={[
              { dayLetter: "M", scheduled: true, completed: true, isToday: false, isRest: false },
              { dayLetter: "T", scheduled: true, completed: true, isToday: false, isRest: false },
              { dayLetter: "W", scheduled: true, completed: false, isToday: true, isRest: false },
              { dayLetter: "T", scheduled: false, completed: false, isToday: false, isRest: true },
              { dayLetter: "F", scheduled: true, completed: false, isToday: false, isRest: false },
              { dayLetter: "S", scheduled: true, completed: false, isToday: false, isRest: false },
              { dayLetter: "S", scheduled: false, completed: false, isToday: false, isRest: true },
            ]}
          />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted pt-2">
            Interactive variant (/week)
          </p>
          <WeeklySessionStrip
            weekStart="2026-08-18"
            interactive
            onCellTap={(i) => alert(`Day index ${i}`)}
            days={[
              { dayLetter: "M", scheduled: true, completed: true, isToday: false, isRest: false },
              { dayLetter: "T", scheduled: true, completed: true, isToday: false, isRest: false },
              { dayLetter: "W", scheduled: true, completed: false, isToday: true, isRest: false },
              { dayLetter: "T", scheduled: false, completed: false, isToday: false, isRest: true },
              { dayLetter: "F", scheduled: true, completed: false, isToday: false, isRest: false },
              { dayLetter: "S", scheduled: true, completed: false, isToday: false, isRest: false },
              { dayLetter: "S", scheduled: false, completed: false, isToday: false, isRest: true },
            ]}
          />
        </Section>

        <Section title="ArcProgressBar · §2.6">
          <ArcProgressBar
            programName="Norwegian 4×4"
            weekCurrent={3}
            weekTotal={6}
            retestSchedule={[
              { weekIndex: 3, label: "5RM press" },
              { weekIndex: 6, label: "2K row time" },
            ]}
            nextMilestone="Week 3 retest"
            ariaLabel="Norwegian 4×4 progress: week 3 of 6. Next retest week 3."
          />
        </Section>

        <Section title="CategoryTileGrid · §2.8 (2×3 for /programs)">
          <CategoryTileGrid
            onTileTap={(id) => alert(`Category ${id}`)}
            categories={[
              { id: "strength", name: "Strength", Glyph: Dumbbell, tint: "bronze", count: 5, pitch: "Barbell + tempo" },
              { id: "aerobic", name: "Aerobic", Glyph: Wind, tint: "slate", count: 3, pitch: "Engine builders" },
              { id: "concurrent", name: "Concurrent", Glyph: RefreshCw, tint: "slate", count: 2, pitch: "Strength + endurance" },
              { id: "skill", name: "Skill", Glyph: Sparkles, tint: "slate", count: 4, pitch: "Handstand · rings" },
              { id: "mobility", name: "Mobility", Glyph: Timer, tint: "slate", count: 6, pitch: "Overhead · hip" },
              { id: "rehab", name: "Rehab", Glyph: ShieldCheck, tint: "slate", count: 1, pitch: "Post-injury protocols" },
            ]}
          />
        </Section>

        <Section title="WeeklyHeatmap · §2.9">
          <WeeklyHeatmap
            cells={buildFakeHeatmap(12)}
            ariaLabel="Session history, past 12 weeks: 42 green days, 8 amber, 2 red, 12 rest, 20 no session logged."
            onRowTap={(w) => alert(`Week ${w}`)}
          />
        </Section>

        <Section title="OutcomeBar · §2.10">
          <div className="rounded border border-line-soft bg-surface p-3 space-y-4">
            <OutcomeBar
              metricName="5RM press"
              baselineValue="70 kg"
              targetValue="85 kg"
              rangeCaption="Typical range +10 to +18 kg over 8 weeks"
            />
            <OutcomeBar
              metricName="2K row time"
              baselineValue="8:42"
              targetValue="8:05"
              rangeCaption="Typical range -20 to -45 s over 12 weeks"
            />
          </div>
        </Section>

        <Section title="Sparkline · §2.3 (with targetValue + caption)">
          <div className="flex flex-wrap items-center gap-6">
            <Sparkline values={[70, 72.5, 75, 77.5, 80, 82.5]} direction="improving" width={140} height={32} />
            <Sparkline
              values={[70, 72.5, 75, 77.5, 80, 82.5]}
              direction="improving"
              targetValue={85}
              width={200}
              height={40}
              ariaLabel="5RM press, 6 weeks, improving. Values ranged 70 to 82.5 kg. Latest 82.5 kg. Target 85 kg."
              caption="TM · 6 weeks · +12.5 kg (target 85)"
            />
            <Sparkline values={[520, 518, 515, 513, 510, 508]} direction="worsening" width={140} height={32} />
          </div>
        </Section>

        <Section title="ProposalCard · §3.14 (generic)">
          <ProposalCard
            proposalId="demo-1"
            title="Add 2.5 kg to squat TM"
            rationale="Six weeks of RPE 7-8 sessions with all sets cleared per program rule."
            citation={{
              study: "Helms et al 2018, JSCR 32:1",
              threshold: "TM +2.5% at cycle end",
            }}
            onAccept={() => setProposalStatus("accepted")}
            onIgnore={() => setProposalStatus("ignored")}
            onUndo={() => setProposalStatus("pending")}
            status={proposalStatus}
          />
        </Section>

        <Section title="InfoSheet / ExplainSheet · §2.11">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="font-mono text-[12px] uppercase tracking-wider text-slate underline"
          >
            Open sheet
          </button>
          {sheetOpen ? (
            <InfoSheet
              title="Why today's readiness?"
              trigger="status-composite"
              citation={{
                study: "Kellmann 2010, Scand J Med Sci Sports",
                threshold: "Symptom score ≥ 4/10 for 3 days → hold load",
              }}
              logSignal={{
                signal: "Groin symptom 4/10 today (was 2/10 Mon)",
                source: "morning check",
              }}
              onClose={() => setSheetOpen(false)}
            >
              <p>
                Amber today because the morning check crossed the amber threshold. The
                block list is unchanged — engine held the load, no adjustment.
              </p>
            </InfoSheet>
          ) : null}
        </Section>

        <Section title="StickyCta · §2.14 slot">
          <button
            type="button"
            onClick={() => setStickyDemo((v) => !v)}
            className="font-mono text-[12px] uppercase tracking-wider text-slate underline"
          >
            {stickyDemo ? "Hide" : "Show"} sticky CTA demo
          </button>
          {stickyDemo ? (
            <StickyCta>
              <button
                type="button"
                onClick={() => setStickyDemo(false)}
                className="w-full min-h-[44px] rounded-lg bg-bronze text-ground font-semibold text-[14px]"
              >
                Start block ▶
              </button>
            </StickyCta>
          ) : null}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[15px] font-semibold text-strong border-b border-line-soft pb-2">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function buildFakeHeatmap(weeks: number): WeeklyHeatmapCell[] {
  const states = ["green", "green", "amber", "green", "rest", "missed", "red", "none"] as const;
  const cells: WeeklyHeatmapCell[] = [];
  const start = new Date("2026-06-01");
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d;
      const dt = new Date(start);
      dt.setDate(start.getDate() + dayOffset);
      cells.push({
        date: dt.toISOString().slice(0, 10),
        sessionState: states[(w * 7 + d) % states.length],
      });
    }
  }
  return cells;
}
