import Link from "next/link";

export const metadata = {
  title: "Privacy policy",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-4 text-[14px] leading-relaxed">
      <h1 className="text-2xl font-semibold text-strong">Privacy policy</h1>
      <p className="text-muted italic">
        Last updated: 2026-08-18. Beta — this policy will be lawyer-reviewed before public launch.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Who controls your data</h2>
      <p>
        The data controller under GDPR is <strong>Margus Sellin</strong>, natural person,
        based in Estonia. Contact for anything privacy-related:{" "}
        <a href="mailto:sellinmargus@gmail.com" className="text-slate border-b border-slate">
          sellinmargus@gmail.com
        </a>
        .
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">What we store, why, and for how long</h2>
      <table className="w-full text-[14px] border-collapse">
        <thead>
          <tr className="text-left border-b border-line">
            <th className="py-1.5 pr-2 font-semibold">Data</th>
            <th className="py-1.5 pr-2 font-semibold">Why</th>
            <th className="py-1.5 font-semibold">Retention</th>
          </tr>
        </thead>
        <tbody className="align-top">
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Email address</td>
            <td className="py-1.5 pr-2">Sign-in, recovery, beta announcements</td>
            <td className="py-1.5">Until you delete your account</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Training logs (sets, reps, weights, notes)</td>
            <td className="py-1.5 pr-2">Core function — the engine reads your log</td>
            <td className="py-1.5">Until you delete your account</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Morning check + symptom scores + pain ratings</td>
            <td className="py-1.5 pr-2">Adaptive load adjustments; symptom-load history</td>
            <td className="py-1.5">Until you delete your account</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Self-scored assessments (hip check, etc.)</td>
            <td className="py-1.5 pr-2">Rehab-programme gating + retest history</td>
            <td className="py-1.5">Until you delete your account</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Program state (accepted proposals, phase, week)</td>
            <td className="py-1.5 pr-2">Continuity across devices</td>
            <td className="py-1.5">Until you delete your account</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Personal contraindications (movements flagged painful)</td>
            <td className="py-1.5 pr-2">Safety — the engine refuses to prescribe these</td>
            <td className="py-1.5">Until you delete your account</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Uploaded GPX files</td>
            <td className="py-1.5 pr-2">Endurance-session parsing</td>
            <td className="py-1.5">Parsed and discarded within 24 h; raw file not preserved</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Consent timestamps</td>
            <td className="py-1.5 pr-2">Proof of consent (GDPR requirement)</td>
            <td className="py-1.5">Kept until 3 years after account deletion (audit trail)</td>
          </tr>
          <tr className="border-b border-line-soft">
            <td className="py-1.5 pr-2">Error reports (Sentry, if enabled)</td>
            <td className="py-1.5 pr-2">Debugging crashes</td>
            <td className="py-1.5">90 days, no email attached, symptom text scrubbed</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold text-strong pt-2">Lawful basis (GDPR Art. 6 & 9)</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Account + training log:</strong> contract with you (Art. 6(1)(b)).</li>
        <li><strong>Symptom scores, pain ratings, self-assessments:</strong> your explicit consent (Art. 9(2)(a)) — health data is a &quot;special category&quot; and we store it only because you ticked the box at sign-up.</li>
        <li><strong>Error reports:</strong> our legitimate interest in a working service (Art. 6(1)(f)), scrubbed of health content before transmission.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Where it lives</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Account, email, session data: <strong>Supabase</strong> (Frankfurt, EU).</li>
        <li>Training logs and symptom data: <strong>Cloudflare KV</strong> (EU replication).</li>
        <li>Static hosting: <strong>Cloudflare Pages</strong> (global CDN).</li>
        <li>Error reports (when enabled): <strong>Sentry</strong> (EU region, sentry.io).</li>
        <li>Payment data (when paid tier launches): handled entirely by <strong>Paddle</strong>. We never see card numbers.</li>
      </ul>
      <p className="text-[14px] text-muted">
        These providers act as sub-processors under standard data-processing agreements. Sub-processor
        list is current as of the &quot;last updated&quot; date above; changes will be announced by email.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">International transfers</h2>
      <p>
        Health data stays inside the EU. Some CDN edges (static assets, no personal data)
        serve globally. Sentry error reports are routed to Sentry&apos;s EU cloud when
        enabled. Payment processing (Paddle) may transfer minimal transactional data to
        the US under standard contractual clauses.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Cookies & tracking</h2>
      <p>
        We use one session cookie (Supabase auth) so you stay signed in. We do not use
        marketing cookies, ad networks, or cross-site trackers. No analytics tools are
        active in beta.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Automated decisions</h2>
      <p>
        The engine proposes load adjustments and program changes. These are proposals,
        not automatic decisions — nothing changes until you tap Accept. This is confirm-first
        by design and outside the scope of GDPR Art. 22.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">What we don&apos;t do</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>We don&apos;t sell your data. Ever.</li>
        <li>We don&apos;t train AI models on your data.</li>
        <li>We don&apos;t share your data with third parties beyond the sub-processors listed above.</li>
        <li>We don&apos;t use your data for advertising.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Your rights (GDPR)</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Access</strong> — export your entire dataset as JSON from Profile.</li>
        <li><strong>Delete</strong> — one-click account deletion from Profile. Server-side data is wiped within 30 days; backup rotations may take up to 90 days.</li>
        <li><strong>Correct</strong> — edit anything you&apos;ve logged, any time.</li>
        <li><strong>Portability</strong> — the JSON export is a documented, human-readable format.</li>
        <li><strong>Withdraw consent</strong> — deleting your account also withdraws consent to health-data processing.</li>
        <li>
          <strong>Complain</strong> — you can contact your local data protection authority. In
          Estonia:{" "}
          <a className="text-slate border-b border-slate" href="https://www.aki.ee">aki.ee</a>.
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Breach notification</h2>
      <p>
        If a personal-data breach happens and it&apos;s likely to affect you, we&apos;ll
        notify you by email within 72 hours of becoming aware, per GDPR Art. 34.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Children</h2>
      <p>
        Terav is not intended for users under 16. We don&apos;t knowingly collect data
        from anyone under 16.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Contact</h2>
      <p>
        For anything privacy-related, including exercising the rights above, email{" "}
        <a href="mailto:sellinmargus@gmail.com" className="text-slate border-b border-slate">
          sellinmargus@gmail.com
        </a>
        . We aim to respond within 7 days.
      </p>

      <footer className="pt-6 border-t border-line-soft text-[12px] text-muted">
        <Link href="/sign-up" className="text-slate border-b border-slate">Back</Link>
      </footer>
    </div>
  );
}
