# Tilefolk NPC Simulation Spec

## Vision

Build a turn-based tile simulation where NPCs use deterministic or LLM-backed controllers to choose actions from a constrained action set. The goal is to observe emergent behavior, social dynamics, knowledge transfer, and tool use inside a small, inspectable world.

The simulation should feel like a laboratory first and a game second: every NPC decision should be visible, logged, replayable, and explainable.

## Core Principles

- The game engine is authoritative. Controllers choose from server-generated legal options; the server resolves and applies the chosen action.
- NPCs receive limited observations, not the full world state.
- NPCs act through a small, explicit action schema owned by the server.
- Memory is persistent and inspectable.
- Emergence should come from constraints, not from giving the model unlimited freedom.
- The first version should be simple, deterministic where possible, and easy to debug.

## Initial World

- Current grid size: 25x25 tiles.
- Coordinates use `{ x, y }`.
- Origin is the top-left tile: `{ x: 0, y: 0 }`.
- `x` increases east/right.
- `y` increases south/down.
- Each tile has exactly one terrain type.

Initial terrain types:

- `grass`

Initial entities:

- 4 NPCs
- 1 axe
- Multiple trees

## Visibility

Each NPC sees a square field of view centered on itself.

- View radius: 3 tiles.
- Maximum visible area: 7x7 tiles, or 49 tiles.
- Visibility includes diagonals.
- Visibility is clipped by world boundaries.

An NPC can observe:

- Terrain in visible tiles.
- Items in visible tiles.
- NPCs in visible tiles.
- Whether adjacent trees/items are interactable.
- Recent speech events within hearing range.

The NPC should not receive hidden state, full map information, private thoughts of others, or validation rules not represented in the available action options.

## Turn Loop

The simulation is turn-based.

For each round:

1. NPC 1 observes the world.
2. The server builds a prompt payload.
3. The controller chooses one option ID from the valid action option list.
4. The server resolves the selected option ID against server-owned `ActionOption` objects.
5. The server applies the action or records a fallback/rejected action.
6. The world log is updated.
7. Repeat for NPCs 2 through 4.

The default pacing target is one NPC action every 10 seconds when running live. The engine should also support manual stepping for development.

## NPC Model

Each NPC has:

- `id`
- `name`
- `position`
- `memories`
- `personality`
- `currentGoal`, optional
- `createdAt`
- `updatedAt`

NPC memory begins as append-only records. Later versions may add summarization, importance scoring, forgetting, trust, and beliefs.

NPC inventory is derived from item location records. It should not be stored as a second source of truth on the NPC.

## Item Model

Each item has:

- `id`
- `type`
- `name`
- `location`
- `metadata`

Initial item types:

- `axe`

Item location is a discriminated union:

```ts
type ItemLocation =
  | { type: "ground"; position: Position }
  | { type: "inventory"; npcId: NpcId };
```

The item record is the single source of truth for whether an item is on the ground or held by an NPC.

## Tree Model

Trees are world objects with health. Tiles remain terrain-only.

Initial tree behavior:

- A tree has hit points.
- An axe can damage a tree.
- Chopping a tree takes several successful actions.
- When tree health reaches 0, the tree is removed or converted to grass.

Recommended v1 tree HP: 3.

## Actions

The LLM must choose from valid action options provided by the server.

Base actions:

- `move`
- `wait`
- `say`
- `inspect`
- `pickup`

Conditional actions:

- `chopTree`, available only when the NPC has an axe and is adjacent to a tree.

Movement:

- One tile per move action.
- Valid directions: `n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`.
- Diagonal movement costs one action.
- Movement cannot leave the map.

Adjacency:

- A tile is adjacent if it is within 1 tile in any direction, including diagonals.
- The NPC's current tile also counts for item pickup if an item is on the same tile.

Speech:

- `say` targets one visible NPC.
- Other NPCs in hearing range may overhear.
- Speech is stored in world logs and relevant NPC memories.

Inspect:

- `inspect` can target a visible nearby item, NPC, tile, or tree.
- Inspection may create a memory record for the acting NPC.
- Inspection reveals only designed knowledge, not implementation internals.

Pickup:

- `pickup` can target an item on the same or adjacent tile.
- The item moves from the world to the NPC inventory.

## Controller Decision Response

LLM controllers must return JSON that selects one server-generated option ID.

```json
{
  "selectedOptionId": "move:e",
  "reason": "I want to get closer to the axe."
}
```

Rules:

- `selectedOptionId` is required.
- `reason` is for logs/debugging only.
- The selected option must exist in the server-generated `ActionOption[]` for that turn.
- Invalid, missing, or unusable decisions fall back to deterministic selection.
- Controllers never author raw action objects.

## Memory

Memory records should be structured.

```json
{
  "id": "memory_123",
  "npcId": "npc_mira",
  "type": "observation",
  "text": "Saw an axe at { x: 12, y: 18 }.",
  "source": "self",
  "turnNumber": 4,
  "createdAt": "2026-05-08T00:00:00.000Z"
}
```

Initial memory types:

- `observation`
- `conversation`
- `inspection`
- `actionResult`

When an NPC hears another NPC speak, store the claim with attribution.

Example:

> Mira said the axe can chop trees.

Do not store it as unquestioned truth unless the NPC personally verifies it.

## UI Requirements

The first UI should be a development console for the simulation.

Main areas:

- 25x25 grid view.
- NPC status panel.
- Selected NPC detail panel.
- World event log.
- Current turn controls.
- LLM prompt/action inspector.

Controls:

- Start simulation.
- Pause simulation.
- Step one action.
- Step one full round.
- Reset world.
- Select NPC.
- Toggle prompt/debug view.

The UI should prioritize clarity, scanning, and debugging over decorative presentation.

## Architecture

Use MERN with TypeScript across the stack.

Recommended app split:

- React client for rendering and controls.
- Express API server for simulation orchestration.
- MongoDB for persisted worlds, NPCs, memory, and logs.
- Shared TypeScript package or folder for common domain types.

Suggested top-level structure:

```txt
apps/
  client/
  server/
packages/
  shared/
docs/
```

## Server Responsibilities

The server owns:

- World generation.
- Turn progression.
- Visibility calculation.
- Valid action option generation.
- LLM prompt construction.
- LLM API calls.
- Action validation.
- World mutation.
- Memory updates.
- Event logging.
- Persistence.

## Client Responsibilities

The client owns:

- Rendering the world.
- Displaying logs and NPC state.
- Sending control commands.
- Showing debug information.
- Never directly mutating simulation state.

## Persistence

Persist:

- Initial world state
- Tiles or world seed/config
- NPCs
- Items
- Memories
- Event logs
- Turn records
- LLM requests/responses for debugging

For early versions, prefer simple document schemas. Optimize later only if performance requires it.

### State History Strategy

Tilefolk should not store a complete copy of the entire world after every NPC action as the primary history model.

Preferred model:

1. Store the initial world state for a simulation run.
2. Append an event for every attempted action.
3. Include the requested action, validation result, and applied world change in the event.
4. Derive the current world by replaying events onto the initial world.
5. Add periodic snapshots later as a performance optimization.

This keeps storage smaller, makes debugging easier, and gives the project a clean replay system. A snapshot is only a cache of derived state; it is not the deepest source of truth.

Example event shape:

```ts
interface SimulationEvent {
  id: string;
  tick: number;
  actorId: string;
  action: NpcAction;
  result: ActionResult;
  createdAt: string;
}
```

LLM-specific events should also preserve the prompt version, model name, raw response, parsed selected option, and validation result. This makes NPC decisions inspectable without giving the LLM direct authority over world state.

## Milestones

### Milestone 1: Project Foundation

- MERN TypeScript scaffold.
- Shared types.
- Basic linting/formatting.
- Health check endpoint.
- React app shell.

### Milestone 2: Static World

- Generate 25x25 grass world.
- Spawn trees as separate entities.
- Render grid in client.
- Display NPCs and axe.
- No LLM yet.

### Milestone 3: Deterministic Simulation

- Add turn loop.
- Add movement, pickup, inspect, and chop.
- Use scripted/random NPC decisions.
- Add event log as the primary simulation history.

### Milestone 4: One LLM NPC

- Connect one NPC to LLM.
- Enforce JSON selected-option responses.
- Resolve selected option IDs server-side.
- Show prompt and response in UI.

### Milestone 5: Four LLM NPCs

- Connect all four NPCs.
- Add speech and hearing.
- Add memory records.
- Add selected NPC memory view.

### Milestone 6: Emergence Tools

- Replay logs.
- Pause/step controls.
- Prompt tuning panel.
- Memory summaries.
- Scenario reset presets.

## Out Of Scope For V1

- Combat.
- Hunger/thirst.
- Crafting.
- Pathfinding.
- Trading.
- Multiplayer.
- Large maps.
- Complex resource systems.
- Long-term memory summarization.
- Trust modeling.
- Autonomous goal generation beyond simple prompt behavior.
