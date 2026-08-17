# Domain migration — terav.fit

**Status:** planned. Domain purchased 2026-08-17. Not started.

**Owner:** Margus (infra + DNS decisions), me (code + config).

## Target state

- **`terav.fit`** — landing site (currently `program-v2.pages.dev` per memory).
- **`app.terav.fit`** — authenticated PWA (currently the Next.js app served alongside landing).
- All auth, database, REST APIs, Supabase, Cloudflare bindings, Playwright test URLs, and referenced env vars point at the new domain.
- Old `.pages.dev` URLs redirect (temporary) or 404 (final) — decide before cutover.

## What has to change

### DNS + hosting
- Cloudflare DNS zone for `terav.fit` — nameservers, DNSSEC, CAA records.
- Cloudflare Pages project mapping: bind `terav.fit` to the landing project, `app.terav.fit` to the app project.
- SSL certificates (Cloudflare Universal SSL — free, auto-provisioned; verify EU issuer).
- Cloudflare Access rules (if any) rescoped to the new hostnames.

### Supabase
- Update **Auth → URL Configuration**: Site URL = `https://terav.fit`, Additional Redirect URLs include `https://app.terav.fit/**` and `http://localhost:3000/**` for dev.
- Update **Auth → Email Templates** — any hardcoded links that mention the old domain.
- Update **OAuth provider callbacks** (Google, Apple, etc. — whichever ship on beta) to `https://app.terav.fit/auth/callback`.
- CORS allow-list on any Supabase Edge Functions.
- Row-level-security policies do not depend on hostname — no change expected, but grep to be sure.

### App code / config
- Search-and-replace `program-v2.pages.dev`, `program-f3r.pages.dev`, `padel-9tz.pages.dev` (if they leak), and any bare `.pages.dev` refs in:
  - `landing/src/**` (metadata canonical, OG images, robots.txt, sitemap)
  - `next-app/src/**` (metadata canonical, OG, absolute URLs in emails, share links)
  - `next-app/public/manifest.webmanifest` and `next-app/public/robots.txt`
  - Playwright configs (`playwright.config.ts` if any)
  - `.env` samples + Cloudflare Pages env vars (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` stay, `SUPABASE_SERVICE_ROLE_KEY` stays)
- `next.config.js` / `next.config.mjs` — `images.domains`, `experimental.serverActions.allowedOrigins`.
- Cloudflare Pages project env vars in the dashboard — do NOT commit; document what needs updating.

### PWA + install path
- `manifest.webmanifest` — `start_url`, `scope`, `id`, `name`, `short_name` may not reference the domain (usually paths). Confirm.
- Service worker cache-key strategy — new origin = new cache scope; users on the old URL keep old cache indefinitely. Plan the transition (see below).
- Add-to-Home-Screen installed on `program-v2.pages.dev` will NOT auto-migrate — installed PWAs are origin-locked. Users must reinstall from the new origin. Announce this in a beta-user note.

### External integrations
- Cloudflare KV bindings named in `wrangler.toml` (if used) — rename if the binding name embeds the old domain.
- Analytics (if any — audit).
- Email sender domain SPF / DKIM / DMARC — configure `noreply@terav.fit` or the founder-visible `sellinmargus@gmail.com` alias per current memory.

### Docs + memory
- `dev/active/saas-launch/plan.md` — update URLs referenced.
- Memory: `next-stack.md` says active URL is `program-v2.pages.dev`. Update after cutover.
- Memory: `deployment.md` says `program-f3r.pages.dev`. Update.
- Memory: `padel-deployment.md` — unrelated (padel app), leave.
- `CLAUDE.md` — no URL, but the stale "personal tracker for one user" line already flagged in the positioning audit — update at the same time.

## Cutover order (once each row above is ready)

1. Land the code changes on a branch, deploy to a Pages preview URL. Full smoke test.
2. Update Supabase Auth config in a staging project first (if one exists) — else be ready to revert.
3. Point `terav.fit` and `app.terav.fit` DNS to Pages.
4. Verify SSL cert issues cleanly (may take up to 15 minutes).
5. Update Supabase Auth Site URL + redirect URLs.
6. Cutover Google/Apple OAuth callback URLs.
7. Verify: sign up, log in, log out, magic-link email, password reset, protected-route hit, PWA install prompt.
8. Post-cutover: enable 301 redirect from `program-v2.pages.dev` → `terav.fit` (Cloudflare Rules or a stub Pages project).
9. Announce to any active beta users via email — installed PWAs need reinstall.

## Failure modes to plan for

- **Supabase Auth misconfig** — redirect URL not on allow-list breaks every OAuth login silently. Test with a fresh incognito user before considering cutover complete.
- **iOS Safari PWA cache** — old service worker persists for up to 7 days. Mitigate: bump SW version + skipWaiting on the FIRST post-cutover deploy so users who visit the old URL get a "please reinstall" screen.
- **Email deliverability regression** — new sender domain has no SPF/DKIM reputation. Warm slowly (small beta first) or fall back to keeping magic-link from-address on gmail for a week.
- **Cloudflare Pages preview URLs** — every PR preview still uses `*.pages.dev`. If the app's absolute-URL logic reads `NEXT_PUBLIC_APP_URL`, preview builds need the correct value or auth redirects break in previews. Fix via a per-environment env var.

## Precondition before I start work

- Confirm which parts you (founder) want to do vs. delegate:
  - DNS zone creation + nameserver update → founder (Cloudflare account access)
  - Supabase Auth config → founder (Supabase dashboard access)
  - Code + env var refactor → me
  - OAuth provider console updates → founder (Google Cloud / Apple Developer console)

## Estimated total effort

- Code + config refactor: **3-4h**
- DNS + Cloudflare Pages binding + SSL: **30min-1h**
- Supabase Auth reconfiguration + OAuth callback swap: **1-2h**
- Verification passes across sign-up / login / PWA install: **2h**
- Documentation update + memory refresh: **30min**
- Total: **~half a day of focused work**, assuming DNS/SSL propagates without hiccups.

## What this task explicitly does NOT include

- Rebranding audit (name is Terav — committed).
- Copy pass on landing (that's the separate positioning-audit follow-up).
- Additional TLDs (`terav.com`, `terav.co`) — buy defensively if desired but not needed for cutover.
- Migrating existing beta users' data (data lives in Supabase — domain-independent).
