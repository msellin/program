import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

// Filter out Cloudflare Pages config files (`_headers`, `_redirects`) from the
// precache manifest — they're processed at deploy time and not served as
// static assets, so precaching them throws `bad-precaching-response :: 404`.
const filteredManifest = (self.__SW_MANIFEST ?? []).filter((entry) => {
  const url = typeof entry === "string" ? entry : entry.url;
  return !url.endsWith("/_headers") && !url.endsWith("/_redirects");
});

const serwist = new Serwist({
  precacheEntries: filteredManifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // JSON data files — network-first so updates land, cache as fallback offline
    {
      matcher: ({ url }) => url.pathname.startsWith("/data/"),
      handler: {
        handle: async ({ request }) => {
          const cache = await caches.open("data-cache");
          try {
            const fresh = await fetch(request);
            if (fresh.ok) cache.put(request, fresh.clone());
            return fresh;
          } catch {
            const cached = await cache.match(request);
            if (cached) return cached;
            return new Response(JSON.stringify({ error: "offline" }), {
              status: 503,
              headers: { "content-type": "application/json" },
            });
          }
        },
      },
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
