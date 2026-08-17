"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * F2 Phase A — admin view of unmatched note tokens.
 *
 * Fetches `/api/admin/keywords` (Pages Function, admin-gated by
 * ADMIN_EMAILS env var). Renders the token frequency table.
 *
 * Not linked from primary IA. Founder-only. Route reachable via typed URL
 * `/admin/keywords/`.
 */

type ApiResponse = {
  generated_at: string;
  scanned_users: number;
  scanned_notes: number;
  cutoff_date: string;
  method: string;
  source_regex: string;
  unmatched_tokens: Array<{
    token: string;
    count: number;
    distinct_users: number;
  }>;
};

export default function AdminKeywordsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKeywords = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError("Not signed in.");
        return;
      }
      const res = await fetch("/api/admin/keywords", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(`${res.status} — ${body.error ?? res.statusText}`);
        return;
      }
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  return (
    <div className="space-y-5 pt-6">
      <header className="space-y-1">
        <p className="mono-caps">Admin</p>
        <h1 className="text-2xl font-semibold text-strong">Unmatched note tokens</h1>
        <p className="text-[13px] text-muted max-w-lg">
          Tokens users typed in notes that <em>aren&apos;t</em> matched by the
          regex vocabulary in <code>note-signals.ts</code>. Sorted by frequency,
          filtered to ≥3 occurrences. Review + add promising tokens to the regex.
        </p>
      </header>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={fetchKeywords}
          disabled={loading}
          className="inline-flex items-center min-h-[44px] font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover disabled:opacity-40"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
        <Link href="/" className="text-[13px] text-muted underline underline-offset-4">
          Back to Today
        </Link>
      </div>

      {error ? (
        <div className="rounded border border-red bg-red/10 p-3 text-[13px] text-red">
          {error}
          {error.includes("Not admin") ? (
            <p className="mt-2 text-muted">
              Your account isn&apos;t in the ADMIN_EMAILS allowlist on the
              Cloudflare Pages project.
            </p>
          ) : null}
        </div>
      ) : null}

      {data ? (
        <div className="space-y-3">
          <div className="rounded border border-line bg-surface p-3 text-[12px] text-muted space-y-0.5">
            <p>
              <span className="text-strong">Scanned:</span> {data.scanned_users}{" "}
              user{data.scanned_users === 1 ? "" : "s"} · {data.scanned_notes}{" "}
              note{data.scanned_notes === 1 ? "" : "s"} since {data.cutoff_date}
            </p>
            <p>
              <span className="text-strong">Method:</span> {data.method}
            </p>
            <p>
              <span className="text-strong">Regex source:</span>{" "}
              <code>{data.source_regex}</code>
            </p>
            <p>
              <span className="text-strong">Generated:</span>{" "}
              {new Date(data.generated_at).toLocaleString()}
            </p>
          </div>

          {data.unmatched_tokens.length === 0 ? (
            <p className="text-[13px] text-muted italic">
              No unmatched tokens above the threshold. Either your regex already
              covers everything users wrote, or there aren&apos;t enough logs yet.
            </p>
          ) : (
            <table className="w-full text-[13px] border border-line rounded overflow-hidden">
              <thead>
                <tr className="bg-surface text-muted text-[11px] uppercase tracking-widest">
                  <th className="text-left px-3 py-2">Token</th>
                  <th className="text-right px-3 py-2 w-24">Count</th>
                  <th className="text-right px-3 py-2 w-24">Users</th>
                </tr>
              </thead>
              <tbody>
                {data.unmatched_tokens.map((t) => (
                  <tr key={t.token} className="border-t border-line">
                    <td className="px-3 py-2 font-mono text-ink">{t.token}</td>
                    <td className="px-3 py-2 text-right text-strong">{t.count}</td>
                    <td className="px-3 py-2 text-right text-muted">
                      {t.distinct_users}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  );
}
