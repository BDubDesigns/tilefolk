# Tilefolk Next Steps

This file is the current working roadmap. Keep it short, update it as slices land, and use it to avoid losing the plot.

## Current State

Tilefolk has the core LLM-controller architecture working:

```txt
validActions
-> actionOptions
-> controller assignment
-> controller decision
-> selectedOptionId
-> selectedOption.action
-> apply action
-> event log
```

Core rule:

```txt
The controller selects.
The engine owns.
The reason explains.
```

Controllers choose option IDs from server-generated legal actions. They do not create actions, mutate the world, or bypass `ActionOption[]`.

Completed recently:

- Multiple controllers can run in the same world.
- Providers include deterministic, OpenCode Go, Google AI, and OpenRouter.
- LLM assignments support per-NPC model overrides.
- Provider error logging includes response bodies for easier debugging.
- OpenRouter visible context is wired into prompts.
- `getVisibleWorldContext` derives nearby NPCs, trees, and ground items.
- Event log shows controller provider/model, reason, and duration.

## Current Decision Point

OpenRouter now has eyes. The next question is whether to:

1. Give every LLM provider the same visible-context prompt.
2. Extract shared prompt formatting first so providers do not drift.
3. Show visible context in the UI for debugging.
4. Move toward deployment prep.

Recommended next slice:

```txt
Extract shared visible-context prompt formatting, then use it in OpenRouter, OpenCode Go, and Google AI.
```

Reason: every LLM provider should see the same world summary before we tune individual model behavior.

## Slice 1: Shared Visible Context Prompt Formatter

Goal: avoid duplicating visible-context text across provider clients.

1. Create a server-side prompt helper near the controller/prompt code.
   - Possible file: `apps/server/src/simulation/controllers/formatVisibleContextPrompt.ts`

2. Move OpenRouter's visible-context formatting into that helper.

3. The helper should accept `VisibleWorldContext`.

4. It should output compact prompt text:
   - visible radius
   - nearby NPCs or `None`
   - nearby trees or `None`
   - nearby ground items or `None`

5. Use the helper in:
   - OpenRouter
   - OpenCode Go
   - Google AI

6. Run checks.
   - `npm run typecheck`
   - `npm test`

7. Smoke test at least OpenRouter and OpenCode Go.

Suggested commit:

```txt
Share visible context prompt formatting
```

## Slice 2: Visible Context UI Debugging

Goal: make it easier to inspect what an NPC can currently see.

Possible UI locations:

- `NpcSummary` expanded details
- a small debug panel near the event log
- an active-NPC panel later

Important: the client should not recompute server-only prompt logic. If needed, expose visibility from the server or add a debug endpoint later. Do not rush this before the shared formatter slice unless debugging becomes painful.

## Slice 3: Provider Fallbacks

Goal: make public/live runs less brittle when a provider returns `429`, invalid JSON, or no content.

Possible first rule:

```txt
If selected provider returns null, fallback to deterministic.
```

Future richer rule:

```txt
OpenRouter model A -> OpenRouter model B -> deterministic
```

Keep this simple when we do it. The engine should still own final action validation.

## Slice 4: Deployment Prep

Target: Coolify on the existing Hetzner VPS.

1. Confirm production env vars are documented.
   - `TILEFOLK_ADMIN_TOKEN`
   - `TILEFOLK_DEFAULT_CONTROLLER`
   - `TILEFOLK_USE_SAMPLE_CONTROLLER_ASSIGNMENTS`
   - `OPENCODE_GO_API_KEY`
   - `OPENCODE_GO_MODEL`
   - `GOOGLE_AI_API_KEY`
   - `GOOGLE_AI_MODEL`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`

2. Confirm public behavior.
   - GET world works publicly.
   - Step/Reset require admin token.
   - API keys never ship to client.

3. Deploy with Coolify.
   - Set env vars in Coolify.
   - Attach subdomain.
   - Smoke test public read and admin mutations.

## Later Ideas

These are intentionally not part of the current slice.

- UI for changing an NPC controller live.
- UI for changing an NPC model live.
- Save controller assignment in world state instead of hardcoded config.
- Add OpenRouter model experiments and latency comparison.
- Add NPC personalities, goals, and memories.
- Add richer field-of-view details such as relative direction/distance.
- Add chop tree, wood, seeds, and richer item interactions.
- Add Mermaid diagrams for controller/model/visibility flow.
