# 01 In-app user value (lens). Scores 1-10, 10 = best. Costs at 100 active users, Haiku 5.5 unless noted.

Grounding: note signals are hand-written regex (`engine/note-signals.ts`, EN + some ET); `note-keywords.ts` is a counts-only review queue; `symptom-state.ts` is the gate; `record/` and `report/` pages exist; `citations.json` + exercises are shared copy.

1. **Note-to-signal suggestion in the morning check (confirm-first chip).** Free-text note, e.g. "põlv kriuksus trepist alla tulles" or "slept badly, long drive", is sent to the model. The model returns only a pick from the existing signal enum (travel, poor-sleep, flare, ...). The app shows "Looks like: poor sleep. Use it?" and the user taps to confirm. The gate never sees the model output. Sends: one short note, no id, no log. Cost: ~$0.05/mo. Risk: GDPR Art. 9 (a note is health data), so needs opt-in consent and a DPA. Fallback is the current regex. Value: 6. Real gain is Estonian, slang and typos, where regex fails silently. Weakness: the user could just tick a chip, so this beats a chip row only if people really type free text. Check the keywords endpoint for how many notes the regex misses before building.

2. **Offline vocabulary mining (no user data leaves).** Feed the model only the counts-only unmatched-token list from `/api/admin/keywords` (tokens, not notes) and have it propose regex additions as a diff for the founder to review. Internal only. Cost: under $1/mo. Risk: near zero, the founder commits the regex. Value: 5. Cheap and fits the existing review queue, but a human could do it in 10 minutes a month. An LLM adds little.

3. **Exercise Q&A grounded in app copy ("Ask about this drill").** Retrieval over the exercise's cues, rationale, overrides and linked `citations.json` entries. The model must answer only from that text with citation ids, and refuse otherwise ("ask your physio"). Sends: the question plus public shared copy, and no log data if the prompt is built that way, which avoids most Art. 9 risk (the question may still hint at a condition, so redact or warn). Cost: ~3 questions/user/mo x 3K tokens = about $0.30. Risk: hallucinated medical advice. Mitigate with a post-check that every claim has a quoted span and a "not medical advice" footer. Value: 6. Users do ask "why this, can I swap it?" mid-session. But it edges toward chatbot scope and must be fenced hard. A static "Why this drill" line already exists and covers most of the need.

4. **Appointment brief polish on Record/report (for a specialist).** Code builds the factual timeline and numbers. The model only rewrites it into a neutral half-page summary, with every figure checked against the input (reject output that introduces a number or word not in the source). Sends: the user's de-identified log summary, which is the most sensitive payload of any idea here. Needs explicit per-click consent. Cost: ~$0.20/mo. Value: 4. Templates already do 90% of this, and the founder panel already rejected LLM prose for insights. A "Copy for clinician" template gives the same value with no data flow. An LLM adds little.

5. **Intake free-text to program match.** "I want to do a pull-up and my elbow hurts" returns a suggested program plus a symptom-region pre-select. The user confirms and the safety gate is untouched. Sends: one sentence, pre-account. Cost: negligible. Value: 5. Helpful where the 9-program catalog is confusing, but a good picker and category filter likely does the same. Don't send a free-text health sentence before consent exists.

6. **Swap-reason triage.** "No barbell at hotel" or "shoulder pinchy" maps to candidate swaps already in `exercises.json` class modifications. The model ranks from the allowed list only, and the user accepts. Value: 4. Allowed-list filtering by tag does the same without an LLM, and the model could only pick from what code already offers.

7. **Onboarding or program-preview localisation (Estonian).** Batch-translate static copy. This is build-time, uses no user data, and is cheap with the Batch API. Value: 5 if ET users are a goal, otherwise 2. Needs a human pass for clinical wording.

Where an LLM adds little: session done screen (template numbers are better, and already decided), swaps, report prose, onboarding steps.

**Top 3**
1. Note-to-signal suggestion (#1), but only if the keywords endpoint shows the regex misses real notes. Check first.
2. Grounded exercise Q&A (#3), tightly fenced, no log data in the prompt.
3. Offline vocabulary mining (#2), a zero-risk starter that proves the plumbing before any user data is sent.
