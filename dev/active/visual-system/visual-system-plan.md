# Visual-system pass: D-03 one card + D-04 type scale (2026-10-28)

Owner asked for it before the ad test. Source spec: `dev/active/launch-readiness/findings-design.md` §5c–5e.

## Primitives (done first, by the lead)
- **Type scale**, in `brand/tokens.css` (shared with the landing). Utilities:

  | class | size | use |
  |---|---|---|
  | `text-eyebrow` | 11 | mono uppercase label above a heading, set-grid headers |
  | `text-caption` | 13 | meta, timestamps, helper text, chips |
  | `text-small` | 14 | secondary body, dense rows, list items |
  | `text-body` | 16 | primary copy, paragraphs, card body |
  | `text-h3` | 17 / 600 | card title |
  | `text-h2` | 20 / 600 | section heading |
  | `text-h1` | 32 / 700 | page H1 (one per page) |
  | `text-metric` | 40 | a hero number |

- **Card**: `components/ui/Card.tsx`, `<Card status? flush? as?>` or `cardClass()` on a button or Link.
  - Surface, `border-line-soft`, `rounded-xl` (12px), `p-4`.
  - The left bar is for status only: green, amber or red.

## Mapping rules for lanes
1. **Text sizes.** Replace every `text-[Npx]`:

   | old size (px) | new class |
   |---|---|
   | 10, 11 | `text-eyebrow` |
   | 12, 12.5, 13 | `text-caption` |
   | 13.5, 14, 14.5 | `text-small` |
   | 15, 16 | `text-body` |
   | 17, 18 | `text-h3` |
   | 20, 22 | `text-h2` |
   | 24, 26, 32 | `text-h1` |
   | 40 | `text-metric` |

   - Use judgement where the role is clearer than the number. A page H1 is `text-h1` even at 26.
   - Tailwind named sizes (`text-sm`, `text-xs`, `text-lg`, …) also map to the scale.
   - Keep 64 and 92 (timer digits).
   - Drop `font-semibold`/`font-bold` when the token already carries the weight.
2. **Cards.** A bordered `bg-surface` container that reads as a card becomes `<Card>` or `cardClass()`.
   - Leave alone: rows inside a card, inputs, chips, pills, sheets, modals, buttons.
   - Nested panels inside a card are `rounded-lg bg-surface-2 p-3`, with no border.
3. **Accent bars.**
   - `border-l-slate`, `border-l-bronze`, `border-l-line` and other decorative left bars: remove.
   - A red, amber or green bar that signals state: `status="…"`.
4. **Radii.**

   | element | radius |
   |---|---|
   | card | `rounded-xl` |
   | button, input, nested panel | `rounded-lg` |
   | small chip | `rounded-md` |
   | pill, avatar | `rounded-full` |

   - Replace `rounded-[Npx]` and bare `rounded` with one of these.
5. **`style={{…}}`.** Keep it when the value is dynamic (widths, chart colours). Convert static values to classes.
6. **Don't touch:**
   - copy or logic;
   - `lib/symptom-state.ts`;
   - test IDs, aria attributes, data attributes.

   Tests that assert old class names: update them to the new class.

## Lanes (no overlapping files)
| lane | files |
|---|---|
| L1 | `components/session/**`, `components/follow-along/**` |
| L2 | `components/workout/**` |
| L3 | `components/check/**`, `app/check/**`, `components/plan/**`, `app/plan/**`, `components/offplan/**`, `components/history/**`, `app/history/**`, `app/week/**`, `app/extras/**`, `app/progress/**` |
| L4 | `app/programs/**`, `components/onboarding/**`, `app/(auth)/**`, `components/auth/**`, `app/account/**`, `app/reset-password/**`, `app/settings/**`, `app/legal/**`, `app/guide/**`, `app/feedback/**`, `app/evidence/**`, `app/not-found.tsx`, `app/global-error.tsx`, `app/admin/**`, `app/dev/**` |
| L5 | `app/report/**`, `components/record/**`, `app/record/**`, `components/progress/**`, `components/profile/**`, `app/profile/**`, `components/charts/**`, `components/ui/**` (except `Card.tsx`), `components/nav/**`, `components/citations/**`, the loose `components/*.tsx`, `app/page.tsx`, `app/layout.tsx` |

## After the lanes
1. `type-scale.test.ts` fails on any `text-[Npx]` outside the allowlist.
2. Run `npm run verify` and the full persona sweep.
3. Re-shoot the ad-path screens (`launch-gaps.spec.ts`, A and C), rebuild the gallery, and do a visual check at 375.
4. Commit and deploy.

## Risks
- Body text goes from 14/15 to 16, so text may wrap more at 375. The re-shoot catches this.
- Cards get bigger radii and padding, so pages get longer. Accepted per the spec.
