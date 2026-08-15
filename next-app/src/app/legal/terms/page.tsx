import Link from "next/link";

export const metadata = {
  title: "Terms of service",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-4 text-[14px] leading-relaxed">
      <h1 className="text-2xl font-semibold text-strong">Terms of service</h1>
      <p className="text-muted italic">Last updated: 2026-08-11. Beta — these terms will be lawyer-reviewed before public launch.</p>

      <h2 className="text-lg font-semibold text-strong pt-2">Beta status</h2>
      <p>
        This app is in beta. It is provided <strong>free of charge</strong> during the beta
        period. Features may change, break, or disappear. Data may occasionally be lost — please
        export a backup from the Data tab periodically.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">What you agree to</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>You are at least 16 years old (or have a parent&apos;s permission if EU-based).</li>
        <li>You&apos;ll use the app for personal training tracking, not on behalf of others without permission.</li>
        <li>You&apos;ll read the <Link href="/legal/disclaimer" className="text-slate border-b border-slate">medical disclaimer</Link> — this is not medical advice.</li>
        <li>You&apos;ll consult a qualified clinician for injury, pain, or health concerns.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">What we agree to</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Store your data honestly and only in the places described in the <Link href="/legal/privacy" className="text-slate border-b border-slate">privacy policy</Link>.</li>
        <li>Never sell your data or train ML models on it.</li>
        <li>Delete your data on request within 30 days.</li>
        <li>Notify beta users if we make material changes to these terms.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">No warranty</h2>
      <p>
        The app is provided &quot;as is&quot;. We make no guarantee that following the app&apos;s
        proposals will lead to any specific outcome (a lift PR, symptom reduction, race time
        improvement, etc.). Training is individual and depends on countless variables outside
        the app&apos;s knowledge.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we&apos;re not liable for injury, loss, or
        damage resulting from your use of the app. You are responsible for training decisions.
        This clause does not limit rights granted to consumers by mandatory EU law.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Ending the relationship</h2>
      <p>
        You can delete your account at any time (Data tab). We can suspend accounts that
        violate these terms — we&apos;ll email you if that happens, so you can export first.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Contact</h2>
      <p>Questions: <a href="mailto:margus@dolmit.com" className="text-slate border-b border-slate">margus@dolmit.com</a>.</p>

      <footer className="pt-6 border-t border-line-soft text-[12px] text-muted">
        <Link href="/sign-up" className="text-slate border-b border-slate">Back</Link>
      </footer>
    </div>
  );
}
