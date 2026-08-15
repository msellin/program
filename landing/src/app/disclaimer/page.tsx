import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Medical disclaimer",
};

export default function DisclaimerPage() {
  return (
    <LegalLayout eyebrow="Medical disclaimer" title="This is a training log. Not medical advice.">
      <p>
        Terav helps you train and log training. It does not diagnose,
        treat, cure, prevent, or manage any medical condition. It is not
        supervised by a physician, a physiotherapist, or a certified strength
        and conditioning coach.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">If you have a diagnosis</h2>
      <p>
        Rehab programs in Terav are labelled rehab-adjacent — they are the
        author&rsquo;s own recovery arc, generalised. They are a supplement to
        clinical care, not a replacement for a physiotherapist, orthopaedist,
        physiatrist, or sports medicine physician. If you have an active
        injury or a diagnosed condition, your clinician&rsquo;s plan
        overrides anything the app suggests.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Red-flag patterns</h2>
      <p>
        The engine surfaces an escalate-to-clinician banner when certain
        patterns appear in your log — persistent night pain, symptoms unchanged
        over multiple sessions, radiating pain, sudden loss of function.
        That banner is a nudge to book a real appointment, not a diagnosis.
        Never wait for the app to tell you something is wrong.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-white">Stop rules</h2>
      <ul className="list-disc space-y-2 pl-6 text-white/70">
        <li>New or worsening pain during a session — stop the session.</li>
        <li>Pain that persists or worsens overnight — see a clinician.</li>
        <li>Chest pain, dizziness, disproportionate shortness of breath — stop, seek urgent care.</li>
        <li>
          Numbness, tingling, weakness that wasn&rsquo;t there before — stop,
          see a clinician.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-white">The specialist report</h2>
      <p>
        Terav can export a cross-referenced log with symptom entries and
        training load, designed to be useful to your physiotherapist or
        physician. It is a communication tool between you and your clinician,
        not a medical record and not a diagnosis.
      </p>

      <p className="mt-10 text-xs text-white/60">
        Questions:{" "}
        <a href="mailto:hello@terav.fit" className="underline decoration-white/20 underline-offset-4">
          hello@terav.fit
        </a>
      </p>
    </LegalLayout>
  );
}
