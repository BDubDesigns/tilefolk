# Tilefolk NPC Simulation Spec

## Vision

Build a turn-based 50x50 tile simulation where four NPCs use an LLM to choose actions from a constrained action set. The goal is to observe emergent behavior, social dynamics, knowledge transfer, and tool use inside a small, inspectable world.

The simulation should feel like a laboratory first and a game second: every NPC decision should be visible, logged, replayable, and explainable.

## Core Principles

- The game engine is authoritative. The LLM may request an action, but the server validates and applies it.
- NPCs receive limited observations, not the full world state.
- NPCs act through a small, explicit action schema.
- Memory is persistent and inspectable.
- Emergence should come from constraints, not from giving the model unlimited freedom.
- The first version should be simple, deterministic where possible, and easy to debug.

## Initial World

- Grid size: 50x50 tiles.
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

The NPC should not receive hidden state, full map information, private thoughts of others, or validation rules not represented in the available actions.

## Turn Loop

The simulation is turn-based.

For each round:

1. NPC 1 observes the world.
2. The server builds a prompt payload.
3. The LLM chooses one action from the valid action list.
4. The server validates the action.
5. The server applies the action or records a rejected action.
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

The LLM must choose from valid actions provided by the server.

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

## LLM Action Response

LLM responses must use JSON.

```json
{
  "action": "move",
  "direction": "n",
  "targetId": null,
  "speech": null,
  "reason": "I want to get closer to the axe."
}
```

Rules:

- `action` is required.
- `reason` is for logs/debugging only.
- `speech` is required only for `say`.
- `direction` is required only for `move`.
- `targetId` is required for targeted actions.
- Invalid responses are rejected and recorded.

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

- 50x50 grid view.
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
- Valid action generation.
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

- Worlds
- Tiles or world seed/config
- NPCs
- Items
- Memories
- Event logs
- Turn records
- LLM requests/responses for debugging

For early versions, prefer simple document schemas. Optimize later only if performance requires it.

## Milestones

### Milestone 1: Project Foundation

- MERN TypeScript scaffold.
- Shared types.
- Basic linting/formatting.
- Health check endpoint.
- React app shell.

### Milestone 2: Static World

- Generate 50x50 grass world.
- Spawn trees as separate entities.
- Render grid in client.
- Display NPCs and axe.
- No LLM yet.

### Milestone 3: Deterministic Simulation

- Add turn loop.
- Add movement, pickup, inspect, and chop.
- Use scripted/random NPC decisions.
- Add event log.

### Milestone 4: One LLM NPC

- Connect one NPC to LLM.
- Enforce JSON action responses.
- Validate actions server-side.
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
