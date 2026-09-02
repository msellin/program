import { describe, it, expect } from "vitest";
import { tallyUnmatchedTokens, tokenize, isMatchedByRegex, extractRecentNotes } from "./note-keywords";

const withNotes = (user_id: string, notesByDate: Record<string, string>) => ({
  user_id,
  state: {
    logs: Object.fromEntries(
      Object.entries(notesByDate).map(([date, notes]) => [date, { date, notes }]),
    ),
  },
});

describe("tokenize", () => {
  it("keeps Estonian characters — half the notes in this app are Estonian", () => {
    expect(tokenize("Väsinud ja jäik")).toContain("väsinud");
    expect(tokenize("Väsinud ja jäik")).toContain("jäik");
  });

  it("drops stopwords, bare numbers and one- or two-letter fragments", () => {
    const out = tokenize("the 42 a of padel");
    expect(out).not.toContain("the");
    expect(out).not.toContain("42");
    expect(out).toContain("padel");
  });
});

describe("isMatchedByRegex", () => {
  it("recognises vocabulary note-signals already knows", () => {
    for (const known of ["padel", "stiff", "väsinud", "pain"]) {
      expect(isMatchedByRegex(known), known).toBe(true);
    }
  });

  it("does not recognise phrasing the regex has never seen", () => {
    expect(isMatchedByRegex("trampoline")).toBe(false);
  });
});

describe("extractRecentNotes", () => {
  it("ignores days older than the cutoff", () => {
    const state = { logs: { "2026-01-01": { notes: "old" }, "2026-09-01": { notes: "new" } } };
    expect(extractRecentNotes(state, "2026-08-03")).toEqual(["new"]);
  });

  it("finds notes wherever a user can write one", () => {
    const state = {
      logs: {
        "2026-09-01": {
          notes: "day note",
          symptoms: { outside_training: "played padel" },
          exercises: { "b:x": { notes: "exercise note", sets: [{ notes: "set note" }] } },
        },
      },
    };
    expect(extractRecentNotes(state, "2026-08-01").sort()).toEqual(
      ["day note", "exercise note", "played padel", "set note"],
    );
  });
});

describe("tallyUnmatchedTokens", () => {
  it("surfaces only phrasing the regex misses", () => {
    const rows = [
      withNotes("u1", { "2026-09-01": "trampoline session felt stiff" }),
      withNotes("u2", { "2026-09-01": "trampoline again" }),
      withNotes("u3", { "2026-09-01": "trampoline once more" }),
    ];
    const { tokens } = tallyUnmatchedTokens(rows, "2026-08-01");
    expect(tokens.map((t) => t.token)).toContain("trampoline");
    // "stiff" is already in the regex vocabulary — it is not a gap.
    expect(tokens.map((t) => t.token)).not.toContain("stiff");
  });

  it("applies the frequency floor, so one person's typo is not a finding", () => {
    const { tokens } = tallyUnmatchedTokens(
      [withNotes("u1", { "2026-09-01": "kitesurfing" })],
      "2026-08-01",
    );
    expect(tokens).toEqual([]);
  });

  it("counts distinct users, not occurrences", () => {
    // Three mentions by one person is weaker evidence than three people once
    // each — the ranking has to be able to tell them apart.
    const { tokens } = tallyUnmatchedTokens(
      [withNotes("u1", { "2026-09-01": "trampoline", "2026-09-02": "trampoline", "2026-09-03": "trampoline" })],
      "2026-08-01",
    );
    expect(tokens[0]).toMatchObject({ token: "trampoline", count: 3, distinct_users: 1 });
  });

  it("identifies users by id, never by email", () => {
    // The KV version keyed distinct users off the email in the storage key.
    const rows = [withNotes("uuid-1", { "2026-09-01": "trampoline" })];
    const { tokens } = tallyUnmatchedTokens(rows, "2026-08-01", { minCount: 1 });
    expect(JSON.stringify(tokens)).not.toMatch(/@/);
  });

  it("survives rows with no state, no logs, or malformed shapes", () => {
    expect(
      tallyUnmatchedTokens(
        [{ state: null }, { state: {} }, { state: { logs: {} } }, { user_id: "u", state: undefined }],
        "2026-08-01",
      ),
    ).toEqual({ tokens: [], scannedNotes: 0 });
  });
});
