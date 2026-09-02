/**
 * Completed-arc aggregation for `GET /api/admin/completions` (EVID-2).
 *
 * Lives here rather than inside the Pages Function so it can be tested without
 * a database or the Cloudflare Workers type environment. The first version put
 * it in the function and imported that from a test — which dragged `functions/`
 * into the Next app's tsconfig scope, where `PagesFunction` is not declared,
 * and broke the production build's type check. `tsc -p tsconfig.json` did not
 * catch it locally; `next build` did.
 */
type ProgramState = {
  graduated_at?: string;
  graduation_feedback?: { rating?: string | number };
};

export type CompletionRow = {
  slug: string;
  completed: number;
  graduated_with_feedback: number;
  first_completion: string | null;
  latest_completion: string | null;
};

/**
 * Pure aggregation, exported so it can be tested without a database. Takes the
 * raw `state` blobs and returns one row per program that anyone has finished.
 */
export function tallyCompletions(states: unknown[]): CompletionRow[] {
  const rows = new Map<string, CompletionRow>();
  for (const raw of states) {
    const profile = (raw as { user_profile?: { program_states?: Record<string, ProgramState> } })
      ?.user_profile;
    const programStates = profile?.program_states;
    if (!programStates) continue;
    for (const [slug, st] of Object.entries(programStates)) {
      const at = st?.graduated_at;
      if (typeof at !== "string" || !at) continue;
      const row = rows.get(slug) ?? {
        slug,
        completed: 0,
        graduated_with_feedback: 0,
        first_completion: null,
        latest_completion: null,
      };
      row.completed += 1;
      if (st.graduation_feedback?.rating != null) row.graduated_with_feedback += 1;
      const day = at.slice(0, 10);
      if (!row.first_completion || day < row.first_completion) row.first_completion = day;
      if (!row.latest_completion || day > row.latest_completion) row.latest_completion = day;
      rows.set(slug, row);
    }
  }
  // Most-completed first — the promotion question is "which is closest to 5".
  return [...rows.values()].sort((a, b) => b.completed - a.completed || a.slug.localeCompare(b.slug));
}
