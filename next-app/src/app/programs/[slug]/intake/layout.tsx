import type { Metadata } from "next";

/**
 * Server wrapper so this route can carry its own <title> — the page is a
 * client component and cannot export `metadata`. See `route-titles.test.ts`.
 */
export const metadata: Metadata = {
  title: "Intake",
  description: "The screening and baseline questions for this programme.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
