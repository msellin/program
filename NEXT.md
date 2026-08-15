# Next

What to do after the daily-use habit is established. Ordered by honest value, not by ease.

## Clinical — do these regardless of the app

1. **Answer Q4 (inflammatory screen) in `data/open-questions.json`.**
   Ask the GP about HLA-B27, CRP, ESR. Track morning stiffness duration, whether back
   pain is better with movement, whether waking happens in the second half of the night.
   If features are present, this stops being a training question. **Do this before
   anything else on this list.**

2. **Book the physiotherapy appointment.** `program.json.immediate_actions.priority: 1`.
   Two prior referrals went unused. Nothing in this app substitutes for it.

3. **Answer Q1, Q2, Q3 in `data/open-questions.json`** (current symptoms; clicking status;
   squat/deadlift tolerance). Then either fill in the `answer` fields and regenerate
   `program.json`, or hand the answers to Claude and ask for the regeneration. This flips
   `status` from `PROVISIONAL` to real.

## App — do these only if the habit sticks (2+ weeks of daily use)

4. **Export / import button.** Insurance against phone-wipes. Dumps `localStorage` to a
   JSON file (email/AirDrop to self), reads it back. ~30 min work. Also becomes the
   migration file the day a backend gets added.

5. **Curated video per exercise.** Add `video_url` to each entry in `exercises.json`,
   render as a small thumbnail on the card instead of the current YouTube-search link.
   Content work: source ~24 vetted videos. UI work: small.

6. **Cloudflare Access on the URL.** Only if the public URL bothers you. Data is
   de-identified already, so this is preference not necessity. Free tier covers it.

## App — only if single-device stops being enough

7. **Sync backend.** Supabase is the natural fit (host-neutral, free tier covers this
   size forever). Migration path: export from `localStorage`, POST to the API once,
   mark migrated, read from API onward. Shape is already the right shape.

8. **Custom domain.** Only really matters *before* a host change, so localStorage
   survives the move. If you never leave Cloudflare Pages, `program-f3r.pages.dev`
   is fine.

## Ops reference

- Live URL: **https://program-f3r.pages.dev**
- Project: Cloudflare Pages, project name `program`, production branch `main`
- Redeploy after edits (from `/Users/margussellin/www/program`):
  ```
  wrangler pages deploy . --project-name=program --branch=main --commit-dirty=true
  ```
- Vercel is not available on this account — the `sellinmargus-projects` team hit
  fair-use limits and was blocked. Cloudflare Pages was picked because of that,
  not because it's better. Portable either way — pure static files.
