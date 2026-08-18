import Link from "next/link";

export const metadata = {
  title: "Terms of service",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-4 text-[14px] leading-relaxed">
      <h1 className="text-2xl font-semibold text-strong">Terms of service</h1>
      <p className="text-muted italic">
        Last updated: 2026-08-18. Beta — these terms will be lawyer-reviewed before public launch.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Who runs Terav</h2>
      <p>
        Terav is developed and operated by <strong>Margus Sellin</strong>, natural person,
        based in Estonia. Contact:{" "}
        <a href="mailto:sellinmargus@gmail.com" className="text-slate border-b border-slate">
          sellinmargus@gmail.com
        </a>
        . References to &quot;we&quot; and &quot;us&quot; below mean the developer.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Beta status</h2>
      <p>
        Terav is currently in closed beta and provided <strong>free of charge</strong>.
        Features may change, break, or disappear. We aim to preserve your data but backups
        are not guaranteed during beta — please export from Profile periodically. When a
        paid tier launches, current beta users will get advance notice.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">What you agree to</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>You are at least 16 years old (GDPR consent age in most EU member states).</li>
        <li>You&apos;ll use the app for personal training tracking, not on behalf of others without their consent.</li>
        <li>You&apos;ve read the <Link href="/legal/disclaimer" className="text-slate border-b border-slate">medical disclaimer</Link> — Terav is not medical advice.</li>
        <li>You&apos;ll consult a qualified clinician for injury, pain, or health concerns.</li>
        <li>You won&apos;t attempt to break, probe, or reverse-engineer the service, or scrape other users&apos; data.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">What we agree to</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Store your data honestly, in the places described in the <Link href="/legal/privacy" className="text-slate border-b border-slate">privacy policy</Link>.</li>
        <li>Never sell your data.</li>
        <li>Never train AI models on your data.</li>
        <li>Give you a one-click export (JSON) and a one-click delete from Profile.</li>
        <li>Complete a delete request within 30 days (some backup rotations may take up to 90 days to fully purge).</li>
        <li>Notify beta users by email before any material change to these terms.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Ownership</h2>
      <p>
        You own the training data you enter. We own the Terav program content (the JSON
        program definitions, exercise library, and adaptive engine). You may use the
        exported JSON of <em>your own</em> data however you like, including in other tools.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">No warranty</h2>
      <p>
        The app is provided &quot;as is&quot;. We make no guarantee that following the
        engine&apos;s proposals will lead to any specific outcome (a lift PR, a race time,
        symptom reduction, etc.). Training response is individual and depends on countless
        variables outside the app&apos;s knowledge.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we&apos;re not liable for injury, loss, or
        damage resulting from your use of the app. You are responsible for your training
        decisions. This clause does not limit rights granted to consumers by mandatory
        EU or Estonian law.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Ending the relationship</h2>
      <p>
        You can delete your account at any time from Profile — this wipes your local
        cache, revokes your sign-in, and deletes your server-side data. We can suspend
        accounts that violate these terms; we&apos;ll email you first so you can export.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Governing law</h2>
      <p>
        These terms are governed by the laws of the Republic of Estonia. Disputes that
        can&apos;t be resolved informally go to the competent court of Estonia, without
        prejudice to mandatory consumer-protection rights in your country of residence.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Changes to these terms</h2>
      <p>
        We&apos;ll email registered beta users at least 14 days before any material
        change. Continued use after the change means you accept the new terms.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:sellinmargus@gmail.com" className="text-slate border-b border-slate">
          sellinmargus@gmail.com
        </a>
        .
      </p>

      <footer className="pt-6 border-t border-line-soft text-[12px] text-muted">
        <Link href="/sign-up" className="text-slate border-b border-slate">Back</Link>
      </footer>
    </div>
  );
}
