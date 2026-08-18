"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  BookOpen,
  LogOut,
  ChevronRight,
  X,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { useIsSuperAdmin } from "@/lib/super-admin";
import { loadProgramManifest } from "@/lib/data-loader";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { today } from "@/lib/utils";
import type { ProgramManifest } from "@/lib/schemas";

/**
 * Profile — the user's home for identity, personal config, and account controls.
 *
 * Structure follows the IA audit (2026-08-11):
 *   - Identity card (email, tier)
 *   - My plan → deep link to current program + catalog
 *   - My constraints → contraindications editor
 *   - Data & privacy → inline JSON export + account delete
 *   - Coach (beta) — placeholder until AI wired
 *   - Help → guide
 *   - Sign out (destructive at bottom, 2 taps to reach)
 *
 * Mobile-first: single column, stacked sections, ≥44px tap targets.
 */
export default function ProfilePage() {
  const store = useStore((s) => s.store);
  const wipe = useStore((s) => s.wipe);
  const isSuperAdmin = useIsSuperAdmin();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const exportMyData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terav-data-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    setDeleteError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setDeleteError("Not signed in. Sign in first, then try again.");
        setDeleting(false);
        return;
      }
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setDeleteError(
          `Delete failed (${res.status}). ${text || "Try again in a moment."}`,
        );
        setDeleting(false);
        return;
      }
      wipe();
      await supabase.auth.signOut();
      router.replace("/sign-in");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  };

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
  // 7-day compliance summary — replaces lifetime vanity stats (sessions /
  // weeks active / checks). A rolling 7-day window tells you whether THIS
  // WEEK is on plan; lifetime numbers just grow monotonically and don't drive
  // any behavior. TrainingPeaks / Whoop compliance-ring convention.
  const rollingWindow = (() => {
    const days: { iso: string; day: (typeof logs)[string] | undefined; isPast: boolean }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ iso, day: logs[iso], isPast: i > 0 });
    }
    return days;
  })();
  const daysSessionsDone = rollingWindow.filter(
    ({ day }) => day && Object.values(day.exercises ?? {}).some((e) => e.done),
  ).length;
  const daysChecksLogged = rollingWindow.filter(({ day }) => day?.symptoms != null).length;
  // Legacy — for the "since" line only (kept small).
  const daysWithAnyLog = Object.entries(logs).filter(
    ([, day]) => Object.values(day.exercises ?? {}).some((e) => e.done) || day.symptoms != null,
  );
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
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState<null | (typeof activePrograms)[number]>(null);

  const doSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/sign-in";
  };

  return (
    <div className="space-y-5 pt-4 pb-6">
      <h1 className="sr-only">Profile</h1>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-sm text-muted truncate">
            {email ?? (
              <span className="inline-block w-48 h-4 bg-line-soft rounded animate-pulse" aria-label="Loading email" />
            )}
          </p>
          {isSuperAdmin ? (
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/20 text-slate flex-shrink-0"
              title="Super admin — multi-plan enrollment unlocked."
            >
              admin
            </span>
          ) : null}
        </div>
        {memberSince ? (
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted flex-shrink-0">
            since {memberSince}
          </p>
        ) : null}
      </div>

      <div className="rounded border border-line-soft bg-surface p-3 space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">This week</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {activeWeeks} {activeWeeks === 1 ? "wk" : "wks"} logged total
          </p>
        </div>
        <ComplianceRow label="Sessions" value={daysSessionsDone} target={7} accent="bronze" />
        <ComplianceRow label="Morning checks" value={daysChecksLogged} target={7} accent="green" />
        <div className="flex gap-0.5 pt-1">
          {rollingWindow.map(({ iso, day }) => {
            const done = day && Object.values(day.exercises ?? {}).some((e) => e.done);
            const check = day?.symptoms != null;
            const cls = done && check
              ? "bg-green"
              : done
                ? "bg-bronze"
                : check
                  ? "bg-green/40"
                  : "bg-line";
            return (
              <span
                key={iso}
                title={iso}
                className={`flex-1 h-1.5 rounded-full ${cls}`}
                aria-label={`${iso}: ${done ? "session done" : "no session"}, ${check ? "check saved" : "no check"}`}
              />
            );
          })}
        </div>
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
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze/20 text-bronze">
                          primary
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {p.duration_weeks} weeks · {p.difficulty}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted flex-shrink-0" />
                </Link>
                {canRemove ? (
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => setRemoveOpen(p)}
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
          className="inline-block font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground min-h-[44px]"
        >
          Pick a program →
        </Link>
      )}

      <nav aria-label="More" className="rounded border border-line-soft divide-y divide-line-soft">
        <Link
          href="/coach"
          className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px]"
        >
          <span className="flex items-center gap-3 text-sm">
            <MessageSquare size={16} className="text-muted" />
            Ask coach
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
        <Link
          href="/guide"
          className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px]"
        >
          <span className="flex items-center gap-3 text-sm">
            <BookOpen size={16} className="text-muted" />
            How this app works
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
        <button
          type="button"
          onClick={exportMyData}
          className="w-full flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px] text-left"
        >
          <span className="flex items-center gap-3 text-sm">
            <Download size={16} className="text-muted" />
            Export my data
          </span>
          <span className="text-[11px] font-mono text-muted uppercase tracking-widest">
            JSON
          </span>
        </button>
      </nav>

      {/* Legal links */}
      <nav aria-label="Legal" className="pt-2 flex flex-wrap gap-4 text-[12px] text-muted">
        <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
        <Link href="/legal/disclaimer" className="hover:text-ink">Medical disclaimer</Link>
      </nav>

      {/* Delete-account cascade (GDPR right-to-erasure).
          Deletes the Supabase auth user; user_states + user_state_snapshots
          cascade automatically via ON DELETE CASCADE. Local storage wiped
          on the client after the server confirms. */}
      <section className="rounded border border-red/40 bg-red/5 p-4 space-y-3">
        <div>
          <h2 className="text-[14px] font-semibold text-strong">Delete my account</h2>
          <p className="text-[12px] text-muted mt-1 leading-relaxed">
            Permanently removes your account, training log, morning checks,
            and every synced entry. Cannot be recovered.
          </p>
        </div>
        {deleteError ? (
          <p className="text-[12px] text-red border-l-4 border-red pl-2">{deleteError}</p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setConfirmDelete(true);
          }}
          disabled={deleting}
          className="w-full inline-flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-red/40 text-red hover:bg-red/10 min-h-[48px] disabled:opacity-50"
        >
          <Trash2 size={14} />
          {deleting ? "Deleting…" : "Delete my account permanently"}
        </button>
      </section>

      {/* Beta features — block-object rebuild rollout gate.
          See dev/active/block-object-rebuild-2026-08-18.md §6.
          Founder flips this on their own account to validate Today view
          per-program cards + Skip/Move + fixed duplication bug. Off by
          default; legacy behavior when off. */}
      <BetaFeatureToggles />

      {/* Sign out — destructive, at the bottom */}
      <section className="pt-4">
        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-red/40 text-red hover:bg-red/10 min-h-[48px]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </section>

      <ConfirmSheet
        open={signOutOpen}
        title="Sign out?"
        body="Your data stays synced — you can sign back in any time."
        confirmLabel="Sign out"
        onConfirm={() => {
          setSignOutOpen(false);
          void doSignOut();
        }}
        onCancel={() => setSignOutOpen(false)}
      />
      <ConfirmSheet
        open={!!removeOpen}
        title={removeOpen ? `Remove ${removeOpen.name}?` : ""}
        body="Your log history stays. You can pick a new program any time from Programs."
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (removeOpen) removeActiveProgram(removeOpen.slug);
          setRemoveOpen(null);
        }}
        onCancel={() => setRemoveOpen(null)}
      />
      <ConfirmSheet
        open={confirmDelete}
        title="Delete your account permanently?"
        body="This deletes your account, all logs, training maxes, morning checks, and every synced entry on our server. You cannot recover any of it after this action."
        confirmLabel="Delete forever"
        danger
        onConfirm={() => void deleteAccount()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function BetaFeatureToggles() {
  const blockObject = useStore((s) => s.store.feature_flags?.block_object === true);
  const setFeatureFlag = useStore((s) => s.setFeatureFlag);
  return (
    <section className="rounded border border-line-soft bg-surface p-4 space-y-3">
      <header>
        <h2 className="text-[14px] font-semibold text-strong">Beta features</h2>
        <p className="text-[12px] text-muted mt-0.5">
          Preview features that aren&apos;t final. You can turn them off anytime.
        </p>
      </header>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={blockObject}
          onChange={(e) => setFeatureFlag("block_object", e.target.checked)}
          className="mt-1 flex-shrink-0 w-5 h-5"
        />
        <span className="text-[13px] text-strong leading-relaxed">
          <span className="font-semibold">Per-track Skip and Move</span>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            default on
          </span>
          <span className="block text-[12px] text-muted mt-0.5">
            Each track&apos;s session gets its own Skip / Move menu, so you can
            skip one while keeping another. Uncheck to revert to the old
            whole-day Skip.
          </span>
        </span>
      </label>
    </section>
  );
}

function ComplianceRow({
  label,
  value,
  target,
  accent,
}: {
  label: string;
  value: number;
  target: number;
  accent: "bronze" | "green";
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const fillClass = accent === "bronze" ? "bg-bronze" : "bg-green";
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-ink">{label}</span>
        <span className="font-mono text-muted">
          <span className="text-strong">{value}</span> / {target}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-line-soft overflow-hidden">
        <div className={`h-full ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[20px] font-semibold text-strong tabular-nums leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted mt-1">{label}</p>
    </div>
  );
}
