import type { Metadata } from "next";

/**
 * Server wrapper so this route can carry its own <title>. The page itself is
 * a client component and cannot export `metadata`; without this every screen
 * shared the root title, so browser tabs, history entries and the PWA app
 * switcher all read "Terav" and were indistinguishable.
 */
export const metadata: Metadata = {
  title: "Programs",
  description: "The catalog — pick the one weakness you want to work on.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
