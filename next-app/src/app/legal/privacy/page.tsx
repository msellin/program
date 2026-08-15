import Link from "next/link";

export const metadata = {
  title: "Privacy policy",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-4 text-[14px] leading-relaxed">
      <h1 className="text-2xl font-semibold text-strong">Privacy policy</h1>
      <p className="text-muted italic">Last updated: 2026-08-11. Beta — this policy will be lawyer-reviewed before public launch.</p>

      <h2 className="text-lg font-semibold text-strong pt-2">What we store</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Your email address (for sign-in and account recovery).</li>
        <li>Your training logs — sets, reps, weights, notes.</li>
        <li>Your morning check answers — symptom scores, life-load rating, outside-training text.</li>
        <li>Your self-scored assessments — hip check, future shoulder / knee / back checks.</li>
        <li>Program state — which program you&apos;re on, which week, accepted proposals.</li>
        <li>Personal contraindications — movements you flag as painful.</li>
        <li>Uploaded GPX files if you import them (endurance sessions).</li>
        <li>Timestamps of when you accepted the terms and consented to health-data storage.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Where it lives</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Account, email, session data: Supabase (Frankfurt or Paris, EU region).</li>
        <li>Training logs and symptom data: Cloudflare KV (edge cache, replicated).</li>
        <li>Uploaded raw GPX files, if we ever preserve them: Cloudflare R2 (Frankfurt).</li>
        <li>Payment data (when paid tier launches): handled entirely by Paddle. We never see card numbers.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Health data is special</h2>
      <p>
        Symptom scores and pain ratings are &quot;special category data&quot; under GDPR. We
        store them only because you explicitly consented at sign-up. You can revoke consent
        and delete all data at any time from the Data tab.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">What we don&apos;t do</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>We don&apos;t sell your data. Ever.</li>
        <li>We don&apos;t train AI models on your data.</li>
        <li>We don&apos;t share your data with third parties except the infrastructure providers
          named above (Supabase, Cloudflare, Paddle) — these are sub-processors under DPAs.</li>
        <li>We don&apos;t use your data for advertising.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Your rights (GDPR)</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Access</strong> — export your entire data set as JSON from the Data tab.</li>
        <li><strong>Delete</strong> — one-click account deletion from the Data tab. Wipes all data
          from our systems within 30 days; some backups may take up to 90 days to purge.</li>
        <li><strong>Correct</strong> — edit anything you&apos;ve logged, any time.</li>
        <li><strong>Portability</strong> — the JSON export is designed to be usable elsewhere.</li>
        <li><strong>Complain</strong> — you can contact your local data protection authority.
          In Estonia: <a className="text-slate border-b border-slate" href="https://www.aki.ee">aki.ee</a>.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Contact</h2>
      <p>For anything privacy-related, email <a href="mailto:margus@dolmit.com" className="text-slate border-b border-slate">margus@dolmit.com</a>.</p>

      <footer className="pt-6 border-t border-line-soft text-[12px] text-muted">
        <Link href="/sign-up" className="text-slate border-b border-slate">Back</Link>
      </footer>
    </div>
  );
}
