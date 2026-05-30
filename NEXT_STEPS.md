# Tilefolk Next Steps

This is the active roadmap. Keep it short, update it after meaningful milestones, and use it to avoid losing the plot.

## Current State

Tilefolk has a working LLM-controller simulation loop:

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

Controllers choose option IDs from server-generated legal actions. They do not create actions, mutate the world, or bypass `ActionOption[]`.

Completed recently:

- Tagged the first working checkpoint as `v0.1.0`.
- Multiple controllers can run in the same world.
- Providers include deterministic, OpenCode Go, Google AI, and OpenRouter.
- LLM assignments support per-NPC model overrides.
- Controller labels show provider and effective model, including env defaults.
- `getVisibleWorldContext` derives nearby NPCs, trees, and ground items from shared types.
- Visible-context prompt formatting is shared by all LLM providers.
- Visible-context prompts include relative direction and distance for visible entities.
- Move action options include destination coordinates.
- Event log shows controller provider/model, reason, and duration.
- LLM providers fall back to deterministic selection when they return no usable decision.
- Towel pass extracted shared controller prompt building and shared controller decision parsing.

## Current Goal: Memory And Witnessed Events

NPCs still receive global recent events. That is useful for testing, but it breaks simulation truth because NPCs can react to things they should not know happened.

Next goal: make NPC knowledge local.

## Slice 1: Add Event Witnessing Foundation

Goal: events should have positions and NPCs should only learn about events they could witness.

1. Confirm every world event has a useful `position` when an action happens.

2. Design the memory shape before coding:
   - memory id
   - npc id
   - source event id
   - turn witnessed
   - message
   - position

3. Decide the SSOT:
   - `world.events` stores objective history
   - `npc.memories` stores that NPC's subjective remembered history

4. Add a helper:
   - possible name: `addMemoriesForWitnesses`
   - input: world, event, radius
   - output: updated world or mutated draft world, matching the current `stepWorld` style

5. Acceptance criteria:
   - actor remembers its own action
   - nearby NPCs remember visible events
   - faraway NPCs do not remember events
   - tests prove witness radius behavior

## Slice 2: Use Memories In LLM Prompts

Goal: controller prompts should use NPC-local knowledge instead of global recent events.

1. Replace `world.events.slice(-5)` in controller resolution with `getRecentMemoriesForNpc({ npc })`.

2. Keep visible context separate from memory:
   - visible context: what the NPC can see now
   - memories: what the NPC witnessed before

3. Acceptance criteria:
   - LLM prompt no longer includes global events
   - deterministic controller behavior is unchanged
   - tests prove NPCs do not receive unrelated faraway events

## Slice 3: Chop Tree Action

Goal: make the axe matter.

1. Add valid chop action only when:
   - NPC has an axe
   - tree is adjacent or in allowed range

2. Apply chop action:
   - reduce tree hit points
   - remove tree or convert it when hit points reach zero
   - eventually create wood/seed items

3. Add action options and prompt descriptions for chopping.

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

## Slice 5: Provider Experiments

Goal: keep controller latency low enough for live-ish simulation stepping.

1. Add Cerebras as another LLM provider option.
   - evaluate free-tier limits
   - test time to first token and tokens per second
   - compare reliability against OpenCode Go and OpenRouter

2. Keep provider selection behind the existing controller-assignment shape.

3. Do not make Cerebras the default until it has been tested in normal Tilefolk turns.

## Later Ideas

- UI for changing an NPC controller live.
- UI for changing an NPC model live.
- Save controller assignment in world state instead of hardcoded config.
- Add provider/model experiments and latency comparison.
- Add richer provider fallback chains such as OpenRouter model A -> model B -> deterministic.
- Add NPC personalities and goals.
- Add wood, seeds, crafting, and richer item interactions.
- Add Mermaid diagrams for controller/model/visibility/memory flow.
