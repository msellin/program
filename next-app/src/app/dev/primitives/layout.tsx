import { notFound } from "next/navigation";

/** Component story for development only; production builds export a 404. */
export default function Layout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <>{children}</>;
}
