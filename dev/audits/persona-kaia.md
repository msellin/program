# Kaia looks at my husband's training app

*Kaia, 42, Tallinn. Marketing manager. Group classes 3-4x/week. Has never touched a barbell over 40 kg. Not a coach, not a strength person. Reviewing the app before my husband shows it to his coach.*

## First impression — the first 60 seconds

I opened the link on my phone on the bus. Dark screen. Big text: **"How's the low back this morning?"** Under it, numbers 0 to 10 in a grid. Some are orange, some are red. There is no explanation of what this is, what app it is, or who it is for. It just starts *asking me things*.

I know my husband has a back thing so I *guessed* what this was, but if this were my app I would have already closed it. There is no "welcome," no name of the product, no tiny explainer like "this app helps you rebuild after injury — three quick questions before we start." It jumps straight into a medical questionnaire in the dark.

I tapped "Skip setup" because three screens of body-part interrogation before I have even *seen* the app felt like too much. That took me to a page called **Today** that said, in giant type:

> **No check yet.** Save a morning check to calibrate today.
> **Rest day — no barbell scheduled.**
> Accessory / rehab / run blocks live on the Extras tab — do them if you want, they still log to today.

So basically: today the app has nothing to show me. It is empty and vaguely scolding me for skipping the check. If this were the first time I opened the app on my own, I would think it was broken.

## What I understood, and what I didn't

**Understood, mostly:**
- The bottom bar with seven tabs. Icons are okay.
- The morning check thing — pain scale 0 to 10, sliders for body parts, checkboxes. I get that, I have used Peloton's mood check.
- The Week tab looked like a calendar. I could see Mon/Tue/Wed with little status pills. That was clear.
- History showed a heatmap like GitHub. Cute, I understood the coloured squares.

**Did not understand at all:**
- **`block_squat_heavy`** — this is a variable name showing on the Week page next to a real day. Why is my husband seeing code on his phone? Actual quote from the screen: "Mon — heavy squat day · `block_squat_heavy`". The label is fine. The code snippet next to it is not.
- Same problem: `block_pull_heavy`, `block_a_home`, `block_daily_skill`, `block_squat_variant`, `block_squat_volume`. Every single day has one of these gremlins on it. To me this looks like the app is half-built.
- **"1d"** with a flame icon in the top corner. A streak? A remaining day? "One day since what"? I have no idea. Peloton makes streaks obvious.
- **"Rebuild + evaluate (race prep sub-goal)"** under the Today title. What race. Why sub-goal. Why in parentheses.
- **On the Progress page:** "TM = the number percentages calculate from. 5/3/1 convention: TM ≈ 90% of a solid 5RM." I read that three times. I still don't know what TM is, what 5/3/1 is, or what a 5RM is. And it says my husband has to do an "evaluation week" and the numbers I see are "informed guesses." I would trust this less, not more, after reading that paragraph.
- "Ramp in fives to a heavy-but-clean 5RM. Stop when bar speed slows or form breaks." — this is not written for me. I know it is not written for me. But it is on a *page called Progress*, which sounds like it should show me *my progress*, not brief me like a coach.
- **Milestones page** has entries like `2026-11-22 · 4 cycles 3 4 test`. I don't know what "4 cycles 3 4 test" is. It reads like a git commit message.
- The **Coach** tab literally showed me terminal commands: `cd worker && npm install`, `wrangler secret put ANTHROPIC_API_KEY`, `npm run deploy`. On my *phone*. I stopped reading immediately. This is a screen for a developer, not for a person who wants a coach.

## Top 5 things that felt wrong

**1. The first-open experience is a pain quiz in the dark.**
Screen: onboarding step 1 of 3. There is no product introduction, no explanation of what the app does, and the first thing I am asked is how bad my back hurts on a 10-point scale, colour-coded orange and red. Fix: put a one-sentence "Welcome — daily rehab & strength tracker" and a "Take a tour" option first. The pain check can come *inside* the app, once I understand what I am looking at.

**2. Everywhere the app shows me its internal variable names.**
Screens: Week tab, Progress tab, Extras tab. `block_squat_heavy`, `back_squat_highbar`, `block_pull_midshin`, `deadlift_conventional` — these appear next to the human labels for no reason I can see. Fix: delete them from the UI. Only show the human name ("Heavy squat day", "High-bar back squat"). If a developer needs the ID, put it in a dev/debug menu.

**3. Jargon with no plain-English explanation on hover, tap, or nearby.**
TM, 5RM, 5/3/1, AMRAP (I saw it somewhere), RPE (probably somewhere), "reintro cap," "block pull mid-shin," "top set," "training max." Fix: either a tiny "?" tooltip next to each acronym, or replace them for the first-time reader. **TM → "your working weight"**. **5RM → "the most you can lift 5 times in a row"**. **5/3/1 → don't mention it, it's a programme name; call it "the plan"**. **RPE → "how hard it felt, 1–10"**. **AMRAP → "as many reps as you can"**.

**4. The Coach tab is unusable to a normal person.**
It shows code snippets and asks me to deploy a Cloudflare Worker. Fix: if the coach is not set up, show "Coach is coming soon" or hide the tab. Do NOT show terminal commands to a person on a phone. This alone would make me think the app is not finished and put it down.

**5. Today screen is empty and passive-aggressive.**
On a rest day it says: *"No check yet. Save a morning check to calibrate today."* Then: *"Rest day — no barbell scheduled. Accessory / rehab / run blocks live on the Extras tab — do them if you want, they still log to today."* I am being told I did not do the thing, and also that today is a rest day, and also there is stuff on another tab but only *if I want*. Fix: on a rest day, lead with the win — "Rest day. Recover well." Offer *one* clear action: a big button that says "Do today's rehab" that takes me straight to Extras. Do not scold me for skipping the check when I have not even used the app yet.

## The accordion / collapsible question

**Yes. A hundred percent yes.** The Extras page is the clearest evidence. When I scrolled it, I saw a huge stack of blocks: exercise name, then sets/reps line, then a highlighted warning quote, then "NOTES" field, then "CUES" field, then the next exercise, then another warning, then another notes field, then another cues field… I lost the plot after three exercises. My eye had no rest.

If instead the Extras page showed **just the exercise names as a list** — "Seated hip flexor isometric", "Adductor squeeze", "Single-leg glute bridge", "Dead bug", "Half-kneeling hip flexor stretch", "90/90 hip switches" — like a table of contents, I could see the whole session at a glance. Then I tap one and *that one* expands with the sets, reps, warning, notes and cues. Everyone else stays collapsed. That would feel like a modern app. What is there now feels like a printed physio handout.

Same idea should apply to the Progress page milestones. Right now every milestone is a full paragraph. If I could see just the dates and TM targets as a list, and tap for the description, I would actually read them.

The one place I would NOT collapse things is the Morning Check — the sliders should all be visible at once because it is a one-and-done screen and hiding sliders makes people forget them.

## Colours, fonts, spacing

The dark theme itself is fine and easy on the eyes on the bus. But:
- The **orange/red colour on the pain-scale numbers on the *first* screen** is aggressive. Peloton would ease me in; this feels clinical.
- The **body-part "L" and "R" chips** in teal and purple on the Check page are actually the nicest thing in the app. Warm and clear. More of that language elsewhere please.
- Font choice for the numbers looks like a monospace / coding font (the "0" in the pain scale, the "kg" units, the milestone dates like `2026-09-27`). It gives the whole app a *terminal / dev tool* feel. My husband would love this. I would not.
- Nothing has a photo, icon, or illustration of the exercise itself. The Nike Training Club app has a little animation for each move. Here I have just words. If I did not already know what a "half-kneeling hip flexor stretch" was, I could not do it from this screen.

## What is the Coach tab like when I'm not the target user?

It's like walking into a locked server room. Terminal commands, "wrangler," "ANTHROPIC_API_KEY," "worker/README.md." I would not open this tab a second time. The word "Coach" set my expectation to "someone friendly gives me guidance." What I got was setup instructions written for whoever built the app.

Even *if* the coach is working, calling it "Coach" and telling me it "Reads your full history + clinical context each turn" makes me nervous. "Clinical context" sounds like a chart at a doctor's office. I would rename it something warmer — "Ask" or "Guide" — and describe what it does in one plain line, not two clinical ones.

## What would I remove without asking?

- All the `block_*` and `back_squat_*` internal codes on Week and Progress. Gone.
- The whole terminal-commands block on the Coach tab. Show "Coming soon" if it is not deployed.
- The "1d" flame with no explanation.
- The "(race prep sub-goal)" subtitle on Today.
- The "TM = the number percentages calculate from" paragraph on Progress. Replace with one line: "Your working weights. We update these every few weeks."
- One or two of the seven tabs. Seven is too many for a phone. Extras + Today could merge (show today's rehab list inside Today). Progress + History could merge (both show numbers over time). I would happily use this app with four tabs: **Today**, **Week**, **Progress**, **Coach**.

## Would I recommend this to anyone?

Honestly: not right now. To my husband's *coach*, yes — the coach will love the depth, the symptom tracking, the milestone map. That is a professional's tool.

To a friend recovering from a similar injury? No. It looks like a developer's diagnostic panel dressed up for a phone. The information is clearly serious and thoughtful, but the presentation says "you need a manual to use this." A person like me would download it, get stuck on the pain quiz, see `block_squat_heavy`, and delete it before the end of the bus ride.

If the dev codes were hidden, the jargon translated, the Coach tab either working or removed, and the Today screen had one clear action instead of two apologetic paragraphs — I would give it another try. There is a good app in here. It is currently disguised as a spreadsheet.

---

**3-line summary, in my voice:**

*Ma armastan sind, but this looks like the back office of an app, not the app itself — codes like `block_squat_heavy` and terminal commands on the Coach tab made me want to close it. Yes, an accordion for the exercises would help enormously — the Extras page right now is one endless printed handout. Translate the acronyms (TM, 5RM, 5/3/1, RPE), lead the Today screen with one clear action, and hide the developer plumbing before your coach sees this.*
