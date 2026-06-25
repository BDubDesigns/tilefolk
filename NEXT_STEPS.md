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
- Tagged the axe/resource loop checkpoint as `v0.2.1`.
- Deployed the first public Tilefolk build to `https://tf.qcfailed.com`.
- Multiple controllers can run in the same world.
- Providers include deterministic, OpenCode Go, Google AI, OpenRouter, and Cerebras.
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
- Provider Test Panel MVP can run admin-protected decision-contract probes for configured Cerebras, OpenCode Go, OpenRouter, and Google AI models from the client.
- World state now tracks both `turn` and `round`, with rounds advancing after each full fixed-roster NPC cycle.
- Berry bushes exist as `world.bushes`, render on the map, block movement, appear in server-owned visible context, and can be carefully picked into temporary berry inventory items.
- NPC prompt preview and decision tracing are available for debugging controller behavior.

## Current Goal: Finish NPC Prompt Inspector And Decision Tracing MVP

Issue #20 is the active debugging/observability milestone.

Done:

- `buildNpcDecisionInput` is the server-owned prompt/action/context/memory bundle.
- `GET /api/debug/npcs/:npcId/prompt` returns the live current-state prompt preview.
- NPC summary includes a `View Prompt` debug affordance.
- Actual NPC decisions append run-owned traces to `world.debug.decisionTraces`.
- Decision traces snapshot `decisionInput` before action mutation, avoiding mixed pre/post-action state.
- `GET /api/debug/decision-traces` exposes chronological traces for direct debugging.
- The client decision trace panel shows newest traces first, supports NPC filtering, expandable trace details, prompt/raw JSON inspection, and copy buttons for all traces or a single trace.

Before PR:

1. Run final validation.
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`

2. Manually smoke-test the debug UI.
   - step several turns
   - inspect prompt previews
   - expand traces
   - filter by NPC
   - copy trace JSON

Follow-up cleanup after the MVP:

- Refactor `ActionController.chooseAction` to consume the shared `NpcDecisionInput` bundle directly instead of the server-only `ChooseActionOptions` shape.
- Goal: keep `decisionInput` as the single bundle used by controllers, prompt preview, and decision traces.

## Next Gameplay Goal: Continue Berry Bushes And First Food Loop

Berry bushes are the first renewable food source and the bridge from hunger ticking to meaningful food-seeking behavior.

Next food-loop slices:

1. Add a small eating seam.
   - Eating should be a separate action from picking.
   - Eating consumes food and reduces hunger.
   - Do not reduce hunger directly from harvesting.

2. Add berry regrowth.
   - Use round/world ticks rather than controller-authored behavior.
   - Keep regrowth server-owned and deterministic enough to test.

3. Consider a later destructive bush action.
   - Possible action: `stripBerryBush` or `destroyBerryBush`.
   - It may remove the bush and drop visible berries plus hidden berries.
   - Defer until stackable ground/inventory resources exist so it does not create a pile of one-off item IDs.

Future timing design before birth/death/sleep:

- Replace modulo-based active NPC selection with explicit per-round actor snapshots or equivalent turn-order state.
- Decide how newly born, dead, sleeping, or skipped NPCs enter/leave the active round.

Provider Test Panel follow-ups remain useful but are no longer the active slice:

- Support selected-provider runs instead of always testing every configured provider.
- Add richer diagnostics such as safe provider error bodies, token usage, cost hints, and parsed-decision validity details.
- Use the results to pick reliable live defaults before further deployment work.

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

## Completed: Deployment Prep

Target: Coolify on the existing Hetzner VPS.

Done:

- Express serves the built React client and API from one container.
- Added a Dockerfile and `.dockerignore`.
- Added `DEPLOYMENT.md`.
- Deployed to Coolify on `https://tf.qcfailed.com`.
- Verified the live homepage returns `200`.
- Verified `/api/health` returns `{ "status": "ok" }`.

## Slice 1: Post-Deploy Hardening

Goal: make the deployed app easier to trust and operate.

Status: mostly done; keep this stable while working on provider testing.

Done:

- Added `/api/status`.
- Client header shows app version, default controller, assignment mode, and mutation lock status.
- Step/Reset are admin-token protected when `TILEFOLK_ADMIN_TOKEN` is configured.
- Deployment docs and env var notes cover the current Coolify setup.

Remaining:

1. Add any missing operational checks if they become useful.
   - visible app version/checkpoint
   - current controller mode
   - whether sample assignments are enabled
   - server uptime or build timestamp if useful

2. Improve production safety.
   - confirm Step/Reset errors are friendly on the deployed site
   - add reset confirmation if it starts to feel risky
   - document the current in-memory world reset limitation

3. Decide persistence timing.
   - current world resets on container restart
   - choose whether to add file/database persistence before heavier public sharing

## Slice 2: Provider Experiments

Goal: keep controller latency low enough for live-ish simulation stepping.

1. Continue Cerebras testing.
   - compare paid-tier reliability against OpenCode Go and OpenRouter
   - keep tracking completion time during normal Tilefolk turns
   - watch cost and token usage once the app runs longer sessions

2. Keep provider selection behind the existing controller-assignment shape.

3. Keep model/provider defaults easy to change before deployment.

## Slice 3: Provider Model Config

Goal: let each NPC carry provider-specific model settings without hardcoding every experiment.

1. Extend controller assignments with optional provider config.
   - first target: `reasoningEffort`
   - keep provider-specific options optional
   - preserve current env-model defaults when no override is supplied

2. Use provider config inside decision clients.
   - Cerebras can use different reasoning effort values per model
   - future providers can add small typed options without changing the engine flow

3. Later, expose this in the client.
   - provider dropdown
   - model dropdown or text input
   - provider-specific advanced settings
   - save assignment in world state instead of only hardcoded config

## Completed: Provider Test Panel MVP

Goal: make provider/model reliability and latency visible from inside Tilefolk.

Done:

- Added an admin-protected server route for configured provider/model combos.
- Added server-owned provider target discovery from configured env values.
- Added decision-contract probes that require models to select a server-owned `ActionOption` ID.
- Added real provider probes for Cerebras, OpenCode Go, OpenRouter, and Google AI.
- Added no-network tests around target discovery, probe execution, route wiring, and scenario validity.
- Added a client panel that runs provider tests and displays provider, model, success/failure, latency, and message.
- Shared the controller decision system instruction across provider clients.
- Verified all four configured providers from the running app.

Follow-ups:

1. Add selected-provider runs.
   - list configured provider/model combos before running
   - allow checkbox selection
   - optionally run selected tests one at a time or with a small concurrency limit

2. Show richer measurements.
   - safe HTTP/provider error body details
   - time to first token when streaming is supported
   - total completion time
   - rough token usage/cost when the provider returns it
   - parsed decision validity

3. Use the panel to decide live simulation defaults.
   - compare OpenCode Go, OpenRouter, Google AI, Cerebras, and future providers
   - identify free endpoint rate-limit behavior
   - pick reliable defaults before deployment

## Follow-up Slice: Admin Auth Header Cleanup

Goal: modernize Tilefolk's internal admin-token header before more admin-only tools build on it.

1. Replace the legacy `x-tilefolk-admin-token` header.
   - prefer `Authorization: Bearer <token>` for admin-token protected requests
   - update the client request helper, server middleware, and tests together
   - keep `TILEFOLK_ADMIN_TOKEN` as the server-owned secret source

2. Update operator-facing docs.
   - mention the new header shape in deployment/admin-token notes
   - remove stale `x-` header references from tests or examples

## Follow-up Slice: Stackable Inventory / Resources

Goal: stop modeling naturally stackable resources as many one-off item IDs.

1. Introduce a small stackable inventory/resource seam.
   - Empty inventories should not list every possible resource at quantity `0`.
   - Prefer only showing stacks/resources that actually exist.
   - Berries are the first pressure point; wood can migrate later if needed.

2. Migrate temporary berry item IDs.
   - Current berry items use per-turn IDs as a short-term bridge.
   - Replace with a stack/count model before adding larger food, gathering, or destructive-harvest systems.

3. Keep eating behind a clear seam.
   - Eating should consume from inventory/resource state.
   - Hunger changes should happen through the eating action/application path, not harvesting.

## Follow-up Slice: Tooling Cleanup

Goal: remove dependency drift and keep local validation quiet/reliable.

1. Add a single quality-gate command.
   - add `npm run verify` for local and CI validation
   - start with `npm run lint`, `npm run typecheck`, and `npm run test` if lint is already stable
   - wire future GitHub Actions/CI to call the same command so local and CI checks do not drift

2. Decide TypeScript/tooling strategy.
   - current `package.json` declares TypeScript `^5.5.4`, but the lockfile resolves `5.9.3`
   - current `@typescript-eslint` 7.x warns because it officially supports TypeScript `<5.6.0`
   - choose either pinning TypeScript to a supported 5.5.x version or upgrading the ESLint/TypeScript-ESLint stack

3. Clean dependency metadata intentionally.
   - avoid unrelated `package-lock.json` churn during feature slices
   - run `npm install` only when dependency changes are intentional
   - include `package-lock.json` when package versions actually change

4. Validate the final tooling state.
   - `npm run verify`
   - confirm it covers lint, typecheck, and tests

## Later Ideas

- Replace temporary entity markers with real tile art/sprites.
- UI for changing an NPC controller live.
- UI for changing an NPC model live.
- Add provider/model experiments and latency comparison.
- Add richer provider fallback chains such as OpenRouter model A -> model B -> deterministic.
- Add NPC personalities and goals.
- Add rounds: `turn` advances every NPC action, `round` advances after every NPC has acted once.
- Use round-end ticks later for growth, hunger, tiredness, sleep, and other world processes.
- Add audio perception memories, such as hearing chopping from farther away than visual range.
- Add sleep/dream/memory compression once NPCs have enough memories for summarization to matter.
- Add seeds, crafting, and richer item interactions.
- Add Mermaid diagrams for controller/model/visibility/memory flow.
