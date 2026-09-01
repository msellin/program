# Video-analysis spike harness

Throwaway rig for measuring real clips before any app code exists. Lives here so
the validated measurement logic survives a session ending — the earlier copy was
in a temp scratchpad and had to be rebuilt from scratch once already.

## Run it

Add to `.claude/launch.json` (and remove it again afterwards — it points at a
personal Downloads folder):

```json
{ "name": "pose-spike", "runtimeExecutable": "node",
  "runtimeArgs": ["dev/active/video-analysis/harness/server.js"], "port": 8899 }
```

`server.js` serves this directory, exposes `~/Downloads` under `/vid/`, and
accepts POSTed frames and JSON at `/save` (written to `out/`). It hand-rolls HTTP
Range support on purpose: `python3 -m http.server` ignores Range, so the browser
cannot seek inside a large file and silently re-draws the same early frame — that
cost a whole run on 2026-08-31.

Then drive `index.html` from the browser tools:

```js
await window.probe('/vid/CLIP.mp4')                       // duration, dimensions
await window.thumbs('/vid/CLIP.mp4', 'tag', 8)            // evenly spaced stills
await window.frames('/vid/CLIP.mp4', 'tag', [7.4, 10.3])  // stills at exact times
await window.runClip('/vid/CLIP.mp4', 'tag', 'lite', 10)  // pose -> out/tag_lite_landmarks.json
await window.runClip('/vid/CLIP.mp4', 'tag', 'lite', 60, 9.2, 11.2)  // window at 60 fps
```

Three clips in one call exceeds the 30 s JS tool timeout. Run them one at a time —
the work still completes and writes its file even when the call reports a timeout,
so check `out/` before re-running.

## measures.js

The validated primitives, with the evidence and the refuted approaches recorded
in comments. Import it in Node against a saved `*_landmarks.json`.

Regression check (needs the fixtures — see below):

```
node -e "…"   // see the verification block in context.md, or re-derive:
              // countSupports must give 4 / 2 / 0 / 0 on bandA/bandB/ringA/ringB
```

**The rule the whole file is built on**, derived from five failures in one
session: a measure must be a *difference normalised by an intrinsic body scale*,
cross-checked against at least one *independent* second condition. Every measure
built as a single scalar comparison in raw image coordinates was confounded.

## Fixtures

`out/*_landmarks.json` are the recorded landmark dumps — the fixtures V1-7 wants
so analyser tests can run in CI without media. They are **not committed**: they
are ~1 MB each, they derive from third parties' training videos, and they
regenerate in about a minute per clip from the source files. Decide deliberately
before adding them.

The clips themselves are never committed and never leave the machine.
