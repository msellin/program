import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { APP_URL } from "@/config";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <LegalLayout eyebrow="Privacy" title="Your data, in one paragraph.">
      <p>
        The full, current privacy policy lives in the app and is the one that
        applies to your account:{" "}
        <a className="text-[var(--color-bronze-hi)] underline decoration-white/20 underline-offset-4" href={`${APP_URL}/legal/privacy`}>
          {APP_URL.replace("https://", "")}/legal/privacy
        </a>
        . In short:
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-white/70">
        <li>
          Terav stores your email, training log and symptom scores so it can
          build and adapt your plan. Symptom data is stored only with your
          explicit consent, given at sign-up.
        </li>
        <li>
          We do not sell your data, use it for advertising, or train AI models on it.
        </li>
        <li>
          This site uses Cloudflare Web Analytics (no cookies, no cross-site
          tracking) to count visits, and reads campaign tags (utm_*) from the link
          you arrive on. Ad links can also carry campaign tags and click IDs (utm_*,
          gclid, fbclid). We use them only to measure which campaigns bring people
          in, and they are saved with your account if you sign up.
        </li>
        <li>
          Processors: Supabase (data, EU), Cloudflare (hosting), Resend (email),
          Sentry (error reports), Google (only if you choose Google sign-in), Stripe
          (when paid plans launch).
        </li>
        <li>
          Export or delete your data any time from Profile in the app, or write to{" "}
          <a className="text-[var(--color-bronze-hi)] underline decoration-white/20 underline-offset-4" href="mailto:sellinmargus@gmail.com">sellinmargus@gmail.com</a>.
        </li>
      </ul>
      <p className="mt-10 text-xs text-[var(--color-muted)]">Last updated: 2026-10-27.</p>
    </LegalLayout>
  );
}
