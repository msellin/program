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
    default: "Terav — Adaptive strength & rehab, sharpened every session",
    template: "%s · Terav",
  },
  description:
    "Adaptive strength, cardio, and skill programs. Every session sharpens against your log, your morning check, and 100+ cited studies.",
  openGraph: {
    title: "Terav — The training plan with an edge",
    description:
      "Coach-grade programming that sharpens against your training data every session. 100+ cited studies.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terav — Sharpen the plan. Every session.",
    description:
      "Adaptive strength, aerobic and rehab programming that sharpens every session against your training data.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
