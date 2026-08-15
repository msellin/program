# Naming Round 4 — Agent 2: Acronym-Slogan (BYD pattern)

The pattern: the brand name is the initials of a short slogan the product actually keeps. BYD = "Build Your Dreams." The acronym must read like a plausible English word or brand syllable; the slogan words must be real promises grounded in what the app does, not filler.

## Prior rounds — patterns already tried (so this round doesn't retread)

- **Round 1 (positioning / feel / verb):** Sharpen, Hone, Whet, Edge, Prime, Dial, Tune, Notch — single English verbs/nouns. No acronyms.
- **Round 2 (Sharpen-family + CrossFit vocab):** Lock, Rig, PR-adjacent slang. Still single words.
- **Round 3 (Estonian-first / bilingual-native):** Lihv, Sätt, Serv, Fookus. Single words in a second language.
- **None of these rounds proposed an acronym-slogan.** The BYD lane is unclaimed.

## Step 2 — What this app actually promises (audit)

Grounded bullets, each cited to a file. This is the raw material the slogans have to draw from.

1. **The plan changes every session, not every cycle.** Coaches revise every two weeks; template apps revise never. Terav proposes an adjustment against yesterday's log every day. — `landing/src/i18n/dictionaries/en.ts:33` ("Every session, against your log"), `landing/src/components/sections/ThreeWayContrast.tsx`
2. **The engine proposes; the user accepts or ignores. No silent mutation.** Confirm-first is a hard rule. — `landing/src/i18n/dictionaries/en.ts:43` ("You log a note. Engine proposes. You Accept or Ignore"), memory `feedback_confirm-first.md`
3. **Programs are cited — 100+ primary studies, named on the session.** Schumann 2022, Shea & Morgan 1979 appear in Today's UI. — `next-app/src/app/page.tsx:194,229`, `landing/src/i18n/dictionaries/en.ts:62`
4. **Retest gates progression.** Every program declares a retest and a cadence; TM only moves when the cycle-end evaluation clears. — `manifest.json` `retest` field on every program, `next-app/src/lib/engine/adapt.ts:48-186` (`evaluateCycleEnd`)
5. **Symptom score derives a green/amber/red state that drives load.** A red day drops the next TM 10%. Symptoms are first-class, not a mood tag. — `next-app/src/lib/engine/adapt.ts:82-156`, `CLAUDE.md` progression_rules
6. **Provocative positions are blocked until phase gates open.** The rehab program refuses to prescribe hanging knee raises, L-sits, Copenhagen planks until the user's own answers clear specific gates. — `CLAUDE.md` hard constraints, `data/clinical-context.json.provocative_positions`
7. **Personalisation is on the user's weakness, not their comfort zone.** Every program declares a `weakness_target`. The catalog is keyed on it. — `next-app/public/data/programs/manifest.json` (`weakness_target` on every entry)
8. **A gap of 14+ days triggers a calibration mini-cycle, not a "welcome back" streak notification.** Non-punitive. — `next-app/src/lib/engine/adapt.ts:202-236` (`detectPauseResume`), landing "Not a streak game" `en.ts:73-74`

Those eight promises are the vocabulary the slogans below are built from: **Log · Adapt · Retest / Propose · Accept / Cited · Every session / Weakness · Gate**.

## Step 3 — Acronym-slogan candidates

Format: **NAME — Slogan Slogan Slogan.** Rationale · Domain guess · Risk.

### 1. **LARC — Log, Adapt, Retest, Confirm.**
- The full four-step engine loop in one word. Log ties to `page.tsx` daily log; Adapt to `adapt.ts`; Retest to the `retest` field on every manifest entry; Confirm to the confirm-first rule. `.com` — check needed (some architectural firms; probably clear in fitness). Risk: reads slightly clinical; some may hear "lark" (bird).
- App URL: `app.larc.fit` reads clean. Marketing `larc.com`.

### 2. **CARL — Cited, Adaptive, Retested, Logged.**
- Every session card cites its study; the engine adapts against yesterday's log; the program only advances at a retest. A memorable four-letter name that scans as a person — like Whoop scans as a sound. `.com` almost certainly taken (common first name); `.fit` and `.app` plausible — check needed. Risk: name-collision (millions of Carls); shortlist only if we can secure the URL.

### 3. **RAPT — Retest, Adapt, Propose, Then-you-accept.**
- "Rapt" is a real English adjective (deeply focused). Retest gates every phase change; Adapt runs on every session; Propose-then-Accept is the confirm-first pattern verbatim. Reads as "focused attention" which is on-brand. Domain: `rapt.com` likely taken by a wellness/media brand — check needed. `rapt.fit` plausible. Risk: possible trademark conflict; "rapture" religious echo for some.

### 4. **PACE — Propose, Accept, Cite, Evaluate.**
- Four moves the app makes on every session, in order. Propose is `adapt.ts`; Accept is the user's tap; Cite is the study line under the block; Evaluate is `evaluateCycleEnd`. And "pace" is already a training word — a rare case where the acronym reinforces the domain instead of fighting it. `.com` heavily taken (Pace watches, Pace Salsa); brand `pace.fit` viable but crowded. Risk: SEO buried under Pace University, Pace watches; competitor `runna.com` already owns "pace" adjacency in running.

### 5. **REPS — Retest, Evidence, Propose, Sharpen.**
- Every word cites a real capability. But "reps" already means repetitions — that's the risk AND the reinforcement. On the box wall "I'm on Reps this cycle" is confusing. Better read as reinforcement of the domain than as a name. Domain: `.com` gone; `reps.fit` maybe. Risk: dictionary word in the exact domain — likely disqualifying for SEO.

### 6. **PROV — Propose, Retest, Observe, Verify.**
- The four gates any TM change passes through in `adapt.ts:evaluateCycleEnd` — propose a bump, observe the AMRAP and symptom state, verify against the target, only then apply. "Prov" reads as short for "prove" or "proof" — the evidence claim in three letters. Domain: `.com` check needed; `prov.fit` clean. Risk: reads a bit dry; may be mistaken for Providence / provisional.

### 7. **KEEL — Keep-going, Evidence, Every-session, Log.**
- "Keel" is a boat term — the thing that keeps you upright when everything else pitches. Ties to the "not a streak game, skip a week, the plan sharpens against that too" promise (`en.ts:73`). "Keep-going" is the non-punitive resume behaviour in `detectPauseResume`. Domain: `keel.com` likely taken; `keel.fit` unusual and available-ish — check needed. Risk: nautical metaphor might feel off-brand for barbell athletes.

### 8. **HELM — Honest, Evidence-led, Log-driven, Measured.**
- Founder-tone words. Honest = "not certain about you" `en.ts:70`; Evidence-led = every session cites; Log-driven = the engine reads yesterday's log; Measured = retest gates. "Helm" reads as leadership without arrogance. Domain: `helm.com` taken (Helm charts, Helm shoes); `helm.fit` viable. Risk: Helm is a well-known DevOps tool — collides in tech-adjacent SERP.

### 9. **CRUX — Cite, Retest, Under-load, eXperiment.**
- "Crux" is climber vocab for the hardest move in a route — the weakness that determines the send. Directly maps to the app's `weakness_target` field. Cite/Retest are real; "Under-load" is the phase-gated progressive-loading rule; "eXperiment" gestures at the confirm-first proposal. Domain: `crux.com` taken; `crux.fit` viable. Risk: X-forcing the last word is the classic acronym cheat — honest to flag.

### 10. **NEXT — Note, Evaluate, eXecute, Track.**
- The daily loop from the user's point of view: note your symptoms, the engine evaluates, you execute the session, the log tracks. Reads as forward motion. "eXecute" is a slight cheat but survives read-aloud. Domain: `.com` obviously taken by everything; likely disqualified before we start. Risk: SEO impossible; only listed for completeness.

### 11. **ARC — Adapt, Retest, Cite.**
- Three letters, three promises, all real. Every program is an arc (the manifest calls the Anterior Hip program "a 12-month strength arc"). Reads as a shape, not a bird or a person. Domain: `arc.com` gone (Arc browser); `arc.fit` almost certainly gone. Risk: Arc browser is loud right now; will bury SEO for years.

### 12. **LARK — Log, Adapt, Retest, Keep-going.**
- Four verbs, four files: `page.tsx` log, `adapt.ts`, retest fields, `detectPauseResume`. "Lark" is a whimsical English word — undermines seriousness for a rehab audience. But it's memorable and pronounceable everywhere. Domain: `lark.com` gone (medical AI); `lark.fit` maybe. Risk: Lark Health is a real telehealth brand — direct collision in adjacent-medical space.

### 13. **HONE — Honest, One-session-ahead, Numbered (cited), Evidence-led.**
- Rescues Round 1's "Hone" (three agents shortlisted it) by making it BYD-style. Honest = won't-do promises; One-session-ahead = the adaptive engine; Numbered = every session is cited to a numbered study; Evidence-led = the whole claim stack. Domain: `hone.com` taken (leadership coaching); check needed on `.fit`. Risk: Round 1 already flagged Hone as taken; the acronym doesn't change that.

## Slogan-first candidates (the slogan carries even before the acronym lands)

### S1. **"Log. Propose. Accept." — LPA / Terav**
The three-beat rhythm captures confirm-first exactly. Even if we keep Terav as the mark, this is a memorable permanent tagline that also generates a monogram. Rationale: `adapt.ts` produces the proposal; `useStore` accepts; `page.tsx` logs.

### S2. **"Every session, against your log." — ESAYL**
Already the app's most-quoted claim (`en.ts:33` in the contrast table). It's the one line that separates the product from templates AND from trainers in the same breath. The acronym doesn't say much ("ESAYL" isn't a word) but the slogan itself is a brand.

### S3. **"Cited. Retested. Yours." — CRY**
The three defensible claims in one line: cited (100+ studies), retested (progression gates), yours (personalisation on your weakness). CRY is a bad word to shout in a gym — but the slogan alone, minus the acronym, is strong enough to run as tagline under a different name (e.g. under Sharpen or Terav).

## Shortlist — top 3 acronym-slogan picks

1. **RAPT — Retest, Adapt, Propose, Then-you-accept.** Best combination of real English word, on-brand meaning ("rapt attention" = the user reading the day's cited plan), and exact mapping to the engine loop. Domain risk is real; if `rapt.fit` or `rapt.app` clears, this is the one to push.
2. **LARC — Log, Adapt, Retest, Confirm.** Cleanest four-letter loop that reads as a proper noun. Less crowded than RAPT. Weakness is meaning — "larc" doesn't evoke anything on its own; the slogan carries the whole load.
3. **CRUX — Cite, Retest, Under-load, eXperiment.** Only pick where the acronym-word (`crux` = weakness) reinforces the product's most differentiated feature (`weakness_target`). The X-cheat is the honest cost.

## Cheque pick

If I had to ship one today: **RAPT**, on `rapt.fit` (app) with the marketing slogan "Retest. Adapt. Propose. Then you accept." spelled out on the hero. It reads as a real word, it names the four things the app actually does in the order it does them, and — unlike Sharpen — the tagline itself trains the user on how to use the product on first read. Second pick if `rapt` doesn't clear: **CRUX**, because the acronym-word is the product's defining concept and no other candidate in any round achieves that alignment.

## Notes on domains

None of these were network-verified. Priority order for a domain sweep:
`rapt.fit`, `rapt.app`, `larc.fit`, `larc.app`, `crux.fit`, `prov.fit`, `keel.fit`. Skip `.com` for anything already a common English word — cost and SEO will hurt more than a `.fit` TLD.
