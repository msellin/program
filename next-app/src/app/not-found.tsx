import Link from "next/link";

/**
 * There was no not-found.tsx, so an unknown URL fell through to Next's
 * unstyled default — a bare "404 This page could not be found" on a white
 * slab, with no route back into the app.
 *
 * That is not a hypothetical: the Week 3/4 IA refactor renamed Today → Day
 * and Week → Plan, so every bookmark, shared link and installed-PWA icon
 * created before that rename now lands here. `/today` was still 404ing on
 * 2026-09-01. An installed PWA has no address bar, so a user who arrives on
 * a dead route has no way to correct it by hand — the page itself has to
 * offer the exit.
 */
export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto pt-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">404</p>
      <h1 className="text-2xl font-semibold text-strong mt-2">This page has moved, or never existed.</h1>
      <p className="text-[14px] text-ink mt-3 leading-relaxed">
        Some routes were renamed — Today became Day, Week became Plan. An old
        bookmark or home-screen shortcut can still point at the previous name.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[44px] px-5 rounded bg-bronze text-ground font-mono text-[11px] uppercase tracking-wider hover:bg-bronze-hover"
        >
          Go to today
        </Link>
        <Link
          href="/programs"
          className="inline-flex items-center min-h-[44px] font-mono text-[11px] uppercase tracking-wider text-bronze hover:text-bronze-hover"
        >
          Browse programs →
        </Link>
      </div>
    </div>
  );
}
