# Terav app — Accessibility audit (WCAG 2.2 AA, 21 personas)

Personas audited: full 21-bundle sweep, with depth on the four never-audited bundles —
`persona-pullup`, `persona-pullup-fast`, `persona-muscleup`, `persona-engine-block2` —
plus the three legacy reference personas `persona-recover`, `persona-strength`,
`persona-erratic`.
Artifacts basis: `next-app/tests/e2e/artifacts/personas/` (regenerated 2026-09-01)
Palette source: `next-app/src/app/globals.css`
Viewport: 393×852 mobile (26 route captures/persona), desktop cross-check
Prior rounds cross-referenced: `2026-08-17`, `2026-08-19-batch25`, `2026-08-20-jury`,
`2026-08-21-post-batch36`

---

## 1. Overall verdict

The chrome is genuinely good and it is not close: one `<main id="main-content" tabindex="-1">`
per route, a working `sr-only focus:not-sr-only` skip link (`AppShell.tsx:122-127`), a
`<nav aria-label="Primary">` of real `<a href>` with `aria-current="page"`, an announcer
region that exists at load rather than being injected (`AppShell.tsx:186`), a global
`*:focus-visible` bronze ring, and — across 182 route captures — **zero unnamed `<button>`,
zero `<a>` without `href`, zero `<div role="button">`, zero positive `tabindex`, zero
`aria-hidden` on a reachable interactive node.** That is a better baseline than most shipped
PWAs. The systemic failures are all in the *new* session flow that shipped after the
2026-08-21 pass and has never been audited: `--color-line` (#5f6570, max 3.27:1) is being
used as a **text** colour in 26 places across `RestTakeover`/`SetView`/`BriefView`/
`OffPlanSheet` — a flat 1.4.3 fail on a token the palette explicitly documents as a
*boundary* token; the `/session/[slug]` route renders **no heading at all** on rest days
(all four new personas, both past and today captures); and `<title>` is still the identical
marketing string on all 26 routes — a Level A 2.4.2 failure first raised 2026-08-17 and
never closed, which on a headingless rest-day screen leaves an SR user with literally no
orientation. The 2026-09-01 four-way RPE picker is a tap-target pass and a focus-order fail:
selecting an effort unmounts the focused button.

---

## 2. Systemic issues (fire across ≥2 personas)

### 2.1 `text-line` used as body text — 1.4.3 fail at 2.68–3.27:1
- **SC:** WCAG 1.4.3 Contrast (Minimum), AA
- **Where:** all 21 personas, `/session/[slug]` + `/` set flow. 26 occurrences:
  `next-app/src/components/session/RestTakeover.tsx:181,190,201,231,256,290`,
  `next-app/src/components/session/SetView.tsx:382,390` (+4 mono captions),
  `next-app/src/components/session/BriefView.tsx:285,338` (+3),
  `next-app/src/components/session/OffPlanSheet.tsx`, `OverflowSheet.tsx`,
  `next-app/src/components/workout/SetRow.tsx`, `offplan/OffPlanSession.tsx:305`
- **What:** `--color-line: #5f6570` (`globals.css:29`) is documented in its own comment as a
  *non-text boundary* token tuned to clear the 3:1 of 1.4.11. It is now painting text.
  Computed: **3.27:1 on `ground`, 3.03:1 on `surface`, 2.68:1 on `surface-2`.** Body text
  needs 4.5:1. The worst instance is `RestTakeover.tsx:231` — the reps-in-reserve sub-label
  ("4-5+ in reserve") at **9 px on `bg-surface-2` = 2.68:1**, which is the single number the
  strength track's training-max estimate depends on. `SetView.tsx` repeats the same 9 px
  pattern.
- **Fix:** these are all secondary/caption text, not boundaries. Swap `text-line` →
  `text-muted` (#93989f = 5.42:1 on surface-2, 6.60:1 on ground) everywhere it colours a
  glyph. Keep `border-line` untouched. Mechanical: `text-line\b` → `text-muted`, 26 sites,
  no visual regression beyond a slight lift.

### 2.2 `<title>` identical on every route — 2.4.2, Level A, open since 2026-08-17
- **SC:** WCAG 2.4.2 Page Titled, **A**
- **Where:** every persona × every one of 26 captures. `<title>Terav — Pick your focus.
  Sharpen it every session.</title>`. Root metadata, `next-app/src/app/layout.tsx`.
- **What:** raised in `2026-08-17-app-audit-accessibility.md:20`, deferred, still true. On
  routes that also have an `<h1>` this is annoying; on `/session/[slug]` in rest state
  (§2.3) it is disabling — the route has no title, no `<h1>`, no `<h2>`. VoiceOver rotor
  and NVDA's title announcement on route change both return the marketing tagline. Route
  changes in an App-Router SPA are the *only* moment most SRs announce anything.
- **Fix:** per-route `export const metadata = { title: "Record" }` on the static routes;
  for `/session/[slug]` use `generateMetadata` returning the weekday + program name already
  computed for `BriefView.tsx:130`. Template `"%s — Terav"` on the root layout.

### 2.3 `/session/[slug]` rest-day renders zero headings
- **SC:** WCAG 1.3.1 (A), 2.4.6 (AA)
- **Where:** `persona-pullup:/session` (16 + 17: 0 headings), `persona-pullup-fast:/session`
  (17: 0), `persona-muscleup:/session` (17: 0), `persona-engine-block2:/session` (16 + 17: 0),
  `persona-recover:/session` (16, 17, 18: 0), `persona-erratic:/session` (16, 17: 0),
  `persona-strength:/session` (17: 0). Source:
  `next-app/src/components/session/DaySession.tsx:173-187` →
  `next-app/src/components/session/shared/StatusCards.tsx:88-101`.
- **What:** the rest-day branch returns `<RestDayCard>` + `<RunSlotCard>`. `RestDayCard`
  opens with `<p className="font-semibold">Rest day.</p>` — a styled paragraph, not a
  heading. `BriefView.tsx:130` (the `<h1>`) is never reached on this branch. Screenshot
  `persona-muscleup/mobile/17-session-past.png` confirms: two cards, no page title, and the
  bottom nav shows no `aria-current` because `/session` is not one of the four tabs. An SR
  user landing here from the Plan tab's "Log a session →" gets `<main>`, then card text.
  This is the *newest* surface in the app (the activity-logging card shipped 2026-08-30) and
  it is the one with no structure.
- **Fix:** in `DaySession.tsx:173`, wrap the branch and lead with the route heading that the
  training branch already renders:
  ```tsx
  <h1 className="text-[32px] font-bold tracking-[-.03em] text-strong leading-none">
    {weekdayLabel}
  </h1>
  ```
  and promote `StatusCards.tsx:92` `<p>Rest day.</p>` → `<h2>`.

### 2.4 `StatusPill` makes every static badge an `aria-live` region
- **SC:** WCAG 4.1.2 (A) — ARIA misuse; 1.3.1
- **Where:** all 21 personas. `/evidence` carries **127** `aria-live="polite"` regions,
  `/programs` 9, `/` 2, `/record` 2. Source:
  `next-app/src/components/ui/StatusPill.tsx:90-91,127`.
- **What:** `const live = role === "status" ? (ariaLive ?? "polite") : undefined` — every
  non-interactive pill defaults to a live region, whether or not its text ever changes.
  `/evidence` renders 127 identical `CITED` badges, each `role="status" aria-live="polite"`.
  Live regions are not free: JAWS and NVDA register each one, and any re-render inside one
  (React key churn, filter, hydration) queues an announcement. The first rule of ARIA
  applies — a badge whose text is fixed at render is not a status.
- **Fix:** invert the default. `ariaLive` should be opt-in, not opt-out:
  ```ts
  const live = ariaLive; // no implicit "polite"
  ```
  and pass `ariaLive="polite"` explicitly at the ~3 call sites where the pill genuinely
  changes (`HeroStateCard.tsx:27` readiness, proposal accept/ignore result). `role="status"`
  without `aria-live` still conveys the semantic without the live boundary.

### 2.5 Toggle-button groups with no group name
- **SC:** WCAG 1.3.1 (A), 4.1.2 (A)
- **Where:** `persona-recover:/check/hip` (11 buttons × N questions),
  all personas `/session` rest-day + `/` (`RunSlotCard`), `/programs`, `/record`.
  `next-app/src/app/check/hip/page.tsx:288-303`,
  `next-app/src/components/workout/RunSlotCard.tsx:386-400` (activity type),
  `:542-558` (intensity), `:568-582` (session type),
  `next-app/src/components/onboarding/LifeLoadStep.tsx`, `src/app/programs/page.tsx`.
  Only 1 of 7 files carrying `aria-pressed` also carries `role="group"`/`<fieldset>`
  (`WeeklySessionStrip.tsx`).
- **What:** `check/hip` ScoreSlider emits eleven buttons labelled `aria-label="Score 0"` …
  `"Score 10"` with `aria-pressed`. Nothing associates them with the question — an SR user
  hears "Score 4, toggle button, not pressed" with no idea whether this is `low_back`,
  `groin_left` or `buttock_left`. Same in `RunSlotCard`: three unnamed chip rows
  (activity / intensity / session type) sitting adjacent, all announcing as bare toggle
  buttons. This is the rehab persona's primary data-entry surface.
- **Fix:** wrap each row in `<div role="group" aria-labelledby={questionId}>` (the question
  text already has an id in `check/hip/page.tsx`), and in `RunSlotCard` add three literal
  group labels: `role="group" aria-label="Activity type"` / `"Intensity"` /
  `"Session type"`. For `ScoreSlider` specifically, a native
  `<input type="range" min=0 max=10 aria-labelledby={qId} aria-valuetext={`${v} — ${label}`}>`
  collapses 11 tab stops to 1 and announces the value on change (3.3.2 + 4.1.2 both
  satisfied); that is the better fix but a larger change.

### 2.6 Selecting a choice destroys the focused element
- **SC:** WCAG 2.4.3 Focus Order (A)
- **Where:** `RestTakeover` effort picker (all strength/skill personas —
  pullup, pullup-fast, muscleup, strength, recover, erratic):
  `next-app/src/components/session/RestTakeover.tsx:159-165` + `:210`.
  Same pattern in `next-app/src/components/ui/ProposalCard.tsx:130-155` (Accept/Ignore →
  StatusPill + Undo) on `persona-recover:/`, `persona-strength:/`, `persona-engine-block2:/`.
- **What:** `selectEffort` calls `onEffortAnswered(true)`, which flips the guard at
  `RestTakeover.tsx:210` (`{!effortAnswered ? …}`) and unmounts the entire picker including
  the button the user just activated with Space/Enter. Focus falls to `<body>`; the next Tab
  restarts from the top of the document. Identical on proposal Accept — the button unmounts
  and the replacement `Undo` never receives focus. `grep -rn "\.focus()"` returns hits only
  inside `useFocusTrap.ts` — there is no focus restoration anywhere in the app.
- **Fix:** move focus to the replacement node in the same commit that unmounts the trigger.
  For `RestTakeover`, keep the picker mounted and mark state instead — render the four
  buttons with `aria-pressed={selectedEffort === effort.label}` and let the "change" affordance
  be redundant. For `ProposalCard`, `undoRef.current?.focus()` in the accept handler; if
  there is no `onUndo`, focus the card `<section>` (it already carries `aria-labelledby`;
  add `tabIndex={-1}`).

### 2.7 Effort/state selection carries no ARIA state
- **SC:** WCAG 4.1.2 Name, Role, Value (A); 1.4.1 (A)
- **Where:** `RestTakeover.tsx:216-236` (both render sites, the `upNext` branch and the new
  final-set branch added 2026-09-01). All strength/skill personas.
- **What:** the four effort buttons are a single-select set. They carry no `role="radio"`, no
  `aria-pressed`, no `aria-checked`. Selection is conveyed **only** by
  `border-bronze bg-[rgba(200,150,102,.14)]` and a text-colour swap on the sub-label — i.e.
  colour alone (1.4.1) and invisible to AT (4.1.2). Contrast the app's own convention:
  `RunSlotCard`, `ProposalCard` and `CutCProgramCurveCard` all use `aria-pressed`. This
  component was touched today and did not get it.
- **Fix:** `role="radiogroup" aria-labelledby="effort-q"` on the flex row (the "How was
  that?" `<p>` at `:212` becomes the label), `role="radio" aria-checked={…}` on each button,
  roving `tabIndex`. Minimum viable: add `aria-pressed={selectedEffort === effort.label}`.

### 2.8 `/record` skips h1 → h3
- **SC:** WCAG 1.3.1 (A)
- **Where:** every persona, `/record`, `/history` and `/progress` redirect captures
  (h1=1, h2=0, h3=2 on all 21 bundles). `next-app/src/app/record/page.tsx:134` renders
  `<h1>Record</h1>`; the next headings in the DOM are two `<h3>`
  ("Every change here cites its source" from `InfoSheet.tsx:131`, and the weekly heatmap
  group heading).
- **Fix:** the `InfoSheet` title is a dialog label — leave it, it is `aria-labelledby`'d and
  heading order inside a modal is not the page outline. The `/record` page-level h3s should
  be `<h2>`. Verify with a heading-order pass on `record/page.tsx` after the change.

### 2.9 Modal chrome is inconsistent — one hand-rolled dialog with no trap
- **SC:** WCAG 2.1.2 No Keyboard Trap (A) — inverse; 2.4.3 (A)
- **Where:** `next-app/src/components/session/RestTakeover.tsx:301-312` ("Jump to" sheet),
  reachable on every session persona. Also `RetestLoggingSheet.tsx`,
  `OnboardingRunner.tsx` (has trap — fine), `ProgramPreviewClient.tsx`, `report/page.tsx`,
  `account/page.tsx` declare `role="dialog"`/`aria-modal` without `useFocusTrap`.
- **What:** `RestTakeover` sits three lines away from `session/shared/BottomSheet.tsx`, which
  does all of this correctly (focus trap, Escape, body-scroll lock, `aria-labelledby`), and
  then hand-rolls its own `role="dialog" aria-modal="true"` with none of it. Escape does not
  close it. Tab walks straight out of the sheet into the rest-timer behind it, which is
  itself `aria-modal`-less. Separately, `RestTakeover`'s own root (`:171`) is a
  `fixed inset-0 z-40` full-screen takeover with **no** `role="dialog"`, no `aria-modal`, no
  focus move — the whole page underneath stays in the accessibility tree and the tab order.
- **Fix:** replace `RestTakeover.tsx:301-338` with `<BottomSheet titleId="jump-to-title"
  onClose={() => setJumpOpen(false)} surface="JumpSheet">`. On the takeover root, add
  `role="dialog" aria-modal="true" aria-label="Rest timer"` and `useFocusTrap(rootRef, skip)`
  so Escape skips rest — that is the correct Escape semantic here.

### 2.10 Form errors are not announced
- **SC:** WCAG 3.3.1 Error Identification (A), 4.1.3 Status Messages (AA)
- **Where:** `next-app/src/components/workout/RunSlotCard.tsx:694-696` (GPX import failure —
  reachable on every rest-day capture in all 21 personas),
  `next-app/src/app/(auth)/sign-in/page.tsx:164`, `sign-up`, `reset-password`,
  `check/page.tsx`. Only 5 sites app-wide use `role="alert"`/`aria-invalid`
  (`IntakeClient.tsx:1209`, `account/page.tsx:249`, `RetestLoggingSheet.tsx:100,125`,
  `MoveSheet.tsx:174`).
- **What:** errors render as a plain `<p className="text-red">` injected on failure. Text
  identification is present (3.3.1 partially satisfied — the message is words, not just a red
  border), but nothing announces it: a late-injected node in no live region is silent, and
  the offending control gets no `aria-invalid`/`aria-describedby`. A sign-in failure on a
  screen reader is indistinguishable from nothing happening.
- **Fix:** `role="alert"` on the error `<p>`, `aria-invalid={!!error}` +
  `aria-describedby={errorId}` on the associated control. Five files, one line each.

---

## 3. Per-persona findings

### persona-pullup (first-strict-pullup, new bundle)

| Route | SC | Sev | Finding | Fix |
|---|---|---|---|---|
| /session (16, 17) | 1.3.1 / 2.4.6 | P0 | Zero headings — rest-day branch. See §2.3. | `DaySession.tsx:173` h1 |
| /session | 1.4.3 | P0 | `text-line` captions in the set/rest flow. §2.1 | `text-muted` |
| /record | 1.3.1 | P1 | h1 → h3 skip. §2.8 | h2 |
| / | 4.1.2 | P1 | `section aria-label="Extra session slot"` is the only landmark on Day; its name does not match the visible "Log extra session" heading (`RunSlotCard.tsx:313` vs `:319`). 2.4.6 nudge. | Align the two strings; make `:319` an `<h2>` and swap `aria-label` → `aria-labelledby` |
| /plan, /off-plan | — | ok | The `invisible pointer-events-none disabled aria-hidden tabindex="-1"` DateNav spacer is correctly removed from the tree — not a finding. |
| /evidence | 4.1.2 | P1 | 127 live regions. §2.4 | StatusPill default |
| /programs, /profile, /account, /guide, /legal/*, /intake, /check | — | — | No route-unique findings. `<nav aria-label="More">`, `"Legal"`, `"Program category filter"`, `"Primary"` are all distinctly named — this is done right. |

### persona-pullup-fast (first-strict-pullup, accelerated)

| Route | SC | Sev | Finding | Fix |
|---|---|---|---|---|
| / | 1.3.1 | P2 | `<h1>First Strict Pullup</h1>` immediately followed by `<h2>First Strict Pullup</h2>` — same string, two levels. Redundant outline; VoiceOver rotor lists the program twice. Source `StatusCards.tsx:348`. | Drop the h2 or make it the phase/session name |
| /session (17) | 1.3.1 | P0 | Zero headings. §2.3 | |
| /session (16) | 1.3.1 | P1 | h2 with no h1 — `StatusCards.tsx:348` renders the program name as h2 while `BriefView.tsx:130`'s h1 is not on this branch. | Same fix as §2.3 |
| all | 2.4.2 | P1 | Shared `<title>`. §2.2 | |

### persona-muscleup (muscle-up acquisition, new bundle)

| Route | SC | Sev | Finding | Fix |
|---|---|---|---|---|
| / | 1.3.1 | P2 | Duplicate `h1`/`h2` "Muscle Up" (as pullup-fast). Also **zero `<section>`** on this Day capture where `persona-pullup` renders one and `persona-engine-block2` renders two — the sectioning is state-dependent, so SR landmark navigation is unreliable across states. | Emit `<section aria-label="Today's signals">` unconditionally, empty or not |
| /session (17) | 1.3.1 | P0 | Zero headings; screenshot `mobile/17-session-past.png` confirms an untitled two-card screen. §2.3 | |
| /session (16) | 1.3.1 | P1 | `<h2>Muscle Up</h2>` with no h1 on the page. | §2.3 |
| /record | 1.3.1 | P1 | h1 → h3. §2.8 | |
| /programs | 2.4.6 | — | Clean: h1 "Pick your focus." → h2 category → h3 program, all 8 programs, no skips. The catalog growth to 8 did not break the outline. |

### persona-engine-block2 (engine-builder block 2, new bundle)

| Route | SC | Sev | Finding | Fix |
|---|---|---|---|---|
| /session (16, 17) | 1.3.1 | P0 | Zero headings. §2.3. Worst case in the fleet: a cardio program with no set flow means the rest-day/log card **is** the session route. | |
| / | 4.1.2 | P1 | `StatusPill` "Check first" (amber) is `role="status" aria-live="polite"` on a value that is fixed at render. §2.4 | |
| / | 1.3.1 | — | Best-structured Day capture in the sweep: h1 + `<section aria-label="Today's signals">` + `<section aria-label="Extra session slot">`. Use this as the target shape for §2.3 / muscleup. |
| /record, /history, /progress | 1.3.1 | P1 | h1 → h3. §2.8 | |
| /off-plan | 1.3.1 | P2 | h1 only, no h2 — a flat list of logged sessions with no sub-structure. Acceptable; noted for parity with `persona-recover:/extras` which does emit h2 + h3. |

### persona-recover (rehab, hip-rebuild, day 30)

| Route | SC | Sev | Finding | Fix |
|---|---|---|---|---|
| /check/hip | 1.3.1 / 4.1.2 | P0 | Symptom scores are 11 unlabelled toggle buttons per question. §2.5. This is the persona whose entire clinical value is this form. | `role="group" aria-labelledby` or native range |
| /check/hip | 3.3.2 | P1 | Notes textarea is correctly labelled (`page.tsx:359-366`, `htmlFor="hip-check-notes"`) — no finding. Score value change is not announced: tapping "4" updates a `<span>` at `:279` outside any live region. | `aria-live="polite"` on the value span, or the range fix |
| /session (16,17,18) | 1.3.1 | P0 | Zero headings on all three session captures. §2.3 | |
| / | 2.4.3 | P1 | Proposal "You look ready to leave reintro" — Accept unmounts the focused button. §2.6 | |
| /intake (19) | 1.3.1 | P1 | h1=0 on this persona's intake capture (other personas emit h1). State-dependent heading loss inside `IntakeClient.tsx`. | Emit the step h1 unconditionally |
| /coach | — | — | Route is a 404 (`<h1>404</h1>`, Next.js default). `/coach` was removed in the 2026-08-19 IA restructure; the persona bundle still tours it. Harness staleness, not an app bug → flag to whoever owns `run-app-audit.sh`. |
| red/amber banner | 1.4.1 / 1.4.3 | — | No colour-alone finding: `RestDayCard`/`RetestReminder` pair tint with a `border-l-4` stripe **and** a text label. Computed `amber #e0a63a` on `amber/10` = **7.63:1**, `red-strong #f28068` on `red/20` = **5.77:1**, `text-muted` on `amber/10` = **5.70:1**. All pass. The 2026-08-19 P1-59 fix held. |

### persona-strength (5/3/1 anterior-hip, day 30)

| Route | SC | Sev | Finding | Fix |
|---|---|---|---|---|
| /session (17) | 1.3.1 | P0 | Zero headings. §2.3 | |
| /session (16) | 1.4.3 | P0 | Full set flow reached — `SetView.tsx` 9 px `text-line` captions at 2.68:1. §2.1 | |
| Rest takeover | 2.4.3 / 4.1.2 / 2.1.2 | P0 | Effort picker: no ARIA state (§2.7), focus destroyed on select (§2.6), "Jump to" sheet has no focus trap or Escape (§2.9). All three shipped 2026-09-01. | |
| Rest takeover | 2.5.8 | — | Four buttons at ~74×66 CSS px on 393 px (393 − 44 page − 28 card − 24 gaps, /4). Passes 2.5.8 AA (24×24) and the 44×44 AAA bar. Ergonomics → see app-audit-N-mobile-ux. |
| Rest takeover | 2.2.1 | — | Auto-advance at zero is a real-time exercise timer; `+30s` satisfies "extend". No finding. There is no *pause* — note only. |
| / | 4.1.2 | P1 | `workout/ProposalCard.tsx:35` sets `aria-labelledby={proposal-${id}}` but the `<h2>` carrying that id is conditional on `eyebrow` (`:45-46`). When `eyebrow` is empty the IDREF dangles → the `<section>` has no accessible name and silently stops being a region. | Fall back to `aria-label={proposal.title}` when `eyebrow` is falsy |
| /report | — | — | The duplicate `<h1>Training summary</h1>` in the capture is `hidden print:block` (`report/page.tsx:215`) → `display:none`, not in the a11y tree. **False positive — no finding.** The 2026-08-21 P0 crash on `/report` and `/progress` is resolved: both render `<main>` + `<h1>` on all 21 personas. |

### persona-erratic (concurrent, day 45, skipped + dismissed)

| Route | SC | Sev | Finding | Fix |
|---|---|---|---|---|
| /session (16,17) | 1.3.1 | P0 | Zero headings. §2.3 | |
| /record | 1.3.1 | P1 | h1 → h3. Sparse heatmap: `WeeklyHeatmap.tsx:189` builds `"Week of X: N done, N amber, N red, N rest, N missed"` — correct alt text, and it degrades honestly on sparse data. No finding. | |
| / | 4.1.2 | P1 | Dismissed-proposal state renders `StatusPill` "Ignored" as a live region. §2.4 | |
| /history | 1.3.1 | — | h1 + 5×h2, clean. No findings. |
| /guide, /legal/*, /settings, /account, /profile, /evidence(-127) | — | — | No route-unique findings beyond §2.4. |

---

## 4. Contrast ratio table (palette, `globals.css:9-77`)

| Token | Hex | vs `ground` #0e0f12 | vs `surface` #16181c | vs `surface-2` #20232a | Role | Pass @ AA |
|---|---|---|---|---|---|---|
| `ink` | #d6d9de | 13.54 | 12.56 | 11.11 | body | yes |
| `strong` | #f4f5f7 | 17.57 | 16.29 | 14.42 | headings | yes |
| `muted` | #93989f | 6.60 | 6.12 | 5.42 | body-secondary | yes |
| **`line` (as text)** | **#5f6570** | **3.27** | **3.03** | **2.68** | **caption text — 26 sites** | **NO (§2.1)** |
| `line` (as border) | #5f6570 | 3.27 | 3.03 | 2.68 | boundary | yes on ground/surface; **no on surface-2** (1.4.11) |
| `line-strong` | #6b717d | 3.91 | 3.63 | 3.21 | focusable boundary | yes (3:1) |
| `line-soft` | #24272f | 1.28 | 1.19 | — | decorative divider only | n/a |
| `green` | #5fb37a | 7.50 | 6.95 | 6.15 | state | yes |
| `amber` | #e0a63a | 8.84 | 8.20 | 7.25 | state | yes |
| `amber-strong` | #f0b854 | 10.67 | 9.89 | 8.75 | on-tint | yes |
| `red` | #e5654b | 5.74 | 5.33 | 4.71 | state | yes |
| `red-strong` | #f28068 | 7.36 | 6.82 | 6.04 | on-tint | yes |
| `bronze` | #c89666 | 7.31 | 6.78 | 6.00 | CTA / focus ring | yes (ring 7.31 ≫ 3:1) |
| `bronze-hi` | #e2b686 | 10.28 | 9.54 | 8.44 | on-tint | yes |
| `slate` | #79b8c4 | 8.64 | 8.01 | 7.09 | link / accent | yes |
| `lat-left` | #4a8894 | 4.78 | 4.44 | **3.92** | laterality label | **no on surface / surface-2** |
| `lat-right` | #a279a8 | 5.33 | 4.94 | **4.37** | laterality label | **no on surface-2** |
| `dv-bar-mid` | #7c8493 | 5.09 | 4.72 | 4.18 | chart bar (non-text) | yes @ 3:1 |
| `dv-bar-low` | #5f6570 | 3.27 | 3.03 | 2.68 | chart bar (non-text) | marginal — 2.68 on surface-2 fails 1.4.11 |
| `dv-retest-back` | #d9a86b | 8.91 | 8.26 | 7.31 | chart | yes |
| `dv-retest-hit` | #6bb885 | 8.05 | 7.46 | 6.61 | chart | yes |

Tint composites (alpha-blended over `ground`): `amber/10` → #231e16, amber text on it **7.63**;
`red/20` → #39201d, `red-strong` on it **5.77**; `bronze/10` → #211c1a, bronze on it **6.43**;
`rgba(200,150,102,.14)` (RestTakeover selected effort) → #28221e, bronze on it **5.99**;
`slate/[0.08]` → #171d20, slate on it **7.68**. `bg-bronze` + `text-ground` **7.31**;
`bg-slate` + `text-surface` **8.01**. All pass.

**Verdict on palette:** the warm-dark tokens themselves are in good shape — the 2026-08-19
and Batch-36 remediations held. Every remaining 1.4.3 failure is a *misuse* of a
non-text token as text (`line`) or a `surface-2` regression on `lat-*`.

---

## 5. Charts & data-viz

**Heatmap** (`next-app/src/components/charts/Heatmap.tsx:136-137`): `role="img"` +
`aria-label="Activity heatmap for the last N weeks: X strength days, Y active days total"`.
Correct. The per-cell `aria-label={cellAria(c)}` at `:167` is dead code — descendants of
`role="img"` are pruned from the accessibility tree — but harmless; the `:181-186` comment
already acknowledges the trade. **No finding.**

**Sparkline** (`charts/Sparkline.tsx:101-103`): opt-in — `aria-hidden` by default, promotes
to `role="img" aria-label` when a caller supplies `ariaLabel`. The right default for a
decorative trendline. **No finding**, but verify each call site that renders a *load-bearing*
sparkline passes `ariaLabel`.

**SymptomLoadChart** (`charts/SymptomLoadChart.tsx:108,177`): `role="img"` with a computed
`summary` **and** a real `<table>` fallback at `:177`. This is the best chart treatment in the
app and the model the others should copy.

**WeeklyHeatmap** (`components/ui/WeeklyHeatmap.tsx:189`): builds
`"Week of {date}: N done, N amber, N red, N rest, N missed"`. Correct, and honest on the
sparse `persona-erratic` data.

**Cut C program curve — P1 gap.** `components/record/CutCProgramCurveCard.tsx:137-145`
mounts `_CutCRechartsInner` (`ResponsiveContainer` → `LineChart`, `:59-130`) inside a bare
`<div style={{height:200}}>`. **No `role="img"`, no `aria-label`, no data table, no text
summary.** Recharts emits an untitled `<svg class="recharts-surface">`; NVDA reads nothing.
The visible legend at `:151-157` marks its swatches `aria-hidden` but the swatch *text*
survives, so an SR user hears "30-day rolling avg, retest event" with no data. The delta
callout below (`:175+`) partially rescues it. WCAG 1.1.1 (A). Not observed rendered in the
2026-09-01 captures (no persona had ≥2 retest readings for a single metric), which is why
it survived the 2026-08-21 pass.
**Fix:** `<div role="img" aria-label={summary} style={{height:200}}>` where `summary` is
built from the values already computed at `:126-131` —
`` `${metric.display_name}, ${ROLLING_WINDOW_DAYS[zoomTier]}-day rolling average over ${points.length} readings: ${firstAvg} to ${currentAvg} ${metric.unit}, ${deltaSign}${deltaAbs}.` ``
Same treatment for `CutCRetestTimeline.tsx` and `CutCActivityHeatmap.tsx`.

**ArcProgressBar** (`components/ui/ArcProgressBar.tsx`): no `role`/`aria-*` found. If it
carries the only representation of a completion figure, it needs `role="progressbar"` +
`aria-valuenow`/`aria-valuetext` or an adjacent text twin. P2 — verify the numeric is
rendered as text nearby before acting.

---

## 6. Forms

**Rest-day activity log — `RunSlotCard.tsx` (new on `/session` as of 2026-08-30).**
- Labels: numeric fields are wrapped `<label>` with visible text above the input
  (`:446-459`, `:511-538`, `:587-611`) — correct, persistent, not placeholder-only.
  `:477`/`:490` use `aria-label="Minutes"`/`"Seconds"` for the split pair — acceptable.
  **The notes `<textarea>` at `:621-627` has no label at all — placeholder-only**
  ("Optional note — WOD name, felt like…"). WCAG 3.3.2 (A) + 4.1.2 (A). P1.
- Three chip groups have no group name (§2.5). P1.
- Error identification: `:694-696` GPX import failure is a bare `<p className="text-red">`,
  not announced (§2.10). P1.
- Icon-only controls are named: `:325` `aria-label="Warm-up + cool-down"`,
  `:374` `aria-label="Remove logged session"`. Correct — though N identical
  "Remove logged session" buttons in a list are ambiguous out of context; append the
  activity name. P2 (2.4.6).
- `<input type="file" aria-hidden>` at `:685-692` also carries `className="hidden"`
  (`display:none`) so it is not focusable — **not** an aria-hidden-on-interactive
  violation. No finding.
- Section name mismatch: `aria-label="Extra session slot"` (`:313`) vs visible
  "Log extra session" (`:319`). P2 (2.4.6).

**Set logging — `SetRow.tsx`, `SetView.tsx`.** Inputs at `SetRow.tsx:83,111,127,176` all carry
`focus:ring-2 focus:ring-bronze focus:border-bronze` and `placeholder:text-muted`. Labels
come from the grid column headers, which are not programmatically associated. Verify each
input has `aria-label` or `aria-labelledby` pointing at its column header — not confirmed in
this pass; treat as an open question rather than a finding.

**Morning check — `check/page.tsx`.** Three named regions
(`<section aria-labelledby="check-regions">` `:300`, `"check-flags"` `:320`,
`"check-context"` `:354`), textarea labelled via `htmlFor="outside-training"` `:378-379`,
sticky CTA with `focus-visible:outline-strong` `:403`. **Clean — no findings.** This is the
form the rest of the app should be measured against.

**Hip check — `check/hip/page.tsx`.** Notes labelled correctly (`:359-366`). Score entry
fails §2.5 and does not announce value changes.

**Onboarding — `OnboardingRunner.tsx:100-101,73`.** `role="dialog" aria-modal="true"` with
`useFocusTrap(panelRef, dismiss, active)` — Escape closes, focus trapped, "Skip setup" at
`:132` is a real `<button>`. **No findings.**

**Intake — `IntakeClient.tsx`.** `role="alert"` on the validation block (`:1209`), per-step
`aria-live` announcement (`:136`, `:809` — scoped to the heading, not the whole body, which
is the right call), bottom nav suppressed during the flow (`BottomNav.tsx:44`) with a
documented escape hatch. Strong. Only gap: `persona-recover:/intake` captured h1=0.

---

## 7. Priorities

**P0 (blocking):**
- 1.4.3 — replace `text-line` with `text-muted` at 26 sites; worst is 2.68:1 at 9 px.
  `session/RestTakeover.tsx:181,190,201,231,256,290`, `session/SetView.tsx`,
  `session/BriefView.tsx`, `session/OffPlanSheet.tsx`, `session/OverflowSheet.tsx`,
  `workout/SetRow.tsx`, `offplan/OffPlanSession.tsx:305`. (§2.1)
- 1.3.1/2.4.6 — emit an `<h1>` on the `/session/[slug]` rest-day branch;
  `session/DaySession.tsx:173-187`, `session/shared/StatusCards.tsx:92`. Fires on all four
  new personas and three legacy ones. (§2.3)
- 1.3.1/4.1.2 — name the score-button group on the rehab symptom form;
  `app/check/hip/page.tsx:288-303`. (§2.5)
- 2.4.3 — stop unmounting the focused button; `session/RestTakeover.tsx:159-165,210`,
  `ui/ProposalCard.tsx:130-155`. (§2.6)
- 4.1.2 — `aria-pressed` (or `role="radio"`) on the four effort buttons;
  `session/RestTakeover.tsx:216-236`. Shipped today with no ARIA state. (§2.7)

**P1 (this month):**
- 2.4.2 — per-route `<title>`; `app/layout.tsx` template + `generateMetadata` on
  `/session/[slug]`. Open since 2026-08-17. (§2.2)
- 4.1.2 — invert `StatusPill`'s `aria-live` default to opt-in;
  `ui/StatusPill.tsx:91`. Kills 127 live regions on `/evidence`. (§2.4)
- 1.1.1 — `role="img" aria-label` on the Cut C Recharts curve;
  `record/CutCProgramCurveCard.tsx:137-145`. (§5)
- 3.3.2 — label the activity-log textarea; `workout/RunSlotCard.tsx:621`. (§6)
- 1.3.1/4.1.2 — name the three `RunSlotCard` chip groups; `:386,542,568`. (§2.5)
- 3.3.1/4.1.3 — `role="alert"` + `aria-invalid` on the 5 unannounced error sites.  (§2.10)
- 2.1.2/2.4.3 — replace the hand-rolled "Jump to" dialog with `BottomSheet`;
  `session/RestTakeover.tsx:301-338`. Add `role="dialog"` + focus trap to the takeover root
  at `:171`. (§2.9)
- 4.1.2 — dangling `aria-labelledby` when `eyebrow` is empty;
  `workout/ProposalCard.tsx:35,45`.
- 1.3.1 — h1→h3 skip on `/record`; `app/record/page.tsx`. (§2.8)
- 1.4.3 — `lat-left` #4a8894 (3.92:1) and `lat-right` #a279a8 (4.37:1) fail on `surface-2`.
  Lighten both ~8%.

**P2 (nice to have):**
- 2.4.6 — duplicate h1/h2 program name on `/` for `persona-muscleup`,
  `persona-pullup-fast`; `session/shared/StatusCards.tsx:348`.
- 1.3.1 — emit `<section aria-label="Today's signals">` unconditionally so landmark
  navigation is state-independent (`persona-muscleup:/` has zero sections).
- 2.4.6 — align `RunSlotCard`'s `aria-label="Extra session slot"` with the visible
  "Log extra session"; disambiguate the N× "Remove logged session" buttons.
- 2.4.7 — `AppShell.tsx:175` puts `focus:outline-none` on `<main tabindex="-1">`, so the
  skip link lands the user with no visible confirmation. Swap for a 2 px inset ring on
  `:focus-visible` only.
- 4.1.2 — `role="progressbar"` + `aria-valuetext` on `ui/ArcProgressBar.tsx` if the figure
  is not already rendered as adjacent text.
- 3.3.2 — `ScoreSlider` as a native `<input type="range" aria-valuetext>`: 11 tab stops → 1,
  and the value announces on change.
- 3.1.1 — `<html lang="en">` is correct (`app/layout.tsx:66`). Estonian clinical terms
  (FADIR, iliopsoas) appear only in `/evidence` and `/guide` body copy; a `<abbr title>` or
  inline gloss would help, but no `lang` switch is warranted for loanword terminology.
  Nudge, not a fail.

**Out of scope, flagged and deferred:**
- Four-across RPE picker ergonomics at 393 px (74 px wide targets — WCAG 2.5.8 passes)
  → see app-audit-N-mobile-ux.
- "Extra session slot" / "Log extra session" naming and rest-day copy tone
  → see app-audit-N-copy-clarity.
- `prefers-reduced-motion` is enforced globally at `globals.css:225-233` (route-in,
  pulse-accept, mark-done-flash, `button:active` transform all disabled) and 20 components
  carry `motion-reduce:` twins. The only ungated animation is Tailwind `animate-pulse` on
  skeletons, which is opacity-only and does not trip 2.3.3. **No WCAG finding** —
  motion craft → see app-audit-N-motion-perf.
- Stale `/coach` (404) tour step in the three legacy persona bundles → harness maintenance,
  `dev/scripts/run-app-audit.sh`.
