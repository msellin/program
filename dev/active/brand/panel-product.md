# Panel: product lead (2026-10-27)

Lens: positioning fit, ad performance, home-screen recognisability, cost/risk to ship this week.
Peer data in research.md is thin; my peer comments are from general familiarity, not measured.

## Scores (0-10)
| Criterion | A Chisel | B Lettermark | C Edge |
|---|---|---|---|
| 1 Positioning fit | 8 | 6 | 7 |
| 2 Ad performance | 6 | 8 | 6 |
| 3 Home-screen recognisability | 6 | 7 | 5 |
| 4 Cost/risk this week | 9 | 5 | 4 |
| **Total** | **29** | **26** | **22** |

Notes:
- A: chisel = "sharpen one thing", matches the hero's underlined word. The T already ships, so installed users see no change. At 32/16px the gradient turns to mush (visible in the board), hence flat bronze there. As an ad logo it is a small orange T, legible but not distinctive.
- B: white "t." with a bronze full stop is the strongest thumb-stopper at feed size and clearly different from bronze-on-black fitness icons. But it is a generic lowercase-letter app icon (Tumblr "t", Twitter-era), and "flat, no gradient" drops the landing's chisel stroke. Its quiet, calm voice does fit "not a hype app".
- C: abstract wedge reads as "growth ramp/arrow", the generic fitness-progress trope I'd avoid. It is unreadable at 16px, has no letter, and is a new symbol for zero equity.

## Pick: A, converged, with B's flat-first discipline
- Keep the chisel T geometry as shipped. Do not redraw it this week.
- Icon: one flat bronze #d09a68 T on #0e0f12 at every size under 48px, including the favicon and the maskable icon. The gradient appears only at 48px and above, in the splash, and under the wordmark.
- Take from B: the flat bronze CTA and one accent rule (teal for data/info only, not decoration).
- Ship now: unify accents, fix the maskable safe zone, add iOS splash screens, align the wordmark to the chisel (pip replaced by a short chisel stroke under it, or keep the pip and drop the stroke). Do not re-icon.

## Strongest argument against A
In a feed, a small bronze-gradient T on black is not distinctive, and a gradient on a health-ish app reads as a generic "premium fitness" look. B wins a thumbnail test, and a dominant lettermark would build recall faster across ads. A also asks the ad creative to carry the identity, because the icon alone doesn't.

## Fix whichever wins
- Unify landing and app accents (one bronze, one teal). The disagreement is visible in a click-through from ad to app.
- Split the `"any maskable"` icon into a separate `any` and a separate `maskable` icon, with the glyph inside the 80% safe zone.
- Add iOS splash screens.
- Match the wordmark to the icon.
- Make ad screenshots show the Accept card, "Because: your log, sessions 5-6". That is the differentiator, and no logo choice will make up for it.

## Recommendations
- **Bronze/teal:** bronze #d09a68, hover #e8b988 (landing values; its CTA contrast is already accepted). Teal #7fc4d0. Move the app's "slate" values (#c89666 / #79b8c4) to these. The change is under 3% luminance, so it is low-risk and invisible to users.
- **Gradient:** yes, but only on the identity at 48px and above (splash, hero stroke, ad end-card). No gradient on buttons, icons under 48px, or charts.
- **Wordmark case:** TERAV caps, tracked about .22em. It stays on-brand with the eyebrow mono caps and gives the ad header a stable lockup. Lowercase is friendlier but pulls toward B and Hevy-like casualness.
- **Type scale:** keep it. Only change: H1 to 600 weight at 32 with -0.01em tracking, since 700 over-shouts next to a "calm, evidence-first" tone. Eyebrow 11px is the risk in ad crops; use 12 there if screenshots are resized.
- **Icons:** keep lucide 1.75. Nothing about the brand justifies churn this week.
