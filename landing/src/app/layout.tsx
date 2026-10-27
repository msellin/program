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
    default: "Terav — Improve your weakest area. Keep your training.",
    template: "%s · Terav",
  },
  description:
    "Improve your weakest area and keep your training. For CrossFit and functional-fitness athletes: pick a skill or a lift, and Terav adjusts each session from your log and tells you why. Free during the beta.",
  openGraph: {
    title: "Terav — Improve your weakest area. Keep your training.",
    description:
      "Pick a skill or a lift. Terav adjusts each session from your log and tells you why. You approve every change. Free during the beta.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terav — Improve your weakest area. Keep your training.",
    description:
      "Pick a skill or a lift. Terav adjusts each session from your log and tells you why. Free during the beta.",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
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
