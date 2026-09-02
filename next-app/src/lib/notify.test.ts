import { describe, it, expect } from "vitest";
import { recipientsFrom, chunk, planNotification } from "./notify";

describe("recipientsFrom", () => {
  it("excludes unconfirmed sign-ups", () => {
    // An address nobody proved they control is not a user — and mailing it on
    // a breach would itself disclose that somebody tried to register with it.
    expect(
      recipientsFrom([
        { email: "real@example.com", email_confirmed_at: "2026-08-01T00:00:00Z" },
        { email: "never-confirmed@example.com", email_confirmed_at: null },
      ]),
    ).toEqual(["real@example.com"]);
  });

  it("skips deleted accounts and rows with no address", () => {
    expect(
      recipientsFrom([
        { email: "gone@example.com", email_confirmed_at: "2026-08-01T00:00:00Z", deleted_at: "2026-08-20" },
        { email: null, email_confirmed_at: "2026-08-01T00:00:00Z" },
        { email_confirmed_at: "2026-08-01T00:00:00Z" },
      ]),
    ).toEqual([]);
  });

  it("deduplicates and normalises case, so nobody is mailed twice", () => {
    expect(
      recipientsFrom([
        { email: "A@Example.com", email_confirmed_at: "x" },
        { email: "a@example.com ", email_confirmed_at: "x" },
      ]),
    ).toEqual(["a@example.com"]);
  });
});

describe("chunk", () => {
  it("splits into batches of at most the given size", () => {
    const out = chunk(Array.from({ length: 250 }, (_, i) => i), 100);
    expect(out.map((b) => b.length)).toEqual([100, 100, 50]);
  });

  it("returns nothing for an empty list rather than one empty batch", () => {
    // An empty batch would be a POST to Resend with no recipients.
    expect(chunk([], 100)).toEqual([]);
  });
});

describe("planNotification", () => {
  const valid = { subject: "Security notice", body: "A".repeat(40) };

  it("defaults to a dry run — sending has to be asked for", () => {
    const plan = planNotification(valid);
    expect(plan).toMatchObject({ ok: true, dryRun: true });
  });

  it("refuses a live send without the confirm token", () => {
    // Guards against a repeated curl out of shell history mailing everyone.
    expect(planNotification({ ...valid, dry_run: false })).toMatchObject({ ok: false });
  });

  it("allows a live send when both flags are explicit", () => {
    expect(planNotification({ ...valid, dry_run: false, confirm: "SEND" })).toMatchObject({
      ok: true,
      dryRun: false,
    });
  });

  it("rejects an empty or near-empty notice", () => {
    expect(planNotification({ subject: "", body: "A".repeat(40) }).ok).toBe(false);
    expect(planNotification({ subject: "Notice", body: "too short" }).ok).toBe(false);
    expect(planNotification({}).ok).toBe(false);
  });

  it("rejects non-string fields rather than coercing them", () => {
    expect(planNotification({ subject: 42, body: { text: "hi" } }).ok).toBe(false);
  });
});
