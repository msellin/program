# Phase D — AI coach + full session flexibility

**Recorded:** 2026-08-06 by user request during the pre-travel push.

## What the user wants

Direct quote: *"we might even need to add some AI into the app at some point, to make it more personal and dynamic. this needs to be better than all the strength apps so far. needs to be on the same level as me talking to you right now, adapts to everything athlete does"*

Also this pass: *"change workout days or skip"* + *"dynamic or automatic feature that can reshedule or something"*.

## The gap

Right now the app is a very good deterministic tool:
- Weight suggestions from TM + prior sets + morning-check state
- Cycle-end adaptive engine (green/amber/red → TM bump/hold/reset)
- Waypoint acceleration when milestones are beaten
- Pause/resume calibration for gaps

But it can't:
- Have a conversation ("hey I only have 30 minutes today")
- Understand free text notes (the "notes" field is dead data)
- Recognise that yesterday's `hip felt tight` should soften today's Bulgarian split volume
- Re-plan a week around a business trip
- Explain WHY it made a decision in words the user chose

## The two tracks

### Track 1 — session flexibility (this pass, no AI needed)

Ships in this push before the user leaves. Non-AI. Deterministic:

- **Skip today** — mark today as skipped in the store. History shows an X instead of a dot. Streak doesn't break, but doesn't advance either.
- **Move today's session to a future date** — writes a `scheduled_overrides[date] = block_ids` entry. Today shows "Moved to <date>." The adaptive engine treats skipped-because-moved differently from skipped-because-red.
- **Auto-reschedule missed session** — if today was Mon squat and it's now Wed with no log, auto-suggest doing it today; downstream days shift by 1.

Data model additions to `Store`:
```ts
scheduled_overrides?: Record<string, { blocks: string[]; reason?: string }>;
skipped?: Record<string, { reason?: string; moved_to?: string }>;
```

### Track 2 — AI coach (Phase D, needs backend)

Vision: a chat panel on any screen. User types free text. Model reads:
- Current phase, cycle week, TMs
- Recent log entries (last 30 days)
- Recent symptom trend
- Clinical context (as system message)
- Adaptive engine state

Model can:
- Answer questions ("why is today's squat so light?")
- Propose plan changes ("I'm travelling next week, no rack — what do I do?")
- Suggest form corrections based on notes ("the left side felt weak on split squats" → propose more single-leg RDL volume)
- Interpret symptoms in context ("groin 4/10 after a heavy pull day is different from 4/10 after rest")
- Explain the current recommendation in the user's own vocabulary

### Architecture options for Phase D

- **Cloudflare Workers + Anthropic API.** Workers proxy the API call, add auth, add rate limiting. User's data goes with each request as system context. Static frontend still on Pages.
- **VPS backend + Anthropic API.** More flexibility, more ops burden. Better for eventually adding Postgres, auth, cross-device sync.
- **Local-first with client-side call to Anthropic.** Simplest but exposes API key to browser — bad idea for a real key.

Recommendation: VPS route (aligned with the "let's use the VPS for persistent data anyway" decision from earlier). Postgres for state, Node service for the coach endpoint, JWT auth. Frontend calls `/api/coach` with the user's message + full context.

### What "same level as talking to Claude" means concretely

- Streaming responses (not spinner-then-blob)
- Model has FULL context: program.json, exercises.json, clinical-context.json, entire log history, current adaptive engine state
- Model can propose actions (change TM, skip a day, reschedule) as structured tool calls that the app presents as one-tap approvals
- Model remembers the last N conversations (thread history) so "as I said yesterday" works
- User can annotate any log entry via voice or free text and the model interprets on their next check

### Order of operations

1. Track 1 (session flexibility) — this push
2. VPS backend + Postgres — sometime after travel, replaces localStorage as source of truth
3. Coach endpoint hitting Anthropic API — Phase D proper
4. Chat UI with streaming
5. Tool-call approvals (structured adaptations proposed by the model)

## Notes for the model when we build Phase D

- The system prompt should include the clinical context verbatim
- The system prompt should include the current phase + cycle week + TMs
- The system prompt should carry the non-negotiables from `program.json.goals.non_negotiables`
- Do not let the model propose changes that violate `clinical-context.json.provocative_positions` — enforce as tool-call validation
- Do not let it silently drop symptoms; every recommendation must show the symptom trend that informed it
- Response should be terse in the app's editorial voice — no motivational padding, no emoji
- Model should know it is a companion to a physio, not a replacement, and hard-escalate red flags

## Anti-goals

- Not a generic AI wrapper
- Not a chatbot for random questions
- Not a data collector
- Not something that sends messages when the user isn't opening the app
- Cannot substitute for the physiotherapy appointment (`program.json.immediate_actions[1]`)

## The non-negotiable: **never lose the progressive approach**

User quote 2026-08-06: *"but never loses the progressive approach"*.

Whatever the AI proposes, whatever reschedule the user does, whatever skips accumulate — the progression engine must keep the trajectory pointing UP. Concrete rules:

- A skip is never "counted as complete." The next scheduled session picks up where the last completed session left off, at least matching that load.
- A missed cycle does not silently reset TMs down. Only measured under-performance (failed AMRAP, red symptoms) reduces TM.
- A pause auto-inserts calibration (already built in `evaluateCycleEnd` + `detectPauseResume`) but the calibration is a stepping stone back to the trajectory, not a new floor.
- The AI coach may explain, contextualise, and re-schedule, but it CANNOT flatten the plan. Every generated week must include progressive overload signal — either weight, volume, density, or unilateral work.
- "Deload" is only a deload if the next week is heavier than the deload week. Otherwise it's just a lighter week that never ends.
- Long-term projection UI on Progress must ALWAYS show a rising line to the next milestone. If actual is lagging projection, the app compresses the ramp forward, it doesn't lower the target.

The progressive approach IS the product. Rules for anyone (human or model) touching the plan.
