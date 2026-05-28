# Tilefolk Next Steps

This file is the current working roadmap. Keep it short, update it after meaningful milestones, and use it to avoid losing the plot.

## Current State

Tilefolk has the core LLM-controller architecture working:

```txt
validActions
-> actionOptions
-> visible context
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
- Controller labels show provider and effective model, including env defaults.
- Provider error logging includes response bodies for easier debugging.
- `getVisibleWorldContext` derives nearby NPCs, trees, and ground items.
- `getVisibleWorldContext` now lives in `@tilefolk/shared`.
- OpenRouter, OpenCode Go, and Google AI all receive the same visible-context prompt block.
- Visible-context prompt formatting is shared by all LLM providers.
- Visible-context prompts now include relative direction and distance for visible entities.
- Move action options now include destination coordinates.
- Event log shows controller provider/model, reason, and duration.

## Current Goal: Visible Context UI Debugging

We saw a model reason about a tree in a way that might have been either:

1. correct, because the tree was visible, or
2. hallucinated, because the prompt had no nearby tree.

The next slice is to make that inspectable in the UI.

## Slice 1: Add NPC Visible Context Debug Panel

Goal: show what each NPC can currently see using the same shared helper the server uses for prompts.

1. Use `getVisibleWorldContext` from `@tilefolk/shared` in the client.

2. Add visible-context output to the existing NPC details, or create a small component:
   - possible file: `apps/client/src/features/world/NpcDebugPanel.tsx`

3. For each NPC, show:
   - id/name
   - position
   - visible radius
   - nearby NPCs
   - nearby trees
   - nearby ground items
   - inventory

4. Keep it collapsible with `<details>` so the main UI does not become noisy.

5. Manual test:
   - step the world
   - when a model mentions an object, open that NPC's debug details
   - verify whether the object was actually visible

6. Run checks:
   - `npm run typecheck`
   - `npm test`

Suggested commit:

```txt
Show NPC visible context in debug panel
```

## Slice 2: Provider Fallbacks

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

## Slice 3: Deployment Prep

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
- Add chop tree, wood, seeds, and richer item interactions.
- Add Mermaid diagrams for controller/model/visibility flow.
