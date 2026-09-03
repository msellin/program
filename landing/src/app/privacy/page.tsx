import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <LegalLayout eyebrow="Privacy" title="Your data, in one paragraph.">
      <p>
        Terav stores what you log in the app: sets, reps, RPEs, notes, morning
        checks, symptom entries, and derived metrics. We use that data to
        generate your plan and adapt it session-to-session. That is the whole
        purpose of the app.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">
        What we do not do
      </h2>
      <ul className="list-disc space-y-2 pl-6 text-white/70">
        <li>We do not sell your data.</li>
        <li>
          We do not run third-party advertising trackers on the app or this
          landing page.
        </li>
        <li>
          We do not use your notes to train external AI models. The notes
          engine is deterministic and runs on your device or on our
          infrastructure only.
        </li>
        <li>
          We do not share your specialist report with anyone. You export it
          when you want it.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-white">
        Analytics on this landing
      </h2>
      <p>
        This landing page ships with zero analytics or tracking scripts during
        beta. If we add product analytics later, we will publish a proper
        consent flow before turning them on.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Where your data lives</h2>
      <p>
        Sessions data is stored in the app&rsquo;s account backend. You can
        export it any time; you can delete your account and its data any time
        by writing to{" "}
        <a
          className="text-[var(--color-bronze-hi)] underline decoration-white/20 underline-offset-4 hover:decoration-[var(--color-bronze-hi)]"
          href="mailto:sellinmargus@gmail.com?subject=Delete%20my%20Terav%20data"
        >
          sellinmargus@gmail.com
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Beta caveat</h2>
      <p>
        Terav is in beta. Data-handling practices are honest as of now, but
        infrastructure and policies may evolve. Material changes will be
        announced by email to your account address before they take effect.
      </p>

      <p className="mt-10 text-xs text-[var(--color-muted)]">
        Contact:{" "}
        <a href="mailto:sellinmargus@gmail.com" className="underline decoration-white/20 underline-offset-4">
          sellinmargus@gmail.com
        </a>{" "}
        · Last updated: 2026-09-03.
      </p>
    </LegalLayout>
  );
}
