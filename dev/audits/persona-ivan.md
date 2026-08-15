# UX review — Ivan, retired physiotherapist

**Reviewer:** Ivan, 58, Riga. 30 years in spinal and hip rehab. Recreational lifter — squat 100 kg, deadlift 140 kg, rebuilt after my own L4/L5 issue in 2018.
**Device pass:** iPhone 14 Pro (390×844) and iPad Mini (768×1024) via Playwright.
**App under review:** program-v2.pages.dev.

---

## 1. Clinical first impression

Better than I expected, and I say that as someone primed to dismiss another 5/3/1 app.

Several details told me almost immediately that a clinician had been in the room. The morning check separates left groin from low back from left buttock from right shoulder — that mirrors the actual complaint distribution rather than a global "how do you feel today". Provocative context is not buried in a settings screen: on the Today card for a barbell day, the deadlift block carries a red-orange "HISTORICAL PROVOCATEUR:DEADLIFT" tag, and the block pull is annotated "SHOULDER LOAD:GRIP". The Extras tab includes a half-kneeling hip flexor stretch with a note that reads, verbatim, "Deep anterior hip pinching means you are loading the labrum — back off immediately." That is physiotherapy language, correctly placed at point-of-use rather than in a document.

The Guide reads as though someone actually thought about how a session goes wrong: green/amber/red states, a reset rule for failed AMRAP sets, and — critically — a red-flag list that names night pain, gait change, sharp catch with groin pain, and morning stiffness ≥30 min with second-half-of-night waking. That is a workable inflammatory-back-pain screen. I would not expect a strength app to contain it.

So: this is not a gym-bro tool with a physio veneer. It is a rehab-aware strength tool with real gaps in how safely it hands control back to the clinician when things go bad.

## 2. Three things done right

1. **Morning check → state → prescription is a real loop, not theatre.** When I saved 6/10 low back + 4/10 left groin + 35 min stiffness + night-waking, the Check page returned "RED — BACK OFF TWO STEPS AND DROP TM BY 10% AT CYCLE END" and the Today card immediately swapped the whole primary panel to "Rest today · Consider skipping the barbell. Extras only." with a distinctive red-tinted card. The copy is calm, specific, and — this is the important part — it does not just quietly de-load; it names the state, explains what will happen to the training max, and gives the user a Skip button that "marks the day without breaking your trajectory." That is exactly what a patient needs to see on a bad day: permission to stop, with the promise that stopping doesn't cost them the plan.

2. **The Progress tab shows Symptom vs Load overlay.** Peak-symptom line drawn on the same time axis as top-set kilograms. I have never seen this in a training app. It is precisely what makes a specialist appointment productive — an objective time series of "here is what I lifted, here is what I felt the next morning." Take a screenshot of that chart into your next physiatry visit; it does more than any subjective recall.

3. **Provocateur-aware exercise selection.** The rehab block excludes hanging knee raises, L-sits, and Copenhagen planks — the movements this specific user's records flag as provocative. Instead: seated hip flexor **isometric** in mid-range, adductor isometric squeeze, dead bugs, 90/90 switches, half-kneeling hip flexor with the "no deep anterior pinch" cue. Someone did the reading. A generic strength app would prescribe hanging leg raises and call it "core."

## 3. Where the app could hurt someone

Ranked, worst first.

### 3a — Red-state check does NOT carry to the next session (HIGH severity)
This is the single finding I want the developer to fix before anyone else uses this app. I saved a red-state check on Friday (peak 6, groin 4, night pain, 35 min stiffness). Friday is a rest day — the Today card correctly said "Rest today." Then I stepped forward one day to Saturday, which is a barbell day. Saturday showed **"No check yet"** and prescribed **100 kg × 5 back squat** with no reduction, no red-state banner, no reminder that fewer than 12 hours ago the user was flagged red. The prescribed load was above the reintro cap and the note explicitly said "Above the reintro cap — the cap no longer applies."

That is dangerous. Symptoms don't reset at midnight. A user who wakes up feeling only slightly better on Saturday and re-opens the app is now looking at a full-load prescription with no memory of yesterday's red flag. The rule should be: a red check within the last 48 h remains sticky on the next session view with a persistent banner ("You logged red on Fri 7 Aug — reduce or skip until you log a fresh check"), even if that session is on a different date.

**Fix:** the "state" that drives prescription should be the most recent check within a rolling window, not the check attached to a single calendar day.

### 3b — No escalate-to-clinician control anywhere (HIGH severity)
I searched every tab. There is no button, no phone link, no visible "call physio" affordance. The Guide's red-flags list is prose — well-written prose, but you have to remember to open the Guide, and the Guide is not in the bottom nav. When someone has night pain that woke them, they are not going to type `/guide/` into the URL bar.

**Fix:** a small "Red flags" pill on Today when night-pain is checked in the morning check. And a persistent "Contact clinician" affordance in the app footer or account menu that stores my orthopaedist's + physiatrist's numbers.

### 3c — Guide is not in the bottom nav (MEDIUM severity)
The Guide contains the red-flags list, the TM/AMRAP/RPE definitions, the reset rule. It is the single most important page for someone new to 5/3/1 or new to a rehab-aware plan. And the app tells the user, in the Guide itself: "Data and Guide have their own routes (/data/, /guide/) but aren't in the bottom nav. Bookmark them if you need them often."

That is the wrong trade-off. Coach is in the nav and the backend is not configured, so it renders a deployment instruction screen. Swap them: put Guide in the nav, hide Coach until it works.

### 3d — Coach shows deployment instructions to the end user (MEDIUM severity)
The Coach tab currently shows `wrangler secret put ANTHROPIC_API_KEY` and `worker/README.md`. That is developer copy in an end-user surface. On a real deploy for anyone but the author, this should be a "Coach is offline" empty state, not a config manual.

### 3e — The birthday waypoint is aggressive for this clinical picture (MEDIUM severity)
Squat TM 110 → 165 kg (+55 kg, +50%) over ~9 months. Pull TM 130 → 188 kg (+58 kg, +45%). Attempted 180 kg squat and 200 kg deadlift on the day. On a user with:
- unresolved possible sacroiliitis (from what I can piece together)
- documented anterior groin provocation on resisted SLR
- FADIR-positive bilaterally
- one attended physiotherapy session on record

...I would not underwrite this trajectory. Muscle-memory return is real and the numbers are technically plausible in a healthy 40-something, but the plan does not include a pre-set decision rule for "if amber weeks stack in cycles 2-3, we replan the waypoint." The Guide says "Any amber week: hold TM. Any red week: TM -10%." That's the rep-level rule. It is not a phase-level rule. There should be an explicit gate at the end of Cycle 2 (2026-10-25) that reads: "If more than X% of weeks in cycles 1-2 were amber/red, the birthday goal is downgraded to a technical waypoint, not a PR attempt."

### 3f — 9-pixel type in the bottom tab bar (LOW severity, but real for older users)
Sampled computed styles: tab-bar labels ("TODAY", "WEEK", …) render at font-size 9 px, letter-spacing 0.225 px. Body copy on some cards renders at 11 px. On the iPhone at arm's length with my reading glasses off, the tab labels are readable but only just, and the small metadata rows on Extras ("5 sets · 20s hold · @ 60% · each side") are tight. Contrast is fine (I measured `rgb(138,143,154)` on `rgb(14,15,18)`, comfortably above WCAG AA), but size is not adjustable and there is no accessibility text-scale respect visible.

**Fix:** honour iOS Dynamic Type / prefers-reduced-motion; move tab labels to 11-12 px minimum; give the metadata rows one size class up.

### 3g — Coach guardrails invisible (LOW because Coach is offline, but planning ahead)
The Coach description says it "Reads your full history + clinical context each turn." Before it goes live: what happens if the user types "should I try the deadlift today, my back hurts"? What are the refusal boundaries? Where does it stop and say "this is a clinician question"? I would want a visible, click-open "What the coach will and won't do" panel above the chat, not a click-through Terms modal.

## 4. On collapsible exercises

I would collapse them by default on Today after the first set is logged. Rationale from the clinic: patients doing a five- or six-exercise session on their own are cognitively taxed by set three. They start missing form cues, they enter reps into the wrong exercise, they forget which side of the split squat they just did. The screen becoming a wall of open forms adds load at exactly the moment they need less.

Concretely:
- **Default state at load:** first exercise expanded, rest collapsed to a single row showing name + prescribed sets × reps + a check icon.
- **On first-set-logged of any exercise:** it collapses itself, next exercise expands.
- **Tap to re-expand** for cue review or a late set.
- **The rehab isometrics on Extras stay collapsed by default** with just the timing summary — you don't need the whole cue paragraph visible while you're holding a 20-second squeeze.

The counter-argument — that new users benefit from seeing the whole session — is real, and I would gate this behind a preference that defaults to "expanded" for the first week and "smart collapse" after that. Users tired after their session need fewer decisions, not more scrolling.

## 5. What I would want visible on every session but currently isn't

1. **Days-since-last-red-check counter, always on Today.** Streaks reinforce compliance, and clinicians want to know whether the last three sessions have been clean or noisy.
2. **A tiny "provocative positions" list on the session header.** Not the full clinical context — just the four or five movements this user has been told to avoid this phase. Right now the app respects them in prescription; it doesn't remind the user which movements they are.
3. **A "log next check now" reminder** if the last check is >24 h old on a barbell day. Related to finding 3a.
4. **The nearest red-flag threshold, contextually shown when a slider crosses it.** If Low Back moves from 3 to 4, subtly indicate "at 5+, this becomes red." Teaches the user the rules by revealing them at the boundary rather than by forcing them into the Guide.
5. **Session-level "How did this feel?" prompt at the end.** RPE is per-set; there is no per-session field for global reactivity ("stiffened up mid-session", "left groin fine today"). Two lines of free text would be enough. That is the note the next physiotherapy appointment lives on.
6. **A visible "escalate" affordance,** as under 3b.

## 6. Would I recommend this to a client with this exact injury profile?

Qualified yes, with conditions.

I would recommend it as a **logging and pattern-surfacing tool** — the Progress tab's Symptom vs Load overlay alone is worth the install. I would ask the user to bring the exported JSON or a screenshot of that chart to every appointment.

I would **not** yet recommend the prescription engine as autonomous. Fix the red-state-carry-over bug (3a) and add the escalate control (3b) and I revise that upward. In the current build, a user who logs red on the evening after training and comes back to the app the next morning for a barbell session is looking at a full-load prescription with no warning. That is the exact failure mode that turns "manageable flare" into "six weeks off."

The birthday waypoint (3e) I would treat as aspirational rather than committed. A 50% TM bump in 9 months on this clinical picture is not something I would put my name to as a written plan. If cycles 1 and 2 come back clean, revisit. If they don't, the plan should already know how to gracefully re-target.

Overall: this is one of the more clinically-literate strength apps I have seen for a single-user rehab-plus-strength situation. It is also one edit away from being unsafe on a bad day. Close that gap and I would happily send my niece to it.

— Ivan
