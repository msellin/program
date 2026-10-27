# G3 email / PWA / SEO audit (read-only, 2026-10-27)

**Emails**
- [HACKATHON] Supabase confirm/reset use Supabase default templates: `supabase/config.toml` has no `[auth.email.template]`, `site_url` or SMTP block. Check dashboard sender and branding before ads.
- [HACKATHON] No welcome, day-2 or trial email in repo. Resend is only used by `next-app/functions/api/feedback.ts:110` (to founder) and `functions/api/admin/notify.ts:120` (manual admin broadcast, never automated, per `notify.ts:12-14`).
- [BEFORE-SCALE] Sender `notices@terav.fit` (`feedback.ts:41`, `notify.ts:49`); SPF/DKIM not verifiable from repo.

**PWA**
- Manifest exists: `next-app/public/manifest.json` (standalone, start_url "/", icons 192 and 512). Apple meta at `next-app/src/app/layout.tsx:41-45`.
- [LATER] Icon 512 has `"purpose": "any maskable"` combined; split. No `id`, no `description`.
- Install prompt only in `next-app/src/app/settings/page.tsx:121-134`, gated on `beforeinstallprompt`. iOS never fires it (`profile/page.tsx:34-36`).
- [HACKATHON] iOS gets no install affordance and no instructions anywhere. Landing has no "home screen" copy (grep of `landing/src` empty).

**Landing SEO (`landing/src/app`)**
- Root title/description/OG/Twitter: `layout.tsx:17-37`, template "%s · Terav". Good.
- Per-page metadata with canonical: `programs/page.tsx:12-26`, `evidence/page.tsx:10-24`, `roadmap/page.tsx:11-25`. Program pages: `programs/[slug]/page.tsx:16-42`.
- [BEFORE-SCALE] Home, `privacy`, `terms`, `disclaimer` have no metadata export, so no per-page title, description or canonical.
- [HACKATHON] No `og:image` or `twitter:image` anywhere (grep empty), including program pages. Shared links preview as text only. Add a 1200x630 default image in `layout.tsx` `openGraph`/`twitter`.
- [LATER] Root `openGraph` has no `url` or `siteName` (`layout.tsx:25-31`).
- Favicon/icons declared `layout.tsx:38-48`; `apple-touch-icon.png` present in `landing/public`.
- Sitemap `landing/src/app/sitemap.ts:1-44` (static + public programs), built to `landing/out/sitemap.xml`. Robots `landing/src/app/robots.ts:20-26` (allow all, sitemap line). [LATER] `out/robots.txt` carries a non-standard `Host:` line.

**404 and CTA routes**
- [HACKATHON] No `landing/src/app/not-found.tsx`; `landing/out/404.html` is Next's unbranded default. Ad bounces hit a dead end.
- All landing CTAs resolve: `APP_URL` = `landing/src/config.ts:5` (`/sign-up`, `/sign-in` exist under `next-app/src/app/(auth)/`); internal `/programs`, `/programs/[slug]`, `/evidence`, `/roadmap`, `/privacy`, `/terms`, `/disclaimer` all exist; `#how-it-works` anchor at `landing/src/components/sections/YourFirstWeek.tsx:44`. Remaining hrefs are mailto.
- App has a branded 404 (`next-app/src/app/not-found.tsx`). [BEFORE-SCALE] App has no OG metadata and no robots.txt/sitemap (login-gated, lower priority).

Not checked: Supabase dashboard templates and SMTP settings; live OG/Twitter preview rendering; live response headers; Resend domain verification; a crawl of the deployed site (source and `out/` only); privacy/terms/disclaimer rendered metadata beyond source grep.
