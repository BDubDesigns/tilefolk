# Tilefolk Next Steps

## Current Status

- MERN TypeScript monorepo scaffold is in place.
- Shared domain types exist for worlds, tiles, NPCs, items, trees, positions, and memories.
- Server world generator creates a 50x50 grass world with NPCs, trees, and axe items.
- World generation tests cover dimensions, tile grid shape, terrain, entity counts, bounds, overlap prevention, item shape, and pool exhaustion.
- Express exposes `GET /api/worlds/default` for the generated world.
- Express exposes `POST /api/worlds/default/step` for stepping the active in-memory world.
- React fetches the generated world and displays a basic world summary.
- React renders the world grid with separate overlay markers for NPCs, trees, and ground items.
- React has a manual step button that calls the server and replaces client state with the returned world.
- React displays the latest action result after stepping.
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

## Completed Milestone: Render The Static World

Goal: render the generated world as an actual grid in the React app.

### Task 1: Create `WorldGrid`

Completed `WorldGrid` component.

Acceptance criteria:

- Renders a 50x50 grid.
- Uses `tiles[y][x]` consistently.
- Grass tiles have a simple visual style.
- Layout remains readable at desktop size.
- Receives a `World` or `TileGrid` via props.
- Does not fetch data itself.

### Task 2: Render Entities

Completed entity overlay.

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

## Current Milestone: Manual Simulation Controls

Goal: let the client ask the server to advance the active world one action at a time.

### Task 1: Add Step Control In Client

Completed client behavior:

- Step button is rendered near the world summary.
- Button calls `POST /api/worlds/default/step`.
- Client replaces its current `world` state with `response.world`.
- Button is disabled while the step request is in flight.
- Failed step requests use the existing error path.
- Client does not calculate movement or mutate simulation state locally.

Acceptance criteria:

- Done.

### Task 2: Show Latest Action Result

Completed client behavior:

- Latest returned `actionResult` is stored in client state.
- A simple debug line displays the latest action message.
- Empty state displays `No actions yet`.

Acceptance criteria:

- Done for the current debug UI.
- Later polish can show actor, action type, and success/failure separately instead of only the message.

### Task 3: Add Reset Control

Acceptance criteria:

- Add a reset button that calls the existing reset endpoint.
- Client replaces its current `world` state with the reset world.
- Reset clears the latest action result.

## After That

Next larger milestones:

- Expand deterministic placeholder actions.
- Add pickup validation.
- Add inspect validation.
- Add chop-tree validation.
- Add event logs.
- Render the event log in the client.
- Add LLM action selection only after deterministic simulation is solid.

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
- Persist actions/results as events before considering full world-state history.
- Prefer small pure helpers for domain logic.
- Tests should prove behavior, not implementation trivia.
