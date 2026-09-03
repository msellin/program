import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Terms" title="Plain-language terms.">
      <p>
        By using Terav you agree to what&rsquo;s below. If any of it is
        unclear, ask us at{" "}
        <a
          className="text-[var(--color-bronze-hi)] underline decoration-white/20 underline-offset-4"
          href="mailto:sellinmargus@gmail.com"
        >
          sellinmargus@gmail.com
        </a>{" "}
        before you sign up.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">What Terav is</h2>
      <p>
        Terav is a training log with an adaptive session generator. It is not a
        medical device, a diagnostic tool, or a substitute for a physician,
        physiotherapist, or qualified coach.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Beta status</h2>
      <p>
        Terav is in public beta. Features may change, break, or be withdrawn.
        Beta accounts keep lifetime free access to the app once we introduce
        paid tiers.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Your account</h2>
      <p>
        You are responsible for keeping your credentials safe. Do not share
        your account with people who train at meaningfully different levels or
        with different injury profiles — the engine will adapt against a
        polluted signal.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Acceptable use</h2>
      <p>
        Do not reverse-engineer the engine to scrape our evidence base, do not
        misrepresent Terav as a medical or coaching credential, and do not
        upload data that isn&rsquo;t yours.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Liability</h2>
      <p>
        You train at your own risk. Terav proposes; you accept. Every
        adaptive change is displayed for your explicit acceptance before it
        applies to a session — this is a designed part of the product. If a
        session hurts, stop and see a clinician; the app is not a replacement.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Governing law</h2>
      <p>
        Terav is an Estonian-registered product. Estonian law applies to these
        terms.
      </p>

      <p className="mt-10 text-xs text-[var(--color-muted)]">
        Last updated: 2026-09-03.
      </p>
    </LegalLayout>
  );
}
