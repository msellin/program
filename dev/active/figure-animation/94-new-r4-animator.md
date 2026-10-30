# 94 animator: new figures r4 rescore (2026-10-30)
Evidence: new-r4/strips/sheet-01/02.png (16 frames), new-r2/jumps.mjs re-run, lanes 86/87. Previous: 94-new-r3.

| figure | r3 | now | max jump (r4) | note |
|---|---|---|---|---|
| threadneedle | 9 | 9 | 5.9 px @4752 ms | head gap 27 -> 23 px, wrist >= 18.7 px off head; arm still crosses trunk |
| hipflex | 9 | 9 | unchanged | CEILING rehab hold |
| arch | 9 | 9 | unchanged | CEILING thumb scale; near arm beside ear ruled correct |
| dbrow | 10 | 10 | unchanged | |
| pulldown | 10 | 10 | unchanged | |
| fingertaps | 9 | 9 | 4.8 px @99 ms | set-down 0.22 s; the 6.1 px set-down is gone (max now at loop start, 99 ms) |
| hollowrock | 10 | 10 | unchanged | reduced-motion ghost ruled house convention |
| elbowstand | 10 | 10 | unchanged | |
| crowroll | 9 | 10 | 4.3 px @3069 ms | met my ~4.5 px route; strip reads chin lead, vertical, back, settle, poster mid-roll |
| matfall | 9 | 10 | 5.9 px @4719 ms | met my < 6 px route (was 7.4); swing now 58 deg, turn reads as a bail not a flail |
| cartwheel | 9 | 9 | 5.5 px @1452 ms | see below |

Seams: all strips end on the frame-0 pose; matfall/cartwheel fade reset unchanged. No draw-order or limb pop in the r4 strips.

- [L] cartwheel (9): 5.5 px sits exactly at my < 5.5 route, not under it, and the peak now falls at 1452 ms in the wheel itself (hand-to-foot transfer), so it is the wheel's fastest beat rather than a flaw. Route: shave 0.3 px off the first-foot swing (any ease-in on the 1.3-1.5 s leg pass) and I score 10.
- [L] threadneedle (9): CEILING flat side view, the arm must cross the trunk line to read as a thread; 5.9 px at 4752 ms is the return unwind, acceptable for a 11 s move2.
- [L] fingertaps (9): CEILING, tip lift is ~3 px at 56x40 for a side-on wall lean at thumb size; motion itself (4.8 px) is now light.
- hipflex (9): CEILING, rehab hold allows no joint motion beyond breath (rig.ts / CLAUDE.md).
- arch (9): CEILING, 200 px lying figure in a 1.4:1 thumb; the 1.5 px breath is below thumb visibility.
No [H] items.

## r4 recheck: cartwheel
- jumps.mjs: max 5.4 px @1419 ms (was 5.5 @1452); under my 5.5 route by 0.1 px only, not the 0.3 I asked for.
- Turn onset per 33 ms frame (max vertex): 759 ms 0.0, 792 ms 1.3, 825 ms 3.0, then 3.0-3.9 px to 990 ms. Start is a 1.3 px ramp frame then a 1.7 px step: no pop, but it reads as a near-instant start (about 33 ms ease-in) rather than a gradual one. The 1023 ms 18.7 px is a slot-list change (draw-order swap), not motion.
- Score 9. CEILING: a 2D side-on wheel hands feet and hands over in one beat (5.4 px peak), and a 10 would need a ~100 ms ease-in at 760 ms, which LIN 0.55 does not give. Acceptable, not a flaw.
