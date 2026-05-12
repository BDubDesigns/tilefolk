# Tilefolk Next Steps

## Current Status

- MERN TypeScript monorepo scaffold is in place.
- Shared domain types exist for worlds, tiles, NPCs, items, trees, positions, and memories.
- Server world generator creates a 50x50 grass world with NPCs, trees, and axe items.
- World generation tests cover dimensions, tile grid shape, terrain, entity counts, bounds, overlap prevention, item shape, and pool exhaustion.
- Express exposes `GET /api/worlds/default` for the generated world.
- React fetches the generated world and displays a basic world summary.
- Manual browser smoke test succeeded at `http://localhost:5173`.
- Test, typecheck, and lint scripts are passing.

## Completed Milestone: Serve The World

Goal: expose the generated world through the Express API so the React client can fetch it.

### Task 1: Add World Route

Completed route:

```txt
GET /api/worlds/default
```

Acceptance criteria:

- Calls `createWorld()`.
- Returns the generated world as JSON.
- Does not persist anything yet.
- Has focused route tests with `supertest`.

### Task 2: Fetch World In Client

Completed client behavior:

- Client calls the world endpoint.
- Loading state is visible.
- Error state is handled.
- Successful response is stored in component state.
- Basic world summary is displayed.

## Next Milestone: Render The Static World

Goal: render the generated world as an actual grid in the React app.

### Task 1: Create `WorldGrid`

Create a basic `WorldGrid` component.

Acceptance criteria:

- Renders a 50x50 grid.
- Uses `tiles[y][x]` consistently.
- Grass tiles have a simple visual style.
- Layout remains readable at desktop size.
- Receives a `World` or `TileGrid` via props.
- Does not fetch data itself.

### Task 2: Render Entities

Overlay or place entities on the grid.

Acceptance criteria:

- NPCs are visible.
- Trees are visible.
- Ground items are visible.
- No simulation actions yet.

### Task 3: Improve Layout For Debugging

Acceptance criteria:

- World grid and summary can be viewed together.
- Entity counts remain visible.
- UI stays focused and tool-like, not decorative.

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
