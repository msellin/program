import type { ReactNode } from "react";
import { Ambient } from "./Ambient";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function LegalLayout({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-ground)] text-white">
      <Ambient />
      <div className="relative">
        <Nav />
        <section className="mx-auto max-w-3xl px-5 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
          <div className="mono-caps mb-3">{eyebrow}</div>
          <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <div className="prose-legal mt-10 space-y-6 text-[15px] leading-relaxed text-white/70">
            {children}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
