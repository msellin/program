/**
 * Proposal-kind → citation-id lookup.
 *
 * A2 (Phase 1). Each proposal kind that IS study-cited (rather than purely
 * log-cited) resolves to a canonical citation ID. Log-cited proposals return
 * `null` and render with `Because: {log-derived reason}` only.
 *
 * When A1 ships the overperformer TM-bump rule, its citation is already
 * wired here (`rhea_2003_meta`). Downstream: A5's ProposalStack absorbs
 * these calls once the discriminated `Proposal` union lands.
 */

export type ProposalKind =
  | "readiness_after_layoff"
  | "day_adjustment_soften"
  | "tier_advance"
  | "tm_bump"
  | "missed_session";

const CITATION_BY_KIND: Record<ProposalKind, string | null> = {
  readiness_after_layoff: "kraemer_2002_acsm_position_stand",
  day_adjustment_soften: null,
  tier_advance: "rhea_2003_meta",
  tm_bump: "rhea_2003_meta",
  missed_session: null,
};

export function citationIdForKind(kind: ProposalKind): string | null {
  return CITATION_BY_KIND[kind];
}
