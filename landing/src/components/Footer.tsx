import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { APP_URL } from "@/config";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
              Adaptive training that reads your log every session. Every change
              cites a study. You approve every one.
            </p>
            <p className="mt-4 text-xs text-[var(--color-muted)]">
              Built by lifters who got tired of template plans.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-14">
            <div>
              <div className="mono-caps mb-3">Product</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/evidence" className="inline-flex min-h-[44px] items-center text-white/70 transition hover:text-white">
                    Evidence
                  </Link>
                </li>
                <li>
                  <a
                    href={`${APP_URL}/sign-in`}
                    className="inline-flex min-h-[44px] items-center text-white/70 transition hover:text-white"
                  >
                    Sign in
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@terav.fit?subject=Terav%20beta"
                    className="inline-flex min-h-[44px] items-center text-white/70 transition hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="mono-caps mb-3">Legal</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="inline-flex min-h-[44px] items-center text-white/70 transition hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="inline-flex min-h-[44px] items-center text-white/70 transition hover:text-white">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="inline-flex min-h-[44px] items-center text-white/70 transition hover:text-white">
                    Medical disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-white/[0.05] pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <div>© {year} Terav. Training log. Not medical advice.</div>
        </div>
      </div>
    </footer>
  );
}
