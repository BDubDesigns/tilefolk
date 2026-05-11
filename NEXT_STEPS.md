# Tilefolk Next Steps

## Current Status

- MERN TypeScript monorepo scaffold is in place.
- Shared domain types exist for worlds, tiles, NPCs, items, trees, positions, and memories.
- Server world generator creates a 50x50 grass world with NPCs, trees, and axe items.
- World generation tests cover dimensions, tile grid shape, terrain, entity counts, bounds, overlap prevention, item shape, and pool exhaustion.
- Test, typecheck, and lint scripts are passing.

## Next Milestone: Serve The World

Goal: expose the generated world through the Express API so the React client can fetch it.

### Task 1: Add World Route

Add a route such as:

```txt
GET /api/worlds/default
```

Acceptance criteria:

- Calls `createWorld()`.
- Returns the generated world as JSON.
- Does not persist anything yet.
- Has a focused test if practical.

### Task 2: Fetch World In Client

Update the React app to fetch the generated world.

Acceptance criteria:

- Client calls the world endpoint.
- Loading state is visible.
- Error state is handled.
- Successful response is stored in component state.

### Task 3: Render The Tile Grid

Create a basic `WorldGrid` component.

Acceptance criteria:

- Renders a 50x50 grid.
- Uses `tiles[y][x]` consistently.
- Grass tiles have a simple visual style.
- Layout remains readable at desktop size.

### Task 4: Render Entities

Overlay or place entities on the grid.

Acceptance criteria:

- NPCs are visible.
- Trees are visible.
- Ground items are visible.
- No simulation actions yet.

## After That

Next larger milestones:

- Hold one active in-memory world on the server.
- Add a step endpoint for one NPC turn.
- Implement deterministic placeholder actions.
- Add movement validation.
- Add pickup validation.
- Add event logs.
- Render the event log in the client.
- Add LLM action selection only after deterministic simulation is solid.

## Project Rules To Preserve

- SSOT always: store each fact in one authoritative place.
- Server owns simulation mutation.
- Client renders state and sends commands.
- LLMs request actions; the engine validates and applies them.
- Prefer small pure helpers for domain logic.
- Tests should prove behavior, not implementation trivia.

