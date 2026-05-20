# Tilefolk Next Steps

## Current Status

- MERN TypeScript monorepo scaffold is in place.
- Shared domain types exist for worlds, tiles, NPCs, items, trees, positions, actions, directions, and events.
- `directions` is the shared source of truth for movement direction values, and `Direction` is derived from it.
- Server world generation creates a 50x50 grass world with NPCs, trees, axe items, turn tracking, and an empty event log.
- Express exposes world fetch, reset, and step endpoints.
- React fetches the active world, renders a grid, shows NPC/tree/item markers, and provides manual step/reset controls.
- React displays world summary, current turn, latest action result, and the latest 5 world events.
- `stepWorld` supports turn-based actor selection, valid-action movement, wait fallback, turn increments, immutable world updates, and event logging.
- `getValidMovementActions` returns legal movement actions for an NPC based on bounds and occupied destination tiles.
- Test, typecheck, and lint scripts are passing at the latest known checkpoint.

## Completed Milestones

### Serve The World

- `GET /api/worlds/default` returns the active generated world.
- `POST /api/worlds/reset` resets the active world.
- `POST /api/worlds/default/step` advances the active world one turn.
- Route tests cover the basic endpoint contracts.

### Render The World

- `WorldGrid` renders the tile grid.
- Entity overlay renders NPCs, trees, and ground items separately from tiles.
- `WorldSummary` renders world id, dimensions, entity counts, and turn.
- `SimulationControls` renders step/reset controls and latest action result.
- `EventLog` renders the latest 5 world events.

### Basic Simulation Engine

- `stepWorld` chooses the active NPC from `world.turn`.
- `stepWorld` asks `getValidMovementActions` for legal moves instead of duplicating movement legality checks.
- `stepWorld` applies the first valid movement action deterministically for now.
- Boxed-in NPCs perform a wait action.
- Movement and wait actions advance the turn when an NPC exists.
- Events are appended for NPC actions.
- Existing world state is copied rather than mutated directly.

### Valid Movement Action Generation

- `getValidMovementActions` can answer which movement actions are legal for an NPC.
- It filters out moves that leave world bounds.
- It filters out destinations blocked by trees, ground items, and other NPCs.
- It returns an empty array when the NPC does not exist.

### Use Valid Actions In `stepWorld`

Goal: make `stepWorld` consume generated valid actions instead of duplicating movement legality checks internally.

Completed behavior:

- Active NPC is still chosen from `world.turn`.
- `stepWorld` calls `getValidMovementActions` for the active NPC.
- If movement actions exist, `stepWorld` chooses one deterministically for now.
- The chosen action is applied to the copied world.
- `actionResult.action.direction` matches the chosen action.
- Event log records the action result.
- Turn still advances after the NPC acts.
- Boxed-in NPCs wait instead of failing.
- Tests were updated to focus on stable behavior instead of stale east-only behavior.

## Current Milestone: Extract Deterministic Action Selection

Goal: move the temporary action chooser out of `stepWorld` so controllers can plug in later.

### Task 1: Create Deterministic Selector

Acceptance criteria:

- Create a selector helper for deterministic action choice.
- The selector receives legal actions and chooses one predictably.
- `stepWorld` no longer directly uses `validMovementActions[0]`.
- Wait fallback remains available when no movement actions exist.
- Tests prove selector behavior separately from world mutation.

### Task 2: Prepare Controller Boundary

Acceptance criteria:

- The code shape makes it clear where player, deterministic, and LLM controllers will plug in.
- Controllers choose from legal actions; they do not validate world state themselves.
- `stepWorld` still owns applying the selected action and recording events.

## After That

Next larger milestones:

- Introduce a deterministic controller abstraction.
- Add a player/manual controller path.
- Add pickup validation and inventory transitions.
- Add inspect validation and memory creation.
- Add chop-tree validation for NPCs holding an axe.
- Add LLM action selection only after deterministic action generation/application is solid.

## Long-Term State Model

Tilefolk should move toward event sourcing lite:

- Save the initial world state once.
- Append an event for every accepted or rejected action.
- Derive the current world by replaying events onto the initial world.
- Add occasional snapshots later so old simulations can load quickly without replaying every event from tick 0.

For the current learning version, keeping one active in-memory world is fine. The important architectural direction is that the long-term source of truth should be the initial world plus the event log, not a stored copy of every full world state.

## Project Rules To Preserve

- SSOT always: store each fact in one authoritative place.
- Server owns simulation mutation.
- Client renders state and sends commands.
- LLMs request actions; the engine validates and applies them.
- Generate valid actions before choosing an action.
- Controllers choose from legal actions; they do not invent world state.
- Persist actions/results as events before considering full world-state history.
- Prefer small pure helpers for domain logic.
- Tests should prove behavior, not implementation trivia.
