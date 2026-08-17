# terav.fit migration — founder / agent split

**Status:** in progress 2026-08-17. Domain `terav.fit` purchased. DNS zone not yet added to Cloudflare.

## What I've already prepared (in this repo)

- Full spec + failure modes: `dev/active/domain-migration/plan.md`
- Landing metadata already targets `terav.fit` — `landing/src/app/layout.tsx:18` sets `metadataBase: new URL("https://terav.fit")`. This is fine to ship pre-cutover; it only affects OG/canonical links which resolve after DNS.
- Landing contact emails already reference `hello@terav.fit` across 6 files (footer, privacy, terms, disclaimer, BetaCTA). Also fine pre-cutover — becomes a valid mailto once you have MX records.

## What I CAN'T do without your action

Two CLI-level access items:

### 1. Add `terav.fit` to Cloudflare as a zone

I'm authenticated as `sellinmargus@gmail.com` on wrangler but **`wrangler` cannot create zones** — that's a dashboard operation (or requires a Cloudflare API token with Zone.Zone.Edit permission).

**You do (in Cloudflare dashboard):**
- Add site `terav.fit` (free plan is fine)
- Cloudflare gives you 2 nameservers (e.g. `alicia.ns.cloudflare.com`, `walt.ns.cloudflare.com`)
- Update the registrar (wherever you bought `terav.fit`) to use those nameservers
- Wait ~15 min for propagation
- Enable Universal SSL (default; verify it's active)

**Optional but recommended:** create a scoped Cloudflare API token now and share it (paste as `CLOUDFLARE_API_TOKEN` when you next boot Claude). Permission scope: `Zone.Zone.Read`, `Zone.DNS.Edit`, `Account.Cloudflare Pages.Edit`, resource = terav.fit + terav-landing + program-v2. That lets me do the rest of steps below without your dashboard time.

### 2. Give me Supabase CLI access

Supabase CLI is installed but not logged in. I can't run interactive login (no TTY).

**You do:**
- Go to https://supabase.com/dashboard/account/tokens
- Create a new access token (scope: whatever you're comfortable with)
- Either paste it here so I can `export SUPABASE_ACCESS_TOKEN=...`, or run `supabase login --token <the token>` yourself and hand back

## Once you've done both of those, I can do the rest (~1h total)

### Cloudflare — DNS + Pages binding

```bash
# Assuming CLOUDFLARE_API_TOKEN is set with the right zone/pages permissions.
# 1. Add A / AAAA / CNAME records for terav.fit and app.terav.fit
#    (Cloudflare's auto-generated Pages CNAMEs; details when we get there).
# 2. Bind terav.fit → terav-landing project (Custom Domain add).
# 3. Bind app.terav.fit → program-v2 project (Custom Domain add).
# 4. Verify SSL cert issues.
```

### Landing — one-line config swap

`landing/src/config.ts` currently reads `APP_URL = "https://program-v2.pages.dev"`. I have a prepared commit ready to flip it to `"https://app.terav.fit"`. **Do not push until step above completes** or the landing's Sign-In and Beta CTAs will point at a 404.

### Coach worker — one-line CORS + fetch-origin swap

`worker/wrangler.toml` currently reads `FRONTEND_ORIGIN = "https://program-v2.pages.dev"`. Same story — I'll flip to `"https://app.terav.fit"` and redeploy the worker (`wrangler deploy` from `worker/`).

### Supabase Auth — dashboard config only

**You do (or I do via CLI once logged in):**
- Site URL: `https://terav.fit`
- Additional Redirect URLs: `https://app.terav.fit/**`, `http://localhost:3000/**`
- OAuth callback URLs (if any providers active): `https://app.terav.fit/auth/callback`

### Post-cutover verification

- Fresh incognito sign-up on `app.terav.fit`
- Sign in → sign out → magic-link email → password reset (all through Supabase Auth)
- PWA install prompt on iOS Safari
- Old `program-v2.pages.dev` still resolves (Cloudflare Pages keeps `.pages.dev` alive; can add a 301 redirect page-rule later)

## What has been decided about the code changes

Ready but NOT yet committed:
- `landing/src/config.ts:6` — `APP_URL` = `https://app.terav.fit`
- `worker/wrangler.toml:12` — `FRONTEND_ORIGIN` = `https://app.terav.fit`
- `landing/README.md:105-106` — the "planned change" note becomes "done"
- `NEXT.md:41-47` — ops reference URLs

Held here so we can push in one atomic commit at cutover time — not before.

## Ancillary items surfaced

- `dev/scripts/run-app-audit.sh:8` refers to `program-v2.pages.dev` in a comment. Will update at cutover.
- Neither `landing/` nor `next-app/` currently has a `robots.txt`. Consider adding one to `landing/public/robots.txt` after cutover (allow all; sitemap at `https://terav.fit/sitemap.xml` if we ship one).
- `next-app/public/manifest.json` uses relative paths only — no URL update needed.
- Email sender identity — you mentioned `hello@terav.fit` in the landing copy. To actually SEND from that address you'll need MX + SPF + DKIM. If beta only receives (not sends), forward `hello@terav.fit` to `sellinmargus@gmail.com` for now. That's a Cloudflare Email Routing dashboard task.

## Estimated time

- Your dashboard work: ~15 min (add zone, update nameservers) + ~10 min (Supabase Auth config + get API tokens if you want to give me access)
- DNS propagation wait: ~15 min–2h
- My code + redeploy work: ~30-45 min once DNS is live
- Verification pass: ~30 min

**Half a day realistic, most of it wall-clock DNS propagation.**
