# Redesign target: from a text app to a visual training product (2026-10-28)

**Owner's brief.** Today's Terav is nothing like GOWOD, Pliability or the top contenders. It has too much text, too few
visuals, no graphs and no beautiful UI elements. "We need to have all that."

**Evidence.**
- 4 peer studies (`peers-01`..`04`) plus the lead's look at the real store screenshots (`peers-00-visual-evidence.md`).
- Round-1 lenses `01`–`06`.
- 5 defect sweeps, merged in `MASTER-LIST.md`.

Scores are 1–10. The round-1 mean: text density 6, text size 7.6, **visual richness 4.8**, consistency 7.8.

## The rule every screen follows
Peers put **one hero visual per screen** (a ring, a photo card, a plan card or a chart), then **short cards with a
title, at most one helper line, and an icon or thumbnail**. Explanations and citations sit behind a tap. Terav does the
opposite: paragraphs first, the visual (if any) last.

Budget per element:
- **Title:** at most 6 words.
- **Helper:** at most 12 words.
- **A paragraph:** only inside a "Why" sheet.

## What Terav already has to build from
- **Data a hero visual needs:**
  - the readiness state (green, amber or red per region);
  - program progress (week N of M);
  - level, or tier;
  - the weakest-capability engine (`capability_slot`);
  - retest metrics (`retest-evaluator`);
  - every logged set.
- **Graphics:**
  - the readiness heatmap (a peer-unique asset; keep it);
  - `Sparkline`;
  - `SymptomLoadChart`;
  - `ArcProgressBar`;
  - the SVG figure rig (`lib/figures/rig.ts`). It covers only **10 of 140 exercises**, all hip and overhead. **No pull-up,
    handstand or strength drill has a figure.**
- **Video:** 51 exercises have a YouTube link.
- **Imagery:** none. No photo or illustration of a person or program anywhere.

## Screen by screen

### 1. Today (home)
| Element | Peer | Terav data | Effort |
|---|---|---|---|
| **Hero readiness ring**: a big state word plus a band colour, one sub-line ("Shoulder 8/10, rest today"); tap opens the check | Whoop recovery, GOWOD score | readiness state, exists | M |
| **Today target chip** under the ring: "Train as planned" / "Go easy" / "Rest" | Whoop strain target | green, amber or red | S |
| **Week strip**: 7 day dots, filled when done, coloured by session type | pliability week dots, Runna | scheduled blocks | S |
| **Session preview card**: title, minutes, 3 exercise thumbnails, one Start button; replaces the prose cards and the "Four tabs" tour | Calis list, pliability "Daily Sessions" | the session plus figures | M (needs figures) |
| **Goal progress**: the level ladder with "you are here" and a days-to-retest count | Runna plan card, calisthenics ladders | level and retest dates | M |

**Red-day rule unchanged:** the ring goes red, the card is "Rest today" plus "Log how it feels". **Rejected:** Runna's
"lighter session on red" (peers-03 #10). It contradicts the red-day safety rule.

### 2. Program page and catalog (the ad landing in the app)
| Element | Peer | Effort |
|---|---|---|
| **Hero image** per program (full bleed, title on it) | pliability program page, GOWOD | S code + **asset** |
| **Level ladder graphic** (Hang → Assisted → First rep → Volume as nodes) replaces the text arrow line | Calistack, Thenx levels | M |
| **3 stat tiles**: weeks · sessions/week · minutes | Runna plan card | S |
| **Sticky "Start free"** button | everyone | S |
| The 4 "Section n of 4" text cards become one collapsed "How it works" | pliability | S |
| **Catalog cards** with image, difficulty label and duration | Hevy library, pliability "Paths by goal" | S + **asset** |

### 3. Quick start (replaces the 16-step intake)
- **Screen 1, level.** 3–4 tappable cards, each with a small figure and a plain-language level ("Can't hang 15 s yet",
  "Can hang, no pull-up", "1–3 pull-ups", "4+"). Runna's goal list uses an icon per option.
- **Screen 2, safety.** One screen of checks with "None of these". The block and warn rules stay as they are.
- **Screen 3, plan result.** "Your plan": the ladder with your node lit, plus 3 stat tiles, plus Start.
  (pliability "Build your program" card, the calisthenics "you are here".)
- **Later.** A "Find your exact level" card on Today: the 5 physical tests as a guided video or figure flow
  (Thenx assessment).

### 4. Session player and exercise detail
| Element | Peer | Effort |
|---|---|---|
| **Movement visual at the top of every exercise**: the empty "Open the full tutorial" box is never shown | all peers | **L, the biggest item** (see "Assets") |
| Exercise list rows with a thumbnail figure on the left | Hevy, Calis | S once figures exist |
| Set rows: big numbers, last time prefilled, done rows turn green | Hevy logger | M |
| Stats strip at the top: time · sets · volume | Hevy | S |
| Blocks labelled Warm-up / Main / Cool-down with one line each | Runna | S |
| Exercise detail tabs Summary / History / How to; history as a line chart with metric chips | Hevy squat screen | M |

### 5. Session done
- **A PB callout**, a tick on the ladder, sets done against target as a small bar chart, one coach line and the next session.
  (Hevy PR, Runna post-run, calisthenics completion.) Effort M.
- **Share image:** later.

### 6. Record (progress)
| Element | Peer | Effort |
|---|---|---|
| **Hero chart**: the program's key metric over weeks (dead-hang seconds, best reps) with retest points and a delta chip | Hevy line chart, Strava | M |
| **Capability bars**: one bar per sub-capability (grip, scap, negative, band, reps), the weakest highlighted | GOWOD body-part bars | M |
| Weekly card as 3 stat tiles with delta arrows (sessions, readiness, load) | Strava, Fitbod report | S |
| Keep the heatmap and move it below the hero chart. Collapse the history list. | n/a | S |

### 7. Morning check
- A **body figure** with tappable regions coloured by severity, instead of a list of rows (Pliability joint map).
  Effort M. The existing region library maps onto it.

### 8. Global
- **Icons** on every choice, shortcut and tab (lucide is already in the app).
- **Imagery in the empty states**: first run, no logs, end of program.
- **Motion**: ring fill and chart draw-in, respecting reduced motion.

## Assets: the one decision only the owner can make
Every peer leads with **people moving**. The options for exercise and program visuals:

| Option | Look | Who | Cost / time | Risk |
|---|---|---|---|---|
| A. **Extend the SVG figure rig** to the ~30 ad-path drills (pull-up, handstand, strength) | flat, on-brand, animatable | Claude, in code | about 1–2 days | looks "illustrated", not premium-photo |
| B. **Owner-shot photos and short loops** (phone, plain wall, 3–5 s per drill) | GOWOD / pliability / Thenx level | owner shoots, Claude crops and wires | 1 afternoon of shooting | lighting consistency |
| C. AI-generated stills | photo-like | Claude prompts, owner approves | hours | anatomy errors on pull-up hands, consistency, licence terms |
| D. YouTube thumbnails (51 exist) | inconsistent, third-party | n/a | small | licensing and brand. **Not recommended.** |

**Recommendation:** A now, so no exercise is ever blank and the ad path has figures. B for program hero images and the
top 10 drills, as soon as the owner can shoot. Program hero images can be shot or made in a day.

## Order of work
| Phase | When | What |
|---|---|---|
| **P0** | before ads | Fix the B items in MASTER-LIST. Never show the empty media box. Quick start (3 screens). Program page hero, ladder, sticky Start. Delete the "Four tabs" tour. |
| **P1** | ads week | Today ring, chip, week strip and session preview. Figures for the ad-path drills (option A). Record hero chart and capability bars. Session done screen. |
| **P2** | after the ad read | Body-map check. Exercise detail tabs and charts. Set-row redesign. Badges. Share images. Photo assets (option B). |

Each phase ends with a re-shoot of the ad path and a 1–10 rescore by the same lenses.
