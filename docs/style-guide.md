# Tilefolk Engineering Style Guide

## Purpose

This guide keeps the project predictable while it grows. When in doubt, prefer explicit types, small modules, boring names, and server-authoritative simulation logic.

## Stack

- MongoDB
- Express
- React
- Node.js
- TypeScript everywhere

Preferred supporting tools:

- Vite for the client.
- Express for the API server.
- Mongoose or the official MongoDB driver for persistence.
- Zod for runtime validation.
- ESLint for linting.
- Prettier for formatting.
- Vitest for unit tests.

## Repository Structure

Use a simple monorepo shape:

```txt
apps/
  client/
    src/
  server/
    src/
packages/
  shared/
    src/
docs/
```

Rules:

- Shared domain types live in `packages/shared`.
- Client-only UI code lives in `apps/client`.
- Server-only simulation and persistence code lives in `apps/server`.
- Do not duplicate domain types between client and server.

## Naming Conventions

Files:

- React components: `PascalCase.tsx`
- Hooks: `useThing.ts`
- General modules: `camelCase.ts`
- Type definition modules: `thingTypes.ts`
- Test files: `thing.test.ts`

Identifiers:

- Types and interfaces: `PascalCase`
- Variables and functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` only for true constants
- Enum-like values: prefer string literal unions over TypeScript enums
- Mongo collection names: plural camelCase, such as `worlds`, `npcs`, `eventLogs`

Examples:

```ts
type NpcAction = "move" | "wait" | "say" | "inspect" | "pickup" | "chopTree";

interface Npc {
  id: string;
  name: string;
  position: Position;
}

const WORLD_SIZE = 50;
```

## TypeScript Rules

- Use `strict` mode.
- Avoid `any`.
- Prefer `unknown` over `any` at boundaries.
- Validate external input with Zod before trusting it.
- Prefer explicit return types on exported functions.
- Keep domain types serializable.
- Use discriminated unions for action payloads.

Example:

```ts
type MoveAction = {
  type: "move";
  direction: Direction;
};

type SayAction = {
  type: "say";
  targetNpcId: string;
  message: string;
};

type NpcAction = MoveAction | SayAction;
```

## Domain Language

Use these terms consistently:

- `world`: the full simulation state.
- `tile`: a single grid cell.
- `terrain`: the base tile type, such as grass or tree.
- `entity`: an object with identity in the world.
- `npc`: an autonomous character.
- `item`: an object that can exist on the ground or in inventory.
- `turn`: one NPC action opportunity.
- `round`: one full cycle where all NPCs have had a turn.
- `observation`: what an NPC can currently perceive.
- `memory`: persistent NPC knowledge.
- `event`: something that happened in the simulation.

## Simulation Rules

- The server is the only authority allowed to mutate world state.
- The client may request commands but never directly applies simulation changes.
- The LLM never receives full world state unless explicitly in debug mode.
- The LLM only chooses from server-generated valid actions.
- Every action attempt should produce a log entry.
- Invalid actions should be recorded, not silently ignored.
- Pure simulation functions should not call the database or LLM.
- Long-term history should be stored as initial state plus events, not full world copies after every tick.

Good module boundaries:

```txt
simulation/
  visibility.ts
  actions.ts
  validation.ts
  reducer.ts
  worldGenerator.ts
llm/
  promptBuilder.ts
  actionParser.ts
  geminiClient.ts
persistence/
  worldRepository.ts
```

## Function Design

Prefer small, pure functions for rules.

Good:

```ts
function isAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1;
}
```

Avoid functions that validate, mutate, persist, and log in one place.

## API Design

Use REST for the first version.

Recommended endpoints:

```txt
GET    /api/health
POST   /api/worlds
GET    /api/worlds/:worldId
POST   /api/worlds/:worldId/step
POST   /api/worlds/:worldId/round
POST   /api/worlds/:worldId/reset
GET    /api/worlds/:worldId/events
GET    /api/worlds/:worldId/npcs/:npcId
```

Rules:

- Request and response bodies must have shared TypeScript types.
- Validate request bodies on the server.
- Return predictable error shapes.

Error shape:

```json
{
  "error": {
    "code": "INVALID_ACTION",
    "message": "The NPC cannot pick up an item outside adjacency range."
  }
}
```

## React Style

- Use functional components.
- Keep components focused and small.
- Keep server state separate from local UI state.
- Use custom hooks for API calls and simulation controls.
- Avoid global state until it is clearly needed.
- Prefer CSS modules, scoped CSS, or a small design system over ad hoc inline styles.
- Keep dependencies light and intentional. Prefer platform APIs such as `fetch` over adding libraries like Axios unless the project has a concrete need that native APIs do not cover.
- If a repeated API pattern emerges, build a small local wrapper around `fetch` that matches Tilefolk's needs before reaching for a dependency.

Suggested client structure:

```txt
src/
  api/
  components/
  features/
    world/
    npc/
    events/
  hooks/
  styles/
  App.tsx
```

Component naming examples:

- `WorldGrid`
- `TileCell`
- `NpcPanel`
- `EventLog`
- `TurnControls`
- `PromptInspector`

## UI Style

The app should look like a focused simulation tool.

Guidelines:

- Prioritize readable grid state and logs.
- Use compact panels, not marketing sections.
- Use restrained color.
- Keep controls consistent and discoverable.
- Avoid decorative UI that competes with the simulation.
- Use icons for common controls when appropriate.
- Do not hide debug information behind too many clicks.

Suggested visual language:

- Grass: muted green.
- Trees: darker green.
- NPCs: distinct readable colors.
- Axe/tool: high contrast accent.
- Grid lines: subtle.
- Logs: dense but readable.

## LLM Integration

Rules:

- Store model configuration in environment variables.
- Never commit API keys.
- Wrap provider-specific code behind an interface.
- Log request metadata, response text, parsed action, and validation result.
- Keep prompts versioned.
- Validate LLM output with Zod before using it.

Provider interface:

```ts
interface LlmClient {
  generateNpcAction(input: GenerateNpcActionInput): Promise<GenerateNpcActionResult>;
}
```

Environment variables:

```txt
GEMINI_API_KEY=
GEMINI_MODEL=
```

## Prompt Style

Prompts should be structured and boring.

Include:

- NPC identity.
- Personality.
- Current position.
- Inventory.
- Visible world summary.
- Relevant memories.
- Valid actions.
- Required JSON response schema.

Do not include:

- Full hidden world state.
- Other NPC private memories.
- API keys or implementation details.
- Instructions that conflict with the action schema.

## Persistence Style

- Keep persistence code behind repositories.
- Do not call Mongoose models directly from route handlers once the domain grows.
- Store timestamps in ISO-compatible date values.
- Store IDs as strings in shared types.
- Avoid over-normalizing early.
- Treat snapshots as cached derived state, not the deepest source of truth.
- Event records should be append-only whenever possible.
- Event payloads should contain enough information to debug and replay the simulation.

Preferred simulation history model:

```txt
SimulationRun
  initialWorld
  events[]
  snapshots[] optional later
```

The current world can be cached for convenience, but it should be possible to rebuild it from the initial world plus the event log.

## Testing Expectations

Write tests for simulation rules before UI polish.

High-value tests:

- Visibility at center and map edges.
- Movement boundaries.
- Adjacent tile detection.
- Valid action generation.
- Pickup validation.
- Chop validation and tree HP changes.
- Speech hearing range.
- LLM action parsing and rejection.

Test names should describe behavior:

```ts
it("does not allow movement outside the world bounds", () => {
  // ...
});
```

## Git And Task Workflow

For each task:

1. Read the relevant doc/spec section.
2. Make the smallest useful change.
3. Run format/lint/tests that apply.
4. Summarize what changed.
5. Ask for review or hand it back for the next task.

Preferred branch naming:

```txt
codex/task-short-description
```

Commit messages:

```txt
Add shared world types
Implement visibility calculation
Render initial world grid
```

## Review Checklist

Before asking for review, check:

- Does the code follow the shared types?
- Is world mutation server-side only?
- Are names clear and consistent?
- Are invalid states handled?
- Are external inputs validated?
- Is the change covered by a focused test when logic is involved?
- Does the UI remain readable at common desktop sizes?
- Are secrets kept out of git?

## Things To Avoid

- Giving the LLM direct write access to the world.
- Letting client code invent simulation rules.
- Using `any` to move fast through domain logic.
- Mixing persistence, validation, and mutation in one large function.
- Adding pathfinding before basic movement is solid.
- Adding complex needs systems before memory and speech work.
- Optimizing Mongo schemas before the simulation behavior is proven.
