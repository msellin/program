import type { Metadata } from "next";

/**
 * Server wrapper so this route can carry its own <title> — the page is a
 * client component and cannot export `metadata`. See `route-titles.test.ts`.
 */
export const metadata: Metadata = {
  title: "Log a session",
  description: "Record training that wasn't on the plan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
