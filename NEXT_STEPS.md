# Tilefolk Next Steps

This file is the current working roadmap. Keep it short, update it as slices land, and use it to avoid losing the plot.

## Current Goal

Add OpenRouter as a third LLM decision provider while preserving the existing controller architecture:

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

Controllers still choose option IDs. They do not create actions, mutate the world, or bypass server-owned `ActionOption[]`.

## Slice 1: Finish OpenRouter Provider

Status: in progress.

1. Add OpenRouter config to server env.
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
   - `isOpenRouterConfigured`
   - Keep real values only in `apps/server/.env`.
   - Keep fake/example values in `apps/server/.env.example`.

2. Extend controller assignment types.
   - Add `openrouter` as an LLM provider.
   - Assign one sample NPC to OpenRouter for local comparison.

3. Create `openRouterDecisionClient.ts`.
   - Match the shape of the other decision clients.
   - Input: `npc`, `recentEvents`, `actionOptions`.
   - Output: `ControllerDecision | null`.
   - Return only `{ selectedOptionId, reason }`.
   - Use low token limits and short prompts to keep latency low.

4. Wire OpenRouter into `resolveControllerDecision`.
   - Add the import.
   - Add a switch case for `openrouter`.

5. Run checks.
   - `npm run typecheck`
   - relevant tests, or full `npm test` if time allows

6. Manual smoke test.
   - Step the world until each sample controller acts.
   - Confirm event log shows controller labels and durations.
   - Confirm OpenRouter decisions move/wait through normal server-owned actions.

7. Commit.
   - Suggested message: `Add OpenRouter decision provider`

## Slice 2: Finish Admin Token Client UX

Status: mostly done.

1. Keep public reads working without a token.
2. Keep Step/Reset protected by `x-tilefolk-admin-token`.
3. Keep action errors local to the controls, not the whole page.
4. Manually test:
   - no token rejects Step/Reset without losing the world view
   - wrong token shows a friendly control-level error
   - correct token allows Step/Reset
   - refresh restores token from `sessionStorage`
   - clearing input removes token from `sessionStorage`
5. Commit if not already committed.
   - Suggested message: `Add admin token controls for world mutations`

## Slice 3: Better Controller Configuration

Current assignment is provider-level:

```txt
npc_0 -> opencode-go
npc_1 -> google-ai
npc_2 -> openrouter
npc_3 -> deterministic
```

Future target is model-aware assignment:

```txt
npc_0 -> provider: opencode-go, model: deepseek-v4-flash
npc_1 -> provider: google-ai, model: gemma-4-26b-a4b-it
npc_2 -> provider: openrouter, model: provider/model-name
npc_3 -> deterministic
```

Do this later, after OpenRouter works with one default model.

Possible shape:

```ts
type ControllerAssignment =
  | { type: 'deterministic' }
  | { type: 'llm'; provider: 'opencode-go' | 'google-ai' | 'openrouter'; model?: string };
```

Reason:

- The provider chooses the API/client.
- The model chooses the specific brain inside that provider.
- Defaults can still come from env.
- Per-NPC overrides can come later.

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
- Add NPC personalities, goals, memory, and field-of-view prompts.
- Add chop tree, wood, seeds, and richer item interactions.
- Add Mermaid diagrams for new controller/model assignment flow.
