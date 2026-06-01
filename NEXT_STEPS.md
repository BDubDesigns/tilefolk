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
- Tagged the NPC-local memory milestone as `v0.2.0`.
- Preparing the axe/resource loop checkpoint as `v0.2.1`.
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
- NPC-local memories now track witnessed events.
- LLM prompts now use NPC-local memories instead of global recent events.
- NPCs can pick up axes, chop adjacent trees, deplete tree durability, drop wood, and pick up that wood.

## Current Goal: Deployment Prep

Get Tilefolk ready for a small public read-only deployment:

- Public visitors can view the world.
- Step/Reset stay protected by the admin token.
- Server-only provider keys are documented for Coolify.
- The deployed app can run the same mixed-controller world as local dev.

## Completed: Memory And Witnessed Events

Goal: events should have positions and NPCs should only learn about events they could witness.

Done:

- `world.events` stores objective history.
- `npc.memories` stores each NPC's subjective remembered history.
- Positioned events create memories for nearby witness NPCs.
- Controller prompts use `getRecentMemoriesForNpc({ npc })` instead of global recent events.
- Tests cover witness radius behavior, snapshots, and recent memory lookup.

## Completed: Chop Trees And Resource Drops

Goal: make the axe matter and produce the first useful resource.

Done:

- Chop tree actions are valid only when an NPC has an axe and is close enough to a tree.
- Chop actions reduce tree hit points.
- Depleted trees are removed from the world.
- Depleted trees drop wood at the tree position.
- Wood uses the normal item/location model and can be picked up by NPCs.
- Event logs and nearby memories continue to record the action loop.
- Tests cover valid chop actions, tree depletion, wood placement, and original-world non-mutation.

## Slice 1: Deployment Prep

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

## Slice 2: Provider Experiments

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
- Add rounds: `turn` advances every NPC action, `round` advances after every NPC has acted once.
- Use round-end ticks later for growth, hunger, tiredness, sleep, and other world processes.
- Add audio perception memories, such as hearing chopping from farther away than visual range.
- Add sleep/dream/memory compression once NPCs have enough memories for summarization to matter.
- Add seeds, crafting, and richer item interactions.
- Add Mermaid diagrams for controller/model/visibility/memory flow.
