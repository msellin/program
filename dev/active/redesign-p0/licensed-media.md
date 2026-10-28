# Interim exercise demo media - legal options (2026-10-28)

Rule: no screen-recording or re-hosting third-party video. Only (a) official YouTube player embeds, (b) openly licensed assets, (c) paid licensed APIs.

## Method / caveats
- Embeddability: checked with `youtube.com/oembed` (HTTP 200 = owner allows embedding; 401/403 = disabled). Every link below returned 200 on 2026-10-28. This is a proxy; the owner can change it later. Embed via the official iframe / youtube-nocookie player only (no download, no proxying).
- YouTube API ToS: do not strip branding/controls or overlay; fine to embed with `rel=0`.
- Names/IDs come from `next-app/public/data/exercises.json`. Already have video_url: only back_squat_highbar, block_pull_midshin, front_squat (the 3 strength ones; all verified embeddable: Squat University, Alan Thrall, Andy Baker). The other 51 unique ids have none.

## Source grading
| Source | Licence | Commercial | Verdict |
|---|---|---|---|
| YouTube official embeds (CrossFit channel, Rogue, Invictus, coaches) | Owner keeps copyright; embedding via official player is permitted by YouTube ToS when owner enables it | Yes (embed only, no re-host) | BEST for coverage. Zero licence work, but video quality/framing varies and videos can be deleted/disabled. |
| Wikimedia Commons "Fitness animations" | Per file; checked Pullup.gif = CC BY-SA 3.0 + GFDL (author Extremistpullup; credit + licence link; derivatives must be share-alike) | Yes | Only ~5 relevant files (pull-up, squat, deadlift, push-up, muscle-up). 152x168 px, low quality. Share-alike makes in-app use awkward. Skip except as fallback. No handstand/row/plank/hollow files. |
| free-exercise-db (github.com/yuhonas/free-exercise-db) | Repo = The Unlicense (confirmed via LICENSE.md + GitHub API; public domain, no attribution). 876 exercises, static JPG pairs (start/end frames), no video | Yes for the repo | Provenance of the images is NOT documented in the repo - Unlicense only covers what the author owned. Legal risk unverified; ask owner before shipping. Has Band_Assisted_Pull-Up, Chin-Up, Inverted_Row, Barbell_Deadlift, Front_Barbell_Squat, Barbell_Squat, Handstand_Push-Ups; no handstand-hold/walk, hollow, scap pull, ring row. |
| ExerciseDB API (RapidAPI / AscendAPI) | Proprietary; non-exclusive, revocable licence for subscription period only; terms forbid storing/caching (live fetch every use); data stays AscendAPI property. Plans via RapidAPI (current prices not retrievable - check listing) | Via paid plan, with those limits | Poor fit: no offline/PWA caching, lock-in, coverage of handstand/pull-up progressions unknown. |
| RepDB | Free tier 250 exercises, commercial use OK, mandatory visible link "Exercise data by RepDB (repdb.co)", no repackaging | Yes with attribution | Unverified coverage; not investigated further. |
| MuscleWiki API (RapidAPI) | Fitness-apps-only licence, no ML training | Paid | Not investigated for caching terms. |
| WorkoutX | Claims free 500 req/mo, $9.99 for 3,000 (promo post, unverified) | ? | Skip. |

## Per-exercise table (embed = YouTube official-player embed, oEmbed 200)
Generic picks reused across variants (same movement, different dose).

### first-strict-pullup
| exercise_id | name | best source | URL | licence/embedding | notes |
|---|---|---|---|---|---|
| pu_active_hang | Active hang | Pike Fitness | https://www.youtube.com/watch?v=Nc-JGSZZMAQ | embed OK | "Dead hang" demo; scap-depress cue weak; alt CrossFit Jaakarhu 4RqNGRVaTUQ (bar hang, hollow cue) |
| pu_dead_hang | Dead hang | Pike Fitness | https://www.youtube.com/watch?v=Nc-JGSZZMAQ | embed OK | direct match |
| pu_band_pullup_heavy / _light | Band-assisted pull-up | none embeddable found (not verified a good one) | free-exercise-db Band_Assisted_Pull-Up (stills) | Unlicense, provenance unverified | GAP for video |
| pu_first_strict_attempt | First strict pull-up attempt | Northstate CrossFit | https://www.youtube.com/watch?v=ifOBltCCRZw | embed OK | strict/kip/butterfly mixed; show strict part only (use `start=`) |
| pu_grease_the_groove_singles | GtG singles | same as above | ifOBltCCRZw | embed OK | no dedicated demo |
| pu_partial_rom_pullup | Partial-ROM pull-up | same | ifOBltCCRZw | embed OK | approximate |
| pu_slow_tempo_pullup | Slow tempo pull-up | same | ifOBltCCRZw | embed OK | approximate |
| pu_hollow_body_hold | Hollow body hold | Zack Henderson | https://www.youtube.com/watch?v=HAfUt2Cco74 | embed OK | alts: Califorged W3E2SBg1ViQ, Unity Gym MY6_stJuy7M |
| pu_hollow_body_pullover | Hollow body DB pullover | none | - | - | GAP; use hollow hold video |
| pu_isometric_mid_hold / _top_hold | Isometric holds | none dedicated | - | - | GAP; use pull-up video |
| pu_negative_pullup_5s / _10s | Negative pull-up | Bulldog Gear | https://www.youtube.com/watch?v=EkpJkHpJXmM | embed OK | alt (rings) PowerMonkeyFitness -M2M_tTOB_4 |
| pu_ring_row_horizontal / _incline / _feet_elevated | Ring row | CrossFit "The Ring Row" (James Hobart) | https://www.youtube.com/watch?v=xhlReCpAE9k | embed OK | official CrossFit channel; alt Monroe Miller 2mKpw0PuE2Y |
| pu_scap_pull | Scapular pull-up | Zack Henderson | https://www.youtube.com/watch?v=-ZIpSoTRsuE | embed OK | alt Your House Fitness 8FWdmFBUNP0 |
| pu_scap_retraction_hold | Scap retraction hold at top | The Sustainable Training Method | https://www.youtube.com/watch?v=ghRdV2RkrMI | embed OK | ring-row retractions, partial match |
| pu_shoulder_prep_band | Band shoulder prep | none | - | - | GAP |

### handstand-walk
| exercise_id | name | best source | URL | licence/embedding | notes |
|---|---|---|---|---|---|
| hs_walk_continuous_line, hs_walk_marker_path, hs_walk_precision_path, hs_walk_shuttle_2_3, hs_walk_through_cones, hs_walk_over_plate, hs_single_step_attempt | handstand walking variants | CrossFit "The Handstand Walk" | https://www.youtube.com/watch?v=I5p2VVDupq8 | embed OK, official CrossFit | alts: CrossFit Walk Around Box eTPNMd2r__c; Scaling rPT_iR-TSvA, 46F8ShhFyxQ; The Progrm 65bAfT9kUOg |
| hs_kickup_practice | Freestanding kick-up | CrossFit Invictus "Handstand Kick Ups" | https://www.youtube.com/watch?v=XBl4Er1qT-4 | embed OK | alt CrossFit yD9F477eZUA |
| hs_wall_hs_hold_belly / _chest | Wall holds | Veteran_Influencers (low-tier) / CrossFit yD9F477eZUA | https://www.youtube.com/watch?v=yD9F477eZUA | embed OK | belly-to-wall specifically: no ideal hit |
| hs_wall_walk | Wall walk | CrossFit Wall Walk Scaling | https://www.youtube.com/watch?v=fNHjs-CzDvQ | embed OK | official |
| hs_hollow_body_hold | Hollow body hold | Zack Henderson | https://www.youtube.com/watch?v=HAfUt2Cco74 | embed OK | |
| hs_tuck_freestand, hs_freestand_attempt | freestanding | The Progrm 65bAfT9kUOg | https://www.youtube.com/watch?v=65bAfT9kUOg | embed OK | approx |
| hs_half_pirouette_wall/_free, hs_full_pirouette_free, quarter_pirouette_exit, wall_cartwheel_exit, deliberate_mat_falls, tuck_forward_roll_from_crow | exits/pirouettes/bails | none found (search not completed) | - | - | GAP |
| hs_incline_90/135_hold (Kinoshita), hs_wall_shoulder_taps, hs_wall_supported_shrugs, hs_finger_raises, hs_wrist_* (5 ids), hs_video_review | | none found | - | - | GAP; hs_video_review needs no demo |

### concurrent-strength-maintenance
| exercise_id | name | best source | URL | licence/embedding | notes |
|---|---|---|---|---|---|
| back_squat_highbar | High-bar back squat | existing: Squat University | https://www.youtube.com/watch?v=7v_V6xiA_AA | embed OK (200) | already set |
| front_squat | Front squat | existing: Andy Baker | https://www.youtube.com/watch?v=I5BkhSnHhbs | embed OK (200) | already set |
| block_pull_midshin | Block pull | existing: Alan Thrall | https://www.youtube.com/watch?v=jfSxbT-65ow | embed OK (200) | already set |

## Coverage (54 unique ids total: 20 + 31 + 3)
- Already has video: 3/54 (all strength).
- Good YouTube embed match (direct or close): ~22 more (pullup: hangs x2, negatives x2, ring rows x3, scap pull, hollow x1 + retraction; handstand: walks x7, kickup, wall walk, wall holds x2, hollow, tuck/free x2, pirouette none).
- Approximate/shared-video only: ~6 (first-attempt, GtG, partial, slow tempo, isometrics x2).
- GAP (nothing legal found): ~19 (band pull-up x2 video, hollow pullover, band shoulder prep, pirouettes/exits/bails x6, Kinoshita x2, shoulder taps, shrugs, finger raises, wrist x5).
- Counts are by my mapping above; re-count when wiring.

## Recommendation
1. Primary: official-player YouTube embeds (reputable, owner-enabled) - CrossFit's own channel for handstand walk, wall walk, ring row, kick-ups; Zack Henderson/Pike/Bulldog for pull-up bits. Add as `video_url` on the shared exercise (one URL can serve several variant ids). Use `youtube-nocookie.com`, no download/re-host. Fallback UI when a video is removed (oEmbed recheck in CI is cheap).
2. Do NOT ship free-exercise-db images until the image provenance is confirmed (Unlicense only covers the author's own work). Wikimedia GIFs: skip (tiny, CC BY-SA share-alike). ExerciseDB: skip (no caching clause conflicts with PWA/offline).
3. Gaps (~19, mostly wrist prep, pirouette/bail exits, Kinoshita): leave without video or film first; these are the owner's own-film priority list.
4. Safety note: several handstand/pull-up approximate matches show different technique than the program prescribes; use `start=`/`end=` and label as "reference demo".
