# Redesign P0: context

**Plan.** `redesign-p0-plan.md`. Built from the design review in `dev/active/design-review-2026-10-28/`.

**Owner decisions, 2026-10-28.**
- Visuals: A (SVG figures) now, B (own videos) planned.
- C is the legal stopgap: official YouTube embeds of short clips, plus Pixabay and Pexels stock, which can be self-hosted.
- Never screen-record or re-host third-party YouTube.

**Demo links.** The 28 unvetted links were pulled because the owner found them too long or off-movement. The curator is
producing `demo-clips.md` with frame-checked Shorts and segments.

**Harness.** `launch-gaps.spec.ts` answers the quick start's "None of these". The intake now takes 4 captures instead of 18.

**Next steps.**
1. Apply the approved clips to `exercises.json` (fields `video_url`, `video_start`, `video_end`).
2. Deploy.
3. Re-shoot the ad path.
4. Rescore 1–10.
