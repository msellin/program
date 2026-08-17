import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BottomNav } from "@/components/nav/BottomNav";
import { StoreHydrator } from "@/components/StoreHydrator";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { RestTimerHost } from "@/components/workout/RestTimerHost";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
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
  title: "Terav — sharpen the plan",
  description:
    "Adaptive training that learns from every session. Aerobic, concurrent, and skill programs, cited to the study.",
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
      <body className="min-h-full flex flex-col bg-ground text-ink font-sans pb-[calc(64px+env(safe-area-inset-bottom))]">
        <ServiceWorkerRegister />
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
      </body>
    </html>
  );
}
