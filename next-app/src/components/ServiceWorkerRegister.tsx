"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Only register in production and only over HTTPS or localhost
    const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost";
    if (!isSecure) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((e) => console.warn("SW registration failed:", e));
  }, []);
  return null;
}
