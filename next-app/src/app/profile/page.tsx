"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Database,
  BookOpen,
  LogOut,
  ChevronRight,
  X,
  MessageSquare,
} from "lucide-react";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { useIsSuperAdmin } from "@/lib/super-admin";
import { loadProgramManifest } from "@/lib/data-loader";
import type { ProgramManifest } from "@/lib/schemas";

/**
 * Profile — the user's home for identity, personal config, and account controls.
 *
 * Structure follows the IA audit (2026-08-11):
 *   - Identity card (email, tier)
 *   - My plan → deep link to current program + catalog
 *   - My constraints → contraindications editor (moved from /data)
 *   - Data & privacy → import / export / wipe (link to /data)
 *   - Coach (beta) — placeholder until AI wired
 *   - Help → guide
 *   - Sign out (destructive at bottom, 2 taps to reach)
 *
 * Mobile-first: single column, stacked sections, ≥44px tap targets.
 */
export default function ProfilePage() {
  const store = useStore((s) => s.store);
  const isSuperAdmin = useIsSuperAdmin();
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      const created = data.user?.created_at;
      if (created) {
        try {
          const d = new Date(created);
          setMemberSince(
            d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
          );
        } catch {
          /* ignore */
        }
      }
    });
    void loadProgramManifest().then(setManifest).catch(() => setManifest(null));
  }, []);

  const logs = store.logs ?? {};
  const daysWithAnyLog = Object.entries(logs).filter(
    ([, day]) => Object.values(day.exercises ?? {}).some((e) => e.done) || day.symptoms != null,
  );
  const sessionsLogged = daysWithAnyLog.filter(([, day]) =>
    Object.values(day.exercises ?? {}).some((e) => e.done),
  ).length;
  const morningChecksLogged = Object.values(logs).filter((d) => d.symptoms != null).length;
  const activeWeeks = (() => {
    if (!daysWithAnyLog.length) return 0;
    const weeks = new Set<string>();
    for (const [iso] of daysWithAnyLog) {
      const d = new Date(iso + "T00:00:00");
      if (Number.isNaN(d.getTime())) continue;
      const jan1 = new Date(d.getFullYear(), 0, 1).getTime();
      const week = Math.floor((d.getTime() - jan1) / (7 * 864e5));
      weeks.add(`${d.getFullYear()}-${week}`);
    }
    return weeks.size;
  })();

  const activeProgramId = store.user_profile?.active_program_id ?? null;
  const activeProgramIds = store.user_profile?.active_program_ids;
  const activeSlugs = activeProgramIds && activeProgramIds.length
    ? activeProgramId
      ? [activeProgramId, ...activeProgramIds.filter((s) => s !== activeProgramId)]
      : activeProgramIds
    : activeProgramId
      ? [activeProgramId]
      : [];
  const activePrograms = activeSlugs
    .map((slug) => manifest?.programs.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const removeActiveProgram = useStore((s) => s.removeActiveProgram);

  const signOut = async () => {
    const ok = confirm("Sign out? Your data stays synced — you can sign back in any time.");
    if (!ok) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/sign-in";
  };

  return (
    <div className="space-y-5 pt-4 pb-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-[13.5px] text-muted truncate">
            {email ?? (
              <span className="inline-block w-48 h-4 bg-line-soft rounded animate-pulse" aria-label="Loading email" />
            )}
          </p>
          {isSuperAdmin ? (
            <span
              className="font-mono text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/20 text-slate flex-shrink-0"
              title="Super admin — multi-plan enrollment unlocked."
            >
              admin
            </span>
          ) : null}
        </div>
        {memberSince ? (
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted flex-shrink-0">
            since {memberSince}
          </p>
        ) : null}
      </div>

      <div className="rounded border border-line-soft bg-surface p-3 grid grid-cols-3 gap-2">
        <Stat value={sessionsLogged} label="sessions" />
        <Stat value={activeWeeks} label={activeWeeks === 1 ? "week active" : "weeks active"} />
        <Stat value={morningChecksLogged} label={morningChecksLogged === 1 ? "check" : "checks"} />
      </div>

      {/* Active plan(s) — no section title, the list IS the section */}
      {activePrograms.length ? (
        <ul className="rounded border border-line-soft divide-y divide-line-soft">
          {activePrograms.map((p, i) => {
            const isPrimary = i === 0 && p.slug === activeProgramId;
            const canRemove = activePrograms.length > 1;
            return (
              <li key={p.slug} className="flex items-center gap-1 px-1">
                <Link
                  href={`/programs/${p.slug}`}
                  className="flex items-center gap-2 flex-1 min-w-0 min-h-[48px] px-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-strong truncate flex items-center gap-1.5">
                      {p.name}
                      {isPrimary && activePrograms.length > 1 ? (
                        <span className="font-mono text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze/20 text-bronze">
                          primary
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[11.5px] text-muted mt-0.5">
                      {p.duration_weeks} weeks · {p.difficulty}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted flex-shrink-0" />
                </Link>
                {canRemove ? (
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => {
                      if (confirm(`Remove ${p.name} from your active programs? Your log history stays.`)) {
                        removeActiveProgram(p.slug);
                      }
                    }}
                    className="text-muted hover:text-red w-9 h-9 flex items-center justify-center rounded flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <Link
          href="/programs"
          className="inline-block font-mono text-[11.5px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground min-h-[44px]"
        >
          Pick a program →
        </Link>
      )}

      <nav aria-label="More" className="rounded border border-line-soft divide-y divide-line-soft">
        <Link
          href="/coach"
          className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px]"
        >
          <span className="flex items-center gap-3 text-[13.5px]">
            <MessageSquare size={16} className="text-muted" />
            Ask coach
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
        <Link
          href="/guide"
          className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px]"
        >
          <span className="flex items-center gap-3 text-[13.5px]">
            <BookOpen size={16} className="text-muted" />
            How this app works
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
        <Link
          href="/data"
          className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px]"
        >
          <span className="flex items-center gap-3 text-[13.5px]">
            <Database size={16} className="text-muted" />
            Manage data
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
      </nav>

      {/* Legal links */}
      <nav aria-label="Legal" className="pt-2 flex flex-wrap gap-4 text-[12px] text-muted">
        <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
        <Link href="/legal/disclaimer" className="hover:text-ink">Medical disclaimer</Link>
      </nav>

      {/* Sign out — destructive, at the bottom */}
      <section className="pt-4">
        <button
          type="button"
          onClick={signOut}
          className="w-full inline-flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-red/40 text-red hover:bg-red/10 min-h-[48px]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[20px] font-semibold text-strong tabular-nums leading-none">{value}</p>
      <p className="text-[10.5px] uppercase tracking-wider text-muted mt-1">{label}</p>
    </div>
  );
}
