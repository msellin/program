import Link from "next/link";
import { Ambient } from "@/components/Ambient";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-ground)] text-white">
      <Ambient />
      <div className="relative">
        <Nav />
        <main id="main" className="mx-auto max-w-3xl px-5 pt-16 pb-24 text-center sm:px-6">
          <div className="mono-caps mb-3 text-[var(--color-bronze-hi)]">404</div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            That page isn&rsquo;t here.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            The link may be old or mistyped. Start from the programs, or head back home.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-bronze)] hover:bg-[var(--color-bronze-hover)] px-6 py-3.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              See the programs
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/85 transition hover:border-white/40"
            >
              Back to Terav
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
