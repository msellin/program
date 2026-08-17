import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://terav.fit"),
  title: {
    default: "Terav — Pick one thing you want stronger. Sharpen it every session.",
    template: "%s · Terav",
  },
  description:
    "A focused-improvement training tool. An engine, a skill, a lift, a stubborn joint — Terav writes that focus arc; the rest of your week is still yours. Every change cites a study.",
  openGraph: {
    title: "Terav — Pick your focus. Sharpen it every session.",
    description:
      "Focused-improvement training that sharpens one capability at a time — engine, skill, lift, or joint — against your log. 88 cited studies.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terav — Pick your focus. Sharpen it every session.",
    description:
      "Focused-improvement training that sharpens one capability at a time — runs alongside your existing week. 88 cited studies.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0f12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--color-bronze)] focus:px-4 focus:py-2 focus:text-black focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
