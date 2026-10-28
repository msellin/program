import Link from "next/link";
import { cardClass } from "@/components/ui/Card";

/** Today: offers the physical tests that the quick start skips. */
export function FindLevelCard({ slug }: { slug: string }) {
  return (
    <div className={`${cardClass()} flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <p className="text-small font-semibold text-strong">Find your exact level</p>
        <p className="text-caption text-muted">A few quick tests sharpen your plan.</p>
      </div>
      <Link
        href={`/programs/${slug}/intake/?mode=full`}
        className="inline-flex h-11 flex-shrink-0 items-center rounded-lg border border-line-strong px-4 text-small font-semibold text-ink hover:bg-surface-3"
      >
        Start tests
      </Link>
    </div>
  );
}
