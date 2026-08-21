/**
 * Cut C · Record surface · JSON export.
 *
 * Client-side blob download. Preserves the tenure-durable payload:
 *   logs · retest_readings · accepted_proposals · citations attribution
 *   · program state · contraindications
 *
 * See matrix rec #3 "Data export on launch week, not v2" — Whoop's
 * subscription-lapse-wipes-data is the explicit anti-pattern; Garmin's
 * four-format export is the peer model. Terav's differentiator is
 * exporting the citation attribution alongside every proposal — no
 * peer exports that.
 *
 * R-CutC-2: export supersedes share as the tenure-social affordance.
 */

import type { Store } from "../schemas";

export type RecordExportPayload = {
  generated_at: string;
  schema_version: string;
  user_id?: string;
  program_states?: NonNullable<Store["user_profile"]>["program_states"];
  user_profile: {
    active_program_id?: string;
    active_program_ids?: string[];
    experience_level?: string;
    goal_at_signup?: string;
    weakness_at_signup?: string;
  };
  logs: Store["logs"];
  retest_readings: NonNullable<Store["retest_readings"]>;
  accepted_proposals?: unknown;
  contraindications?: Store["contraindications"];
  training_maxes?: Store["training_maxes"];
  stretch_targets?: Store["stretch_targets"];
  /**
   * Every accepted proposal — including its citation payload — is
   * preserved so the export is bookmark-quality tenure evidence, not
   * just a raw log dump. This is Terav's differentiator (matrix G1
   * vacancy: no peer exports citation attribution).
   */
  note: string;
};

export function buildRecordExport(store: Store): RecordExportPayload {
  const acceptedProposals = (store as unknown as { accepted_proposals?: unknown }).accepted_proposals;
  return {
    generated_at: new Date().toISOString(),
    schema_version: "record-v1",
    user_id: store.user_profile?.uid,
    program_states: store.user_profile?.program_states,
    user_profile: {
      active_program_id: store.user_profile?.active_program_id,
      active_program_ids: store.user_profile?.active_program_ids,
      experience_level: store.user_profile?.experience_level,
      goal_at_signup: store.user_profile?.goal_at_signup,
      weakness_at_signup: store.user_profile?.weakness_at_signup,
    },
    logs: store.logs ?? {},
    retest_readings: store.retest_readings ?? [],
    accepted_proposals: acceptedProposals,
    contraindications: store.contraindications,
    training_maxes: store.training_maxes,
    stretch_targets: store.stretch_targets,
    note: "Terav Record export. Every accepted proposal carries its citation OR log-signal attribution — see landing at terav.fit for the confirm-first + cite-per-adjustment mechanic.",
  };
}

/**
 * Trigger a client-side download of the export as a JSON file.
 * Filename: terav-record-{userId-or-anon}-{ISO-timestamp}.json
 * Works with static export — pure Blob URL + anchor click, no server.
 */
export function downloadRecordExport(store: Store): void {
  if (typeof window === "undefined") return;
  const payload = buildRecordExport(store);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const userTag = store.user_profile?.uid?.slice(0, 8) ?? "anon";
  const filename = `terav-record-${userTag}-${stamp}.json`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
