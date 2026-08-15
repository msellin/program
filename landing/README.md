# Terav Landing

Marketing landing page for [Terav](https://terav.fit) — the adaptive fitness /
rehab app. Separate Next.js project from the app itself (which lives in
`../next-app/`). Deploys to its own Cloudflare Pages project.

## Stack

- Next.js 16 (static export)
- React 19
- Tailwind CSS 4
- TypeScript
- No auth, no analytics, no service worker

## Content sources

Every marketing claim on the landing must be defensible against one of:

- `../dev/whitepapers/00_master.md` — master whitepaper, trainer-parity claim
- `../dev/whitepapers/01_aerobic_physiology.md` — 25+ primary sources
- `../dev/whitepapers/02_concurrent_training.md` — 35+ primary sources
- `../dev/whitepapers/03_motor_learning.md` — 40+ primary sources
- `../dev/active/saas-launch/architecture-v2.md` — v2 architecture

If you cannot trace a claim to a source above, delete it or add the source.

## Develop

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build

```bash
npm run build
```

Static output lands in `out/`.

## Deploy

Deploys to a Cloudflare Pages project called `terav-landing` (create it once,
then use the `deploy` script).

```bash
npm run deploy
```

Under the hood: `next build && wrangler pages deploy out --project-name=terav-landing`.

## Structure

```
src/
  app/
    page.tsx                  ← home
    evidence/page.tsx         ← /evidence — citation list grouped by domain
    privacy/page.tsx          ← /privacy
    terms/page.tsx            ← /terms
    disclaimer/page.tsx       ← /disclaimer (medical)
    layout.tsx                ← root layout + fonts + metadata
    globals.css               ← palette + tailwind
  components/
    Ambient.tsx               ← the radial gradient blobs
    Nav.tsx                   ← nav bar
    Footer.tsx                ← footer
    Wordmark.tsx              ← TERAV wordmark
    LegalLayout.tsx           ← shared shell for /privacy /terms /disclaimer
    sections/                 ← home page sections
      Hero.tsx
      ThreeWayContrast.tsx
      HowItWorks.tsx
      Programs.tsx
      EvidenceClaim.tsx
      WontDo.tsx
      OriginStory.tsx
      BetaCTA.tsx
    mockups/                  ← CSS-only phone mockups
      PhoneFrame.tsx
      TodayMockup.tsx
      PlanMockup.tsx
      IntakeMockup.tsx
      ProgressMockup.tsx
      ReportMockup.tsx
```

## Design notes

- Warm dark palette derived from the parent app (`../next-app/src/app/globals.css`)
  with slightly punchier accent saturation (`#d09a68` bronze, `#7fc4d0` teal)
  for the marketing surface.
- Every mockup is pure CSS — no image assets. This lets us change them without
  a designer round-trip and keeps the bundle small.
- All copy is defensible against the whitepapers. When adding a marketing
  claim, add the source alongside it (see `sections/EvidenceClaim.tsx` and
  `sections/Programs.tsx` for the pattern).

## Sign-in link

The Sign in link in the nav currently points at
`https://program-v2.pages.dev/sign-in` (the current app URL). Update to
`https://app.terav.fit/sign-in` once the app moves.
