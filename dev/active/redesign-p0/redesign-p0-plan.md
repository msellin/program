# Redesign P0 (2026-10-28): before the ads

Source: `dev/active/design-review-2026-10-28/{REDESIGN-TARGET,MASTER-LIST,peers-00-visual-evidence}.md`.

**Owner decision on visuals:**
- **A now:** SVG figures for every drill on the ad path.
- **B later:** owner-shot video.
- **C as the legal stopgap:** official YouTube embeds (youtube-nocookie, tap-to-load) and openly licensed libraries.
  Never re-host screen-recorded third-party video.

## Shared rules (all lanes)
- Follow the visual system: `dev/active/visual-system/visual-system-plan.md`.
  - The type scale: text-eyebrow/caption/small/body/h3/h2/h1/metric.
  - `ui/Card` / `cardClass()`; status-only left bars; `ui/Button`.
- Peers put **one hero visual per screen**, then short cards.
  - Title: at most 6 words. Helper: at most 12 words.
  - Paragraphs only behind a "Why" or "How it works" tap.
- Never weaken safety:
  - `lib/symptom-state.ts` is off-limits.
  - Safety gates block or warn exactly as today.
  - Red days stay rest-only.
- No personal clinical copy in shared code or data.
- Work in the main checkout. Edit only your lane's files. Do not commit or change git state.
- Run before reporting:
  - `cd next-app && npx tsc --noEmit -p .` (fix only your files);
  - `npx vitest run <your dirs>` and `src/lib/data-integrity.test.ts` if you touched data;
  - `src/lib/type-scale.test.ts`.
- Report in at most 25 lines: files changed, what a user now sees, judgement calls, test result.

## Lanes
| Lane | Files | Delivers |
|---|---|---|
| **F: figures and media** | `lib/figures/**`, `components/follow-along/**`, `components/session/BriefView.tsx`, `app/legal/privacy/**` (YouTube line only) | SVG figures for every exercise on the ad path; the media box never empty; a tap-to-load demo video; thumbnails in brief rows |
| **Q: quick start** | `app/programs/[slug]/intake/**` | A 3-screen quick start as the default (see below); the full intake behind a link and `?mode=full`; tier hints gone from the full intake |
| **P: program page and Today** | `app/programs/[slug]/ProgramPreviewClient.tsx`, `app/programs/page.tsx`, `components/session/TodaySession.tsx`, `components/FirstRunBanner.tsx`, new `components/program/*` | Hero, level ladder, stat tiles, sticky Start, collapsed "How it works"; remove the Four-tabs tour; a "Find your exact level" card on Today |
| **R: research** (read-only) | writes `dev/active/redesign-p0/licensed-media.md` | Legal demo sources for each ad-path drill |

## Quick start spec (lane Q)
The default for any program with `plan_tiers`. Programs without them keep the full intake.

1. **Level.** One card per `plan_tiers[]` entry.
   - Title: the label with the "Tier X —" prefix stripped ("No hang yet").
   - Subline: a one-line plain reading of the tier `condition` ("Dead hang under 15 s").
   - The choice sets the tier directly, the same as today's override path.
2. **Safety.** Every screening question (the ids behind `safety_gates`, plus the known symptom-history ids) on ONE
   screen, each a compact Yes / No (/ Unsure where authored) row, with a "None of these" button. Gate evaluation,
   block screens and warning acknowledgements are unchanged. Answers persist in `intake_answers`, because
   `intake-exclusions.ts` reads them.
3. **Your plan.**
   - The level ladder with the chosen node lit.
   - 3 stat tiles: weeks, days per week as a chip row defaulting to the program's value, minutes.
   - Typical outcome phrased as "Typically by week N:", never a promise.
   - The required consent ticks.
   - Start.

Not on the quick-start path:
- **Physical tests:** skipped. The Today card offers them later, via `/programs/[slug]/intake/?mode=full`.
- **Bodyweight and the other "about" questions:** optional. The generator must work without them; verify this.
