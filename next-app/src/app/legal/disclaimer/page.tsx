import Link from "next/link";

export const metadata = {
  title: "Medical disclaimer",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-4 text-[14px] leading-relaxed">
      <h1 className="text-2xl font-semibold text-strong">Medical disclaimer</h1>

      <p>
        Terav is a <strong>training log</strong>. It records what you do, notices patterns
        in the data you enter, and proposes adjustments you can Accept or dismiss. It is
        not medical advice, not a diagnosis, and not a replacement for a qualified
        clinician.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">What Terav is</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>A place to record training sessions, morning check-ins, and how the body responds.</li>
        <li>An engine that proposes load adjustments based on your logs — always confirm-first.</li>
        <li>A structured way to see whether a training arc is working for you.</li>
        <li>An honest history to bring to your orthopaedist, physiotherapist, or coach.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">What Terav is not</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>A diagnostic tool. If something hurts, see a clinician.</li>
        <li>A replacement for a physiotherapist, orthopaedist, or coach.</li>
        <li>A rehabilitation programme for a specific medical condition. Rehab-adjacent
          programs (hip, mobility) are structured training, not clinical care — clear the
          movements with your clinician first.</li>
        <li>A guarantee of any specific outcome. Training response is individual.</li>
      </ul>

      <h2 className="text-lg font-semibold text-strong pt-2">Before starting a program</h2>
      <p>
        If you have any of the following, clear it with a clinician before beginning any
        Terav arc: an active injury, chronic pain, a diagnosed condition affecting the
        joints or spine, cardiovascular disease, pregnancy, or a recent surgery.
      </p>

      <h2 className="text-lg font-semibold text-strong pt-2">Red flags — stop and escalate</h2>
      <p>
        See a clinician urgently if you experience any of the following, regardless of
        what the app suggests:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Pain that wakes you at night, worsens at rest, or lasts more than 72 hours.</li>
        <li>Numbness, tingling, or weakness in a limb.</li>
        <li>Chest pain, breathlessness at low intensity, or fainting.</li>
        <li>Sudden loss of bowel or bladder control.</li>
        <li>Any symptom that feels new, sharp, or wrong.</li>
      </ul>

      <p className="pt-4 text-muted italic">
        By using Terav you accept that all training decisions are your own. If you&apos;re
        unsure, the safe choice is always to stop, rest, and consult a professional.
      </p>

      <footer className="pt-6 border-t border-line-soft text-[12px] text-muted">
        <Link href="/sign-up" className="text-slate border-b border-slate">Back</Link>
      </footer>
    </div>
  );
}
