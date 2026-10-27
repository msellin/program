"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * A sign-up link that carries the visitor's campaign tags across to the app.
 *
 * The landing and the app are different origins, so a `utm_*` query on
 * terav.fit is invisible to app.terav.fit unless it rides on the link. The
 * landing is a static export with no analytics, so this runs in the browser
 * after hydration; before that (and without JS) the plain href still works.
 */
export function CtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const [target, setTarget] = useState(href);
  useEffect(() => {
    try {
      const url = new URL(href);
      let carried = 0;
      new URLSearchParams(window.location.search).forEach((value, key) => {
        if (key.startsWith("utm_")) {
          url.searchParams.set(key, value);
          carried += 1;
        }
      });
      if (carried > 0) setTarget(url.toString());
    } catch {
      // keep the plain href
    }
  }, [href]);
  return (
    <a href={target} className={className}>
      {children}
    </a>
  );
}
