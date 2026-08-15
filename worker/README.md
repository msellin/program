# program-coach — Cloudflare Worker

AI coach endpoint for the training PWA. Proxies the Anthropic Messages API with
a system prompt built from `program.json` + `exercises.json` + `clinical-context.json`
(fetched from `FRONTEND_ORIGIN`) plus per-request user state.

## What it does
- `POST /api/coach` → SSE stream of Claude Sonnet's response
- `GET /api/health` → `{ok: true, model: "..."}`
- CORS locked to `FRONTEND_ORIGIN`
- Prompt-caches the static program/clinical block across turns (saves ~$0.02/turn once warm)

## Deployment (~5 minutes)

```bash
cd worker
npm install
# One-time: set your Anthropic API key as a Worker secret
wrangler secret put ANTHROPIC_API_KEY
# Deploy
npm run deploy
```

Wrangler prints the worker URL (something like `https://program-coach.margussellin.workers.dev`).

## Wire the frontend to the worker
1. In the frontend build/env, set `NEXT_PUBLIC_COACH_URL=https://program-coach.margussellin.workers.dev`
2. Add that URL to the frontend's CSP `connect-src` in `next-app/public/_headers`
3. Rebuild + redeploy the Pages app

Once both are up, the `/coach` route in the app becomes functional.

## Tighten it up later
- **Cloudflare Access**: gate `program-coach.*.workers.dev` behind your email in the Cloudflare dashboard → Zero Trust → Access → Applications. Free tier, no code changes needed.
- **D1 database**: add a D1 binding in `wrangler.toml`, store chat threads server-side, migrate localStorage on first authenticated visit. Future work — everything today lives in the client's localStorage.

## Cost expectation
- Sonnet 4.6: ~$3 / M input tokens, ~$15 / M output tokens
- Static context ~5-8K tokens (program + exercises + clinical) — cached after first turn (~90% reduction)
- Typical turn: 200-800 output tokens
- At heavy use (100 messages/month), monthly cost < $2

## Model choice
Default `claude-sonnet-4-6`. Change in `wrangler.toml`. Options:
- `claude-opus-4-7` — best but 5× the cost
- `claude-sonnet-4-6` — recommended sweet spot (current default)
- `claude-haiku-4-5-20251001` — cheapest, fast, less nuanced advice

## Local dev
```bash
wrangler dev
# Runs on http://localhost:8787
# In the frontend .env.local: NEXT_PUBLIC_COACH_URL=http://localhost:8787
```
