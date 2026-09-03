import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BottomNav } from "@/components/nav/BottomNav";
import { StoreHydrator } from "@/components/StoreHydrator";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { RestTimerHost } from "@/components/workout/RestTimerHost";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

// P1-26 — Inter 700 dropped; one fewer woff2 per subset.
// 2026-09-01: the original note said `font-bold` was "only used on font-mono",
// implying it was safe. It was not — JetBrains Mono is loaded at 400/500 too,
// so mono `font-bold` synthesised as well. Every `font-bold` in the app has
// been moved to `font-semibold`; there is no 700 face for either family, so
// adding one back means adding the weight here first.
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.terav.fit"),
  title: {
    // Per-route layouts set their own `title`; this template appends the
    // product name so a tab reads "Record · Terav" rather than just "Record".
    // Before 2026-09-03 every screen shared the root title, so tabs, history
    // entries and the PWA app switcher were indistinguishable.
    default: "Terav — Pick your focus. Sharpen it every session.",
    template: "%s · Terav",
  },
  description:
    "A focused-improvement training tool. Pick one capability — an engine, a skill, a lift, a stubborn joint — and Terav sharpens it against your log. The rest of your week is still yours. Every change cites a study.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Terav",
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
  themeColor: "#0E0F12",
  width: "device-width",
  initialScale: 1,
  // Do NOT lock pinch-zoom (was: maximumScale: 1, userScalable: false).
  // Locking blocks WCAG 1.4.4 Resize Text — low-vision users need to enlarge
  // 13-14px body text. The chrome-scales-with-content complaint is better
  // solved by shrinking the fixed nav proportions or letting it stay locked
  // via CSS zoom on a wrapper, not by disabling zoom for every user.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      {/* M6 fix (2026-08-17): body padding removed. AppShell.tsx main
          already sets paddingBottom for the fixed bottom nav
          (calc(64px + env(safe-area-inset-bottom) + 1rem)) — double
          padding was leaving a visible dead zone on iOS. */}
      <body className="min-h-full flex flex-col bg-ground text-ink font-sans">
        <ServiceWorkerRegister />
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
      </body>
    </html>
  );
}
