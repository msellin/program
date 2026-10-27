# Compliance + ad claims: deep findings (Sonnet, 2026-10-27)
Not legal advice. Saved by the orchestrator from the agent's text reply (its own file write was refused).
Inputs: audit/h01, h09, h10, h13, h14, h15, h18; findings-market; findings-video-coach.

## 1. BLOCKS-ADS-TODAY, ordered (what | why | fix | effort | owner-only)
1. **Owner's clinical record is public.** `app.terav.fit/data/{clinical-context,open-questions,log,program}.json`
   all return 200 (confirmed by curl). | Art. 5(1)(c) data minimisation, plus reputational risk. | Remove them from
   `next-app/public/data/`. Keep `programs/anterior-hip-rebuild.json` only if the owner's app needs it. Check the
   `data-loader.ts` callers first, then run `npm run verify`. | M | no
2. **Hip UI shows to new users.** `SignalsStrip.tsx:425` renders `<AssessmentDueBanner/>` ungated (verified). |
   A new user sees "First hip check". | Gate it on `program?.slug === "anterior-hip-rebuild"`, as the chip at `:69`
   already does. | S | no
3. **Google sign-up skips the Art. 9 tick.** `sign-up/page.tsx:133-148` has only "Continuing accepts..." text. |
   Art. 9(2)(a) needs explicit consent. | Keep GoogleAuthButton disabled until the terms and health-consent boxes
   are ticked. | S | no
4. **Privacy copy is false in places.** | Breaches Art. 13 and looks deceptive. | Edit `legal/privacy/page.tsx` to
   say only what is true. | M | no
   - `:75` says consent timestamps are kept 3 years, but no table exists.
   - `:97` says "you ticked the box", which is untrue for Google users.
   - `:80` says Sentry "symptom text scrubbed", which is overstated.
   - `:117-119` says Resend handles notices only, but `functions/api/feedback.ts:110` sends it the message, uid and email.
   - `:114` lists Cloudflare as static hosting only, but its Functions process requests.
   - Google OAuth is not named.
5. **Landing privacy and terms are the weaker copies** (`landing/src/app/privacy/page.tsx:38-59`,
   `terms/page.tsx:52-58`). | The ad landing is the first thing reviewers see. | Mirror or link the app's `/legal/*`. | S | no
6. **No age gate.** Terms say 16+, but sign-up has no age tick. | Inconsistent; ads need 18+ targeting. | Add an
   age checkbox near `sign-up/page.tsx:196-204`. Target ads at 18+. | S | targeting only
7. **Overclaims on ad-linked pages** (from h18, not re-checked). | Meta Unacceptable Claims, Google Unreliable claims,
   EU consumer law. | In `landing/src/i18n/dictionaries/en.ts` and `manifest.json`: | M | founder OK on copy
   - "125 primary studies" → "cited sources".
   - Remove "Every change cites a study".
   - Remove the numeric gains (5-8% VO2max, 3-6% threshold, 3-30 s on the 2K, bpm drops).
   - Remove "Six weeks to a 2K PR".
8. **CTA and sign-up mismatch.** Landing says "no signup wall" and "Start free" (`Hero.tsx:81,96`), while terms say
   "closed beta" (`legal/terms:27`). | Misleading CTA. | Align the copy. Confirm the Supabase sign-up toggle is ON
   and that confirm-email mail arrives. Do one real sign-up. | S | yes (dashboard)
9. **Tracking** per §3. Update the privacy pages in the same commit. | S-M | partly (Cloudflare dashboard)
10. **Ad accounts.** Set up Meta Business and Google Ads. No remarketing, Custom Audiences or Customer Match. | Google
    lists "Health" as a sensitive category for personalised ads. | Interest and search targeting only. | M | yes
11. **Founder hip story and mock on ad-linked pages** (`TodayMockup.tsx:21`, `en.ts:93-95`). | Personal-attribute
    and health-adjacent flag. | Swap the mock text. | S | founder call

## 2. Safe wording
Headlines:
1. "Train one skill until it sticks"
2. "Sharpen a single lift"
3. "A focused plan for your engine"
4. "Pull-up progressions, with sources"
5. "Muscle-up practice, structured"
6. "Training that adapts to your log"

Primary texts:
- **A:** "Terav builds one focus (your engine, a lift or a skill) around your existing week. You log, it proposes,
  you accept."
- **B:** "Skill work with the sources shown: each change names the study or the log signal behind it. Free during beta."
- **C:** "Pick a focus: pull-ups, muscle-ups, rowing or engine. Short sessions that sit alongside your gym programming."

Banned for the sprint:
- **Health words:** pain, injury, rehab, recover, heal, treat, cure, symptoms, diagnosis, hip,
  "your condition/weakness/problem", "stuck".
- **Result and proof claims:** "in N weeks", guaranteed, proven, clinically, any % / bpm / seconds gain, "125 studies".
- **Imagery and attribution:** before/after images, testimonials.
- **"CrossFit"** in ad text or handle (trademark unchecked). Use "functional fitness".

## 3. Tracking today
Use Cloudflare Web Analytics (cookieless) plus UTMs captured at landing and stored at sign-up. Read ads by
utm_campaign against sign-up counts. Optimise Meta for link clicks or landing-page views, and Google for clicks.

No Meta Pixel, CAPI or gtag today:
- Both privacy pages say there is no analytics, so a pixel would make them false.
- A pixel needs a consent banner.
- The `_headers` CSP is `script-src 'self'`, which blocks any tag.
- Meta's Business Tools terms restrict health-derived data.

Name Cloudflare Web Analytics on both privacy pages in the same commit. "Cookieless needs no banner" is a vendor
claim, so a lawyer should confirm it.

## 4. Later
BEFORE-SCALE:
- Consent Mode v2 plus a CMP, then a Google conversion tag.
- Paid-tier terms: renewal, 14-day withdrawal, VAT. Fix the landing vs app terms contradiction.
- Drop personal slugs from generateStaticParams (`programs/[slug]/page.tsx:9-17`).
- Fix the `/check` LEGACY_REGIONS fallback (`check/page.tsx:169`) and the data-loader hip default.
- Add a consent-withdrawal path short of deleting the account.
- Enable Supabase captcha and rate limits.
- Fix the remaining h18 claims and sadowski_2021.
- Lawyer review of terms and privacy, plus a DPIA.

LATER:
- `guide/page.tsx:155` hip copy.
- International-transfer wording.
- Cookie wording.
- Personal copy on the landing disclaimer.
- Closed-beta remap in `auth-errors.ts`.

## 5. Verified vs taken from Haiku
Verified:
- The `/data/*.json` files are public.
- `SignalsStrip:425` is ungated.
- Google sign-up has implied consent only.
- The `privacy:75` retention text exists.
- The CSP blocks third-party scripts.
- Google's personalised-ads page (support.google.com/adspolicy/answer/143465, 2026-10-27) lists Health as a
  sensitive category. It does not name fitness.

Not verified:
- Meta's health-wellness page returned only its title, so the Meta rules rest on third-party summaries. Treat them
  as conservative.
- Google Healthcare and Unreliable-claims pages, and the Consent Mode v2 mandate.
- The h18 figures.
- The Resend, Cloudflare and Sentry facts from h13.
- The Estonian digital age of consent (believed 13; use the 16+ tick regardless).

A lawyer is needed for:
- Art. 9 consent design and a DPIA.
- Whether cookieless analytics needs ePrivacy consent.
- The processor and transfer list, and the DPAs.
- Subscription and withdrawal terms.

Whether Meta or Google classify the app as health is a platform-review outcome, not a legal question.
