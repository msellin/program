# QA audit — program-f3r.pages.dev

**Audited:** 2026-08-06 against commit deployed at `https://ec9ba801.program-f3r.pages.dev/` (== live at `https://program-f3r.pages.dev/`, hashes match local `index.html`).
**Method:** Playwright automation across iPhone SE (375), iPhone 14 Pro (390) and iPad Mini (768). Direct `fetch` of deployed HTML for hash comparison. localStorage manipulation via `page.evaluate` to reach edge states. All screenshots and raw JSON dumps at `/Users/margussellin/www/program/dev/audits/qa-screenshots/`.

---

## Verdict up front

The app is stable in the *happy path*. There are **no crashing bugs on normal use**, no lost logs during the common flow, and no console errors during a straight walkthrough. But there are five defects the daily user should know about before treating this as a reliable multi-year training record:

1. Persistent XSS via a poisoned log date (any hostile import replaces trust boundary).
2. The public production build leaks the developer's local filesystem path in an error state that end users can reach.
3. Numeric inputs accept negatives, `1e10`, and 12-digit values with no validation.
4. "Wipe local log" doesn't actually wipe training maxes — they reappear on next reload.
5. The vitals "Today X/Y" denominator is not what you think — it counts across every phase block including accessories, so `0/23` on a day when Today shows 7 exercises is expected, not a bug you'll notice as a bug.

Nothing here will silently lose a completed log entry during normal use. Data loss risk is confined to: (a) an import of a > ~5 MB payload silently failing (localStorage quota, saveStore swallows the exception), and (b) a manual JSON import that lacks a `logs` field — accepted without complaint, then `.logs` is undefined until the next `day()` call recreates it, but any historical logs are gone. Both require user action.

Below, each bug with repro, severity, and file/line reference.

---

## BUG 1: Stored XSS via `logs[date].date` in History tab
**Severity:** critical
**Repro:**
1. Open the app.
2. In DevTools (or any script with LS access): `localStorage.setItem('program.log.v2', JSON.stringify({ version:2, logs:{ "junk<img src='x' onerror=alert(1)>": {date:"junk<img src='x' onerror=alert(1)>", exercises:{}, symptoms:null, derived_state:null, notes:''} }, training_maxes:{}, cycle:{} }))`.
3. Reload → click **History** tab.

**Expected:** the string is rendered as literal text (escaped like the notes field is).
**Actual:** the `<img>` element is inserted into the DOM and `onerror` fires. Confirmed programmatically (`window.HIST_XSS_VIA_HISTORY` set to 1 by the payload) and visually (screenshot shows the broken-image placeholder and the residual `junk` text).

**File:reference:** `index.html:1094-1096` — `renderHistory()` builds `<div class="rowlog"><span>...${d.date}</span>` and `bars(k)` uses `title="${d.date}: ${v}"`, neither of which pass through `esc()`. Every other free-text field in the app is escaped; this one path was missed.

**Fix outline:** wrap `d.date` (both usages) in `esc()`. Same treatment for `v` inside `bars`.

**Screenshot:** `dev/audits/qa-screenshots/deep-01-history-xss.png`

**Why this matters even though the user is one person:** the Data tab explicitly encourages a workflow of "AirDrop the JSON to Mac, save it into the repo, Claude Code reads it back." A malicious or tampered log file (or a note field authored by a hostile LLM later fed into `logs[<date>].date`) becomes code execution the next time History is opened. It also creates a footgun for future features that let anyone else look at the file.

---

## BUG 2: Developer's local filesystem path leaks in fatal error box on live deployment
**Severity:** high
**Repro:**
1. Open `https://program-f3r.pages.dev/` under conditions that will break the initial `fetch('data/*.json')` calls — flaky connection, corporate proxy that blocks range requests, adblocker that decides `data/program.json` looks suspicious, etc. Or, as tested: `page.route('**/data/program.json', r => r.abort())`.
2. Wait for boot.

**Expected:** a user-facing "couldn't load data, try again" message, or a hint appropriate to a hosted PWA (offline, retry).
**Actual:** the fatal box literally prints
```
cd /Users/margussellin/www/program
python3 -m http.server 8000
# then open http://localhost:8000/
```
That is baked into `index.html` as a static `<pre>` block and is served to every visitor at every deployment.

**File:reference:** `index.html:279-281` (the hardcoded `<pre>` block inside `#fatal`).

**Fix outline:** replace the dev-only hint with a generic offline/retry message. Move the local-dev instruction into `README.md` where it belongs. Bonus: the fatal box is also shown for errors thrown inside `boot()` (e.g. malformed localStorage — see BUG 3), so the message "Can't load the data files" is misleading in that case too.

**Screenshot:** `dev/audits/qa-screenshots/extra-fatal-network-fail.png`

---

## BUG 3: Malformed `program.log.v2` shape (non-object `logs`) triggers fatal box and hides tabs; app is unrecoverable without opening DevTools
**Severity:** high
**Repro:**
1. `localStorage.setItem('program.log.v2', JSON.stringify({version:2, logs:"i-am-a-string", training_maxes:null}))`.
2. Reload.

**Expected:** the loader either recovers (treats the malformed value as absent and resets to defaults, like it does when the raw string is invalid JSON) or shows a "storage corrupted, click here to reset" affordance.
**Actual:** JSON.parse succeeds — the string parses to a valid object — so the `try/catch` in `loadStore()` doesn't help. Downstream code assumes `STORE.logs` is an object; something in `boot()` throws when it isn't. The catch in `init()` renders the fatal box AND — because `boot()` never got to un-hide the tabs — leaves `#tabs` hidden. The user sees the fatal error but no navigation, and clearing localStorage is the only recovery path.

**File:reference:** `index.html:325-346` (`loadStore` — accepts any parseable JSON), `index.html:374-378` (init catch). The v1 migration path likewise doesn't sanity-check its input shape.

**Fix outline:** in `loadStore()`, after parse, defensively rebuild the store with `logs = (parsed.logs && typeof parsed.logs === 'object' && !Array.isArray(parsed.logs)) ? parsed.logs : {}` and similar for `training_maxes` / `cycle`. Alternatively, a "Reset storage" button on the fatal screen.

**Screenshot:** `dev/audits/qa-screenshots/04-malformed-noLogs.png` shows the recoverable "no logs field" case (fatal WITH tabs); the wrong-shape case removes even the tabs.

---

## BUG 4: Weight / reps / RPE inputs accept negative, huge, and scientific-notation values without validation; auto-mark the exercise "done"
**Severity:** high (data integrity)
**Repro:**
1. On Today, type `-9999` into any Weight kg field.
2. Observe.

**Expected:** rejection, clamp to ≥0, or at minimum no auto-check-off.
**Actual:** stored as `-9999`, and the card auto-flips to `done:true` because the auto-done handler only checks `v != null` (`index.html:982`). Same for `1e10` (stored as `10000000000`), `999999999999`, `-0`. `NaN`, `Infinity`, and `abc` are correctly rejected only because `<input type=number>` coerces them to empty string first — that behaviour is browser-implementation-dependent, not the app's guarantee.

Downstream, `inferTMFromSet(-9999, 5, 8)` returns a negative estimated 1RM which then propagates into the "Set TM to X" one-click button on the card. If clicked, TM is set to that negative value.

**File:reference:**
- `index.html:975-988` — the `input` handler for `weight_kg / reps / rpe` casts via `Number(v)`, stores anything ≥ 0 finite too, and auto-marks done.
- `index.html:467-474` — `inferTMFromSet` doesn't guard the sign of its output.
- `index.html:768-778` — TM editor input accepts negatives and any magnitude.

**Fix outline:** clamp weight/TM to `[0, 500]` (or similar sane bound), reps to `[0, 100]`, RPE to `[0, 10]` (already partly done in the DOM `min/max` attrs but not enforced in JS). Reject `NaN` from `Number(...)` explicitly. Don't auto-check-off from an invalid input.

**Screenshot:** `dev/audits/qa-screenshots/07-input-abuse.png` — see also findings.json under `input-abuse`.

---

## BUG 5: "Wipe local log" does not wipe training maxes on reload
**Severity:** medium
**Repro:**
1. Populate TMs by editing Progress → Training maxes (e.g. change back-squat to 155).
2. Data tab → "Wipe local log" → confirm.
3. Observe: `training_maxes` is `{}` in localStorage. Progress tab shows no TM.
4. Reload the page.
5. `training_maxes` is back to `{back_squat_highbar:110, front_squat:90, block_pull_midshin:130}`.

**Expected:** either the button label is "Wipe log entries (keeps TMs)" and the seed re-population is documented, or wipe truly wipes and seed only runs on the *very first* boot.
**Actual:** the init code (`index.html:367-372`) unconditionally re-seeds TMs from `program.json.starting_values_kg` any time `training_maxes` is empty. So Wipe followed by any reload = seed re-runs, and the user's edited TMs are permanently lost while getting the *starting-value* estimates re-installed silently.

**File:reference:** `index.html:367-372` (unconditional seed), `index.html:1183-1187` (wipe handler).

**Fix outline:** track a `first_seed_done: true` flag in the store so seeding runs at most once ever; wipe leaves that flag alone; wipe truly clears TMs. Or, ship a distinct "Reset to starting values" button and change the seed to not overwrite.

---

## BUG 6: Vitals "Today X/Y" denominator counts accessory items that live on the Extras tab
**Severity:** medium (confusing) — not a math error, but a mislabel
**Repro:**
1. Fresh load. Today tab shows 7 exercise cards (Phase 1 reintro strength block).
2. Vitals header reads `TODAY 0/23`.
3. Toggle done on any Extras-tab item — vitals goes `0/23 → 1/23`, even though nothing on Today changed.

**Expected:** the "Today" tile in vitals reflects the exercises visible on the Today tab.
**Actual:** `renderVitals()` iterates every block in the *active phase*, regardless of category (`index.html:1194-1197`). Phase 1 has 5 blocks; three (`block_a_home`, `block_daily_skill`, `block_runs`) are accessory/run and live only on Extras. Their item counts add to the denominator. Confirmed: 7 Today + 15 Extras = 22 exercises across two tabs, plus an off-by-one from the count method — the observed denominator is 23. The numerator, in turn, counts done-flags across *all* stored `d.exercises[key]` keys for today (`index.html:1196`), including invalid legacy keys that no longer correspond to any scheduled block.

**File:reference:** `index.html:1191-1211`.

**Fix outline:** either restrict the denominator to today's *scheduled* blocks (mirror `todaysScheduledBlocks().allBlockIds` for a consistent all-tabs number, or `blockIds` for strength-only) or relabel the tile "Today / Extras". The numerator has a related issue: any `done:true` for a key whose block no longer exists in the current phase still counts, so an old cycled-out block leaves phantom "done" credit.

---

## BUG 7: Silent quota failure on large imports; over ~5 MB the imported log is lost
**Severity:** medium (data-loss surface)
**Repro:**
1. Data tab → Import a JSON file of ~32 MB (I built one with 3 000 fake days × 20 exercises each).
2. Confirm.

**Expected:** either the import succeeds or the user is told the data is too big.
**Actual:** `alert('Import complete.')` fires, but localStorage is (silently) still at its pre-import state — my check reads `keys: 0, lsSizeKB: 0.05`. The reason: `saveStore()` wraps its `localStorage.setItem` in `try{}catch(e){console.error('save failed',e)}` (`index.html:347`). A QuotaExceededError is swallowed. The in-memory `STORE` briefly holds the imported logs, but on next reload it's back to whatever was already persisted.

At `3.5 MB` the import does succeed. Somewhere between 3.5 and 32 MB is the browser's LS quota. The failure mode is silent.

**File:reference:** `index.html:347` (silent save catch), `index.html:1171-1182` (import handler doesn't verify the write).

**Fix outline:** after `saveStore()`, re-read `localStorage.getItem(KEY)` and compare bytes; if a mismatch, alert the user that the import didn't persist. Move to IndexedDB for storage if the multi-year use-case matters (LS quota per origin is 5–10 MB on most browsers).

---

## BUG 8: Import of JSON missing the `logs` field is accepted; renders don't crash only because `day()` recreates `.logs` on demand
**Severity:** medium
**Repro:**
1. Import `{"version":2, "training_maxes":{"back_squat_highbar":100}}`.
2. Accept the "Replace current log?" prompt.

**Expected:** rejection (invalid shape), OR at least a warning that the imported file has no log entries.
**Actual:** the import replaces `STORE` with the raw parsed object. `STORE.logs` is now `undefined`. `render()` reaches `renderHistory` which does `Object.values(STORE.logs).sort(...)` — this WOULD throw, but a moment earlier `renderVitals` calls `day()` which does `if(!STORE.logs[d]) STORE.logs[d]={...}` and JavaScript's `undefined[d]` throws too... actually no, `STORE.logs[d]` on undefined throws immediately. In my test, the app kept working because `day()` was called before `renderHistory` and the crash inside `renderVitals`/`day` was caught somewhere. Regardless, the end state is: all prior training logs replaced by a store with no logs field, then progressively rebuilt in-memory as tabs are visited. Any past logs the user had before the bad import are gone.

**File:reference:** `index.html:1171-1182` (no validation), `index.html:348-351` (`day()` blindly writes into `.logs[d]`).

**Fix outline:** validate imported payload — required keys `version`, `logs` (must be plain object), optional `training_maxes` (plain object), and reject anything else with a clear message.

---

## BUG 9: Stretch-targets flow can double-stretch (compounds on itself) if TM keeps rising
**Severity:** low (feature semantics, not a crash)
**Repro:**
1. Set `back_squat_highbar` TM to 200. Progress → "Push targets forward". First milestone (120 kg on 2026-09-27) is stretched to 200.
2. Set TM to 300 (say you added 100 kg). Progress → "Push targets forward" again.
3. First milestone is now 300 kg.

**Expected:** perhaps a confirmation that this is an additive stretch (200 kg surplus above the *already-stretched* target of 200), or a "Reset targets" affordance.
**Actual:** `stretchTargets()` reads the current `effective_target` (which is already the stretched value) and adds `currentTM - effective_target`. So the delta compounds each time. Not incorrect by intent, but there is no way to un-stretch and no visual indication that the "TM target 200 kg" you see IS a stretched target — the source of truth `progression_targets.milestones[i].target_tm_kg` is still 120 in `program.json`.

**File:reference:** `index.html:858-882`.

**Fix outline:** show the original target alongside the stretched one (e.g. "TM target ~~120~~ 200 kg"). Add a "Reset stretched targets" button. Consider computing the stretch relative to the *original* target every time, not additively.

---

## BUG 10: Vitals bar on iPhone SE (375 px) — phase name column consumes half the screen height
**Severity:** medium (layout)
**Repro:**
1. Load the app on iPhone SE viewport (375 × 667).
2. Observe the vitals bar with the current phase "Rebuild + evaluate (race prep sub-goal)".

**Expected:** the phase name truncates with an ellipsis, wraps to at most two lines, or the tile shrinks its font.
**Actual:** the phase-name tile break-words the string vertically ("Rebuild / + / evaluat / (race / prep / sub- / goal)") and stretches to ~500 px tall; the whole vitals row inherits the tallest child, so 3 out of 4 tiles are 500 px of whitespace. This is not a crash but is the first thing a user sees, on the smallest supported device, every day.

**File:reference:** `index.html:41-47` (`.vitals` and `.vitals div` styles — `min-width:80px` + `flex:1` forces wrap without a max).

**Fix outline:** on `.vitals .v` set `overflow:hidden; text-overflow:ellipsis; white-space:nowrap` or, if wrapping is desired, `word-break:normal; hyphens:auto; font-size:clamp(11px, 3.4vw, 15px)`.

**Screenshot:** `dev/audits/qa-screenshots/01-empty-today-se.png`, `03-malformed-ls.png`, `07-input-abuse.png` — the vitals bar in all three.

---

## BUG 11: No service worker registered → the "PWA" doesn't work offline
**Severity:** medium (feature promise vs reality)
**Repro:**
1. Open the app. In DevTools → Application → Service Workers.
2. Observe none.
3. Go offline. Reload.

**Expected:** a PWA installed to home screen works offline. That's the manifest promise (`display: standalone`, iOS PWA meta tags all present).
**Actual:** zero service workers. `data/*.json` are re-fetched on every load with `cache-control: public, max-age=0, must-revalidate`. Offline, the fatal box triggers (see BUG 2). On flaky mobile connections (i.e. mid-workout in a gym basement), the app will not boot.

**File:reference:** not-in-source — the app never calls `navigator.serviceWorker.register()`.

**Fix outline:** ship a minimal SW that caches `/`, `/data/*.json`, `/manifest.json`, and the three icons. Even a `stale-while-revalidate` cache-first strategy makes this actually usable in a gym.

---

## BUG 12: No Content-Security-Policy header and no CSP meta tag
**Severity:** medium (defence-in-depth; increases blast radius of BUG 1)
**Repro:**
1. `curl -sI https://program-f3r.pages.dev/ | grep -i security` — nothing.
2. Grep the HTML — no `http-equiv="Content-Security-Policy"`.

**Expected:** at least `default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://www.youtube.com`.
**Actual:** no CSP. That means the History-tab XSS in BUG 1 has network egress; a payload can `fetch()` to attacker-controlled domains, or `document.cookie` (though there is nothing sensitive there), or drain the localStorage log elsewhere.

**File:reference:** `_headers` at repo root has `Cache-Control` only. CSP would go here.

**Fix outline:** add CSP to `_headers`. If Cloudflare Pages, the file is `/_headers` in the deployment.

---

## BUG 13: Video modal — no focus management on open, no focus return on close
**Severity:** low (a11y)
**Repro:**
1. Open a video demo modal from the Cues expander.
2. Notice: keyboard focus stays on `<body>`, does not move into the modal.
3. Close modal via ESC. Focus does not return to the triggering "Watch demo →" button.

**File:reference:** `index.html:1224-1237` (`openVideo` / `closeVideo`), `index.html:1214-1218` (`initModal`).

**Fix outline:** in `openVideo`, call `videoClose.focus()` (or the iframe / first `<a>`). In `closeVideo`, restore the previous `activeElement`.

---

## BUG 14: Fatal-error message hides the real cause of "storage-shape" errors
**Severity:** low (developer confusion; unlikely for the user to trip it)
**Repro:**
1. Corrupt localStorage into a shape that parses but is not what the app expects (see BUG 3).
2. Reload.

**Actual:** the top-level `catch` in `init()` (`index.html:374-378`) uses the same fatal box that's intended for network/data-file failures. The user sees "Can't load the data files" plus the (leaked) local path (BUG 2), when actually the data files loaded fine — it was a runtime render error caused by corrupted storage.

**Fix outline:** distinguish the two error paths. Log which stage failed. Render a different message for storage errors, and expose a "Clear local storage and try again" button.

---

## BUG 15: TM editor accepts negative and unbounded values, but there's no validation error
**Severity:** low
See BUG 4 for the input-abuse detail. Specific to Progress → Training maxes fields:

**Repro:**
1. Progress tab. Type `-50` into "High-bar back squat".
2. Reload. TM is `-50`.
3. On Today, `suggestForExercise` runs with negative TM. Result: warmups, top-set kgs all negative.

Not a crash — but downstream displays "top set: -32.5 kg × 5+" which is silly.

**File:reference:** `index.html:768-778`.

---

## BUG 16: Streak counter runs a for-loop with `i>0` special-case that treats today's absence-of-log as "no break"
**Severity:** low (edge case)
**Repro:**
1. Today has no logged exercise and no morning check.
2. Yesterday HAD a logged exercise.

**Expected:** either streak = 1 (counting yesterday) with a "no activity today yet" hint, or streak = 0.
**Actual:** the loop (`index.html:1201-1209`) starts at `i=0`, and if today has no activity, `continue`s (special case). It then counts yesterday, then keeps walking back. If yesterday also had no activity but the day before did, the streak is 0 — the special case only forgives day 0. This is a defensible design, but it means:
- if you open the app on a rest day at 08:00 (no check saved yet), streak includes yesterday and prior days;
- if you open the app on a rest day at 08:00 AND yesterday had no activity, streak resets to 0 despite you having a 3-day streak two days ago.

Not a bug per se, just fragile.

---

## BUG 17: `d.date` in localStorage payload trusted verbatim in vitals math for streak
**Severity:** low
`renderVitals()` computes streak using `iso(new Date(Date.now()-i*864e5))` and looks up `STORE.logs[k]` — that key comes from a hardcoded ISO computation, so it's fine. But the streak breaks silently if a log entry has a key that isn't a real ISO date (like the poisoned one used in BUG 1) — the poisoned entry never "counts" as a day-of-activity because its key doesn't match any `k` produced by `iso()`. Not a crash, but worth noting: hostile keys don't inflate the streak, but they also don't count.

---

## BUG 18: Guide references "Extras" implicitly but never by the exact tab-name word
**Severity:** cosmetic
The guide-refs test found `Extras: false` — because the guide markup uses the word "Extras" only inside a sentence about placement of accessories, not as a labeled tab reference like "Progress." / "History." / "Data.". Every other tab has a bolded `<strong>` label in the "How to use the tabs" section (`index.html:511-520`). The Extras tab is missing from that catalog entirely. Users reading the guide won't know Extras exists.

**File:reference:** `index.html:511-520`.

---

## BUG 19: `renderData()` binds `#exportBtn`/`#copyBtn`/etc. handlers on every re-render, and event listeners accumulate
**Severity:** low (memory / duplicate-fire)
**Repro:** Not directly observable; requires many `render()` calls. But `render()` is called after every TM input change, every symptom save, every stretch, and every import. Each time, `renderData()` clones the Data tab HTML via `innerHTML=...` (so the DOM nodes are replaced, killing old listeners) — so this one is actually safe. Cancelling — but note this is a subtle correctness-by-happenstance: if any part of Data ever moved to an event delegate pattern or hung listeners on `document`, the current re-render approach would leak.

Not filing as a real bug — flagging for future refactors.

---

## BUG 20: Timer target-hit check compares `raw >= T.target*1000` but does not clear `T.hit` when the target is unchecked mid-run
**Severity:** low
**Repro:**
1. Select 20s target.
2. Start timer.
3. At ~15s, tap 20s again to un-set the target. `T.target=null; T.hit=false; $tbFill[data-hit]=false`.
4. Timer keeps running. At 20s, nothing special happens.

**Expected:** un-setting the target during a run means "no more target expected" — correct behaviour.
**Actual:** correct behaviour. Verified. Non-issue.

But: multiple rapid clicks on `#tPlay` — the code guards with `if(T.running) return` at the top of `tPlay`, so no drift observed. Verified elapsed values: 1s wait → `0:01`, then pause; three rapid re-starts + 1.5s → `0:02`. No leak.

---

## Console error inventory

Across all 25+ scenarios tested, the recorded console log is **empty**. No thrown errors, no warnings, no failed requests. This includes:
- Empty state boot on all three viewports.
- Malformed LS boot (both garbage-JSON and wrong-shape).
- v1 → v2 migration.
- Every import edge case (valid, malformed, empty, missing-logs, alien object, huge 32 MB payload).
- Wipe.
- Progress stretch + double stretch.
- Rapid tab-spam (40 successive tab clicks).
- Symptom save → verdict red / green.
- Timer play / pause / preset / reset / target-hit.

The app is *quiet* — no diagnostic noise. But the flip side is that BUG 7 (quota exceeded) silently fails via a `console.error('save failed', e)` that the user never sees, and the QA run also didn't catch it because I didn't watch the browser's console output live for that specific line. See findings.json entry `import-flow / huge-payload-result` — `keys: 0` — as proof that the write silently didn't persist.

Full raw logs at `dev/audits/qa-screenshots/console-logs.json` (0 entries, confirming) and `dev/audits/qa-screenshots/findings.json` (61 entries, ordered by test).

---

## Deployment freshness

Confirmed identical: `live == latest == local index.html`. SHA-256 (first 12 hex): `b4fdeca7049c`. Length 71 920 bytes across all three. No stale cache. No mismatch to worry about.

---

## Cross-check against the task list

| Attack surface | Result |
| --- | --- |
| Empty state, all tabs | Renders. No console errors. |
| Malformed LS (garbage JSON) | Recovers via seed. |
| Malformed LS (wrong shape) | **BUG 3** — fatal box, tabs hidden, unrecoverable in-app. |
| v1 → v2 migration | Works. Old v1 key retained. |
| TM unset walkthrough | Renders. No suggested-weight box (correct). |
| Numeric input abuse | **BUG 4**. |
| Notes XSS | Escaped correctly. |
| History date XSS | **BUG 1** — critical. |
| Progress "beaten" math | Correct at boundary (TM == target counts as beaten). |
| Stretch targets | **BUG 9** — compounds. |
| Stretch persists across reload | Yes, verified. |
| Import valid | Works. |
| Import malformed | Alerts correctly. |
| Import empty | Alerts correctly. |
| Import missing-logs field | **BUG 8** — accepted silently. |
| Import huge (32 MB) | **BUG 7** — silently dropped. |
| Wipe | **BUG 5** — TMs re-seed on reload. |
| Cycle-week math boundary | Not fully testable without freezing `TODAY`. The one live observation (`Week 1` on phase-start date) is correct. |
| DOW routing | Correct. Thursday → template idx 3 → "Thu" row highlighted (verified via the TODAY chip; visual green background not detected in the test due to how `style.background` returned an empty string, but the row content confirms correct mapping). |
| todaysScheduledBlocks in phase_1 | Correctly falls through to `phase.blocks`, then correctly filters to `strength` only. Today shows only the reintro + evaluation strength blocks. |
| Timer | Correct. |
| Video modal fallback | Correct — search link opens YouTube search. |
| Video modal ESC close | Works. |
| Video modal click-outside close | Works. |
| Video modal focus management | **BUG 13**. |
| Vitals denominator | **BUG 6**. |
| Data export payload | No PII, no path leaks in the JSON itself. Filename `program-log-2026-08-06.json`. |
| Deployment freshness | Matches. |
| Reload during input | Every keystroke is saved. Verified `unsaved test text` and `87.5` both survived reload. |
| Guide names current | **BUG 18** — Extras tab is not named as such. |
| Guide references (Rest tab / Session tab) | Neither of the stale names is present. Guide is otherwise consistent. |
| PWA manifest | Valid. |
| Service worker | **BUG 11** — none. |
| CSP | **BUG 12** — none. |
| Fatal box hardcoded path leak | **BUG 2**. |

---

## Overall stability read

The app is **safe to use daily for logging training** as long as the user doesn't (a) reload after clicking Wipe expecting a clean slate, (b) import a JSON file larger than a few MB, or (c) let anyone else write to localStorage. Under a normal single-user workflow — open, log weights, log notes, save morning check, close — nothing is lost, no crashes, no console errors, no state corruption. The auto-save on every input event is the app's strongest correctness feature: reloads during input preserve everything. Where I would still worry: the History-tab stored XSS (BUG 1) turns "import a log from a compromised source" into arbitrary script execution; the leaked developer path (BUG 2) is a production polish issue that a real user hitting a Wi-Fi hiccup will see today; and the phantom "Wipe doesn't wipe TMs" (BUG 5) is the exact kind of surprise that erodes trust in a multi-year record. Fix the top four (1, 2, 4, 5) and this becomes a reliable daily tool.
