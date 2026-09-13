/**
 * Supabase auth errors, translated into something a person can act on.
 *
 * `sign-up` and `sign-in` both did `setError(err.message)` — the provider's
 * own string, rendered verbatim. Most are fine. One is not.
 *
 * Terav is a closed beta, and closing it is a Supabase dashboard toggle rather
 * than anything in this repo. Flip it and every would-be signup sees "Signups
 * not allowed for this instance": accurate, and it tells them nothing about
 * what to do next. Someone a beta user has recommended the app to hits a
 * sentence about an instance and leaves.
 *
 * Only cases where the provider's wording actively fails the reader are
 * remapped. Everything else passes through — inventing friendlier copy for
 * errors we have not thought about is how a real diagnostic gets buried.
 */
const CONTACT = "sellinmargus@gmail.com";

type Mapped = { message: string; closedBeta?: boolean };

export function mapAuthError(raw: string | null | undefined): Mapped {
  const s = (raw ?? "").toLowerCase();

  // Supabase: `signup_disabled`. The wording has changed across versions, so
  // match on the stable parts rather than the whole sentence.
  if (s.includes("signup") && (s.includes("not allowed") || s.includes("disabled"))) {
    return {
      closedBeta: true,
      message:
        `Terav is in closed beta, so new accounts are invite-only right now. ` +
        `Email ${CONTACT} and Margus will send you one.`,
    };
  }

  // Distinct from the above and easy to confuse: the account exists, the
  // password is wrong. Supabase says "Invalid login credentials" for BOTH a
  // wrong password and an unknown email, deliberately — not disclosing which
  // is correct, so this only softens the tone.
  if (s.includes("invalid login credentials")) {
    return {
      message: "That email and password don't match. Check both, or reset your password below.",
    };
  }

  if (s.includes("email not confirmed")) {
    return {
      message:
        "Your email isn't confirmed yet. Check your inbox for the link — or resend it below.",
    };
  }

  return { message: raw?.trim() || "Something went wrong. Try again in a moment." };
}
