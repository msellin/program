import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { APP_URL } from "@/config";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Terms" title="Plain-language terms.">
      <p>
        The full terms live in the app and are the ones that apply to your
        account:{" "}
        <a className="text-[var(--color-bronze-hi)] underline decoration-white/20 underline-offset-4" href={`${APP_URL}/legal/terms`}>
          {APP_URL.replace("https://", "")}/legal/terms
        </a>
        . In short:
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-white/70">
        <li>
          Terav is a training log with an adaptive session generator. It is not a
          medical device or medical advice; if something hurts, stop and see a clinician.
        </li>
        <li>
          Terav is in open beta and free for now. Features may change or be withdrawn.
          If paid plans launch you will get notice first.
        </li>
        <li>You must be 16 or older.</li>
        <li>You train at your own risk. Terav proposes; you accept.</li>
        <li>Estonian law applies. Questions: <a className="text-[var(--color-bronze-hi)] underline decoration-white/20 underline-offset-4" href="mailto:sellinmargus@gmail.com">sellinmargus@gmail.com</a>.</li>
      </ul>
      <p className="mt-10 text-xs text-[var(--color-muted)]">Last updated: 2026-10-27.</p>
    </LegalLayout>
  );
}
