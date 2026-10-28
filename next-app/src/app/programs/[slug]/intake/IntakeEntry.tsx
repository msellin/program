"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadProgram, loadProgramManifest } from "@/lib/data-loader";
import type { Program, ProgramManifestEntry } from "@/lib/schemas";
import { IntakeClient } from "./IntakeClient";
import { QuickStart } from "./QuickStart";

/**
 * Chooses between the quick start and the full intake. Quick start is the
 * default for programs with `plan_tiers`; `?mode=full` (the "Detailed setup"
 * link, the Today "Find your exact level" card) opens the full intake, and
 * programs without tiers have only the full intake.
 */
function Entry({ slug }: { slug: string }) {
  const mode = useSearchParams().get("mode");
  const [loaded, setLoaded] = useState<{ program: Program; entry: ProgramManifestEntry | null } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void Promise.all([loadProgram(slug), loadProgramManifest()])
      .then(([program, m]) =>
        setLoaded({ program, entry: m.programs.find((x) => x.slug === slug) ?? null }),
      )
      .catch(() => setFailed(true));
  }, [slug]);

  if (mode === "full" || failed) return <IntakeClient slug={slug} />;
  if (!loaded) return <div className="mt-8 text-small text-muted">Loading…</div>;
  if (loaded.program.intake && (loaded.program.plan_tiers?.length ?? 0) > 0) {
    return <QuickStart slug={slug} program={loaded.program} manifestEntry={loaded.entry} />;
  }
  return <IntakeClient slug={slug} />;
}

export function IntakeEntry({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="mt-8 text-small text-muted">Loading…</div>}>
      <Entry slug={slug} />
    </Suspense>
  );
}
