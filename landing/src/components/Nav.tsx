import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { APP_URL } from "@/config";

export function Nav() {
  return (
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
      <Link href="/" className="transition hover:opacity-80">
        <Wordmark />
      </Link>
      <div className="flex items-center gap-4 text-sm text-[var(--color-muted)] sm:gap-6">
        <Link
          href="/evidence"
          className="hidden min-h-[44px] items-center text-[var(--color-muted)] transition hover:text-white sm:inline-flex"
        >
          Evidence
        </Link>
        <a
          href={`${APP_URL}/sign-in`}
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/[0.06] hover:text-white"
        >
          Sign in
        </a>
      </div>
    </nav>
  );
}
