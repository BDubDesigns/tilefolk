# TODO 2026-06-15 — Round Tracking Slice

Goal: add round tracking in a small, future-friendly way without fully rebuilding turn order yet.

This file is intentionally written as pass/fail requirements, not implementation code. Use it as a checklist while coding.

## Context

Current behavior:

- `turn` advances once per NPC action.
- The active NPC is currently chosen from `turn` and the NPC list length.
- Events record the pre-advance action turn.
- `stepWorld` should not mutate the original input world.

New desired behavior:

- `round` tracks completed full cycles through the current NPC roster.
- `round` starts at `0`.
- `round` increments only after the final NPC in the current simple cycle acts.
- This is a stepping stone toward future explicit turn-order state for birth, death, sleeping, skipped turns, etc.

Important design constraint:

- Do not build the full future dynamic-roster system yet.
- Do add a small helper/seam so future turn-order logic is easier to replace.

---

## Decision Locked For This Slice

### Store `round` on `World`

Pass if:

- `World` has an engine-owned `round` field.
- Generated worlds initialize `round` to `0`.
- Tests and typed world literals include `round` where required.

Fail if:

- `round` is only calculated ad hoc in the client.
- Several files independently calculate round using their own formula.
- `round` can be changed outside the step/turn-clock flow without a clear reason.

### Keep the dynamic-roster redesign for later

Pass if:

- This slice still behaves like the current fixed-roster system.
- The code creates a small seam for later replacing actor selection / clock advancement.
- `NEXT_STEPS.md` notes that explicit per-round actor snapshots are future work before birth/death/sleep.

Fail if:

- This slice introduces birth, death, sleeping, skipping, or actor eligibility rules.
- This slice adds large unused abstractions that are not tested by current behavior.

---

## Step 1 — Add Failing Tests First

File:

- `apps/server/src/simulation/stepWorld.test.ts`

Add a new `round tracking` test group near the existing `turn tracking` tests.

### Requirement 1: round does not increment before the full NPC cycle completes

Setup requirements:

- Create a normal test world.
- Use multiple NPCs.
- Remove items/trees if needed so action choice is predictable.
- Start at `turn = 0` and `round = 0`.

Pass if, after one step:

- `turn` advanced by exactly `1`.
- `round` is still `0`.
- The step succeeds.

Fail if:

- `round` increments after the first NPC acts in a multi-NPC world.
- The test depends on random world positions in a fragile way.

### Requirement 2: round increments after the final NPC in the current cycle acts

Setup requirements:

- Create a normal test world with the default 4 NPCs, or otherwise make the NPC count explicit in the test name/setup.
- Start at the turn where the final NPC in that cycle should act.
- Start with `round = 0`.

Pass if, after one step:

- The expected final NPC acted.
- `turn` advanced by exactly `1`.
- `round` advanced to `1`.

Fail if:

- The test only checks `round` and does not confirm the expected actor.
- `round` increments before the final actor takes their step.

### Requirement 3: stepping does not mutate the original world round

Setup requirements:

- Use a case where the returned world should increment `round`.
- Keep a reference to the original world.

Pass if:

- The returned world has the incremented `round`.
- The original world still has the old `round`.

Fail if:

- `stepWorld` mutates the input world directly.

---

## Step 2 — Add `round` To Shared World State

File:

- `packages/shared/src/index.ts`

Pass if:

- `World` includes a required numeric `round` field.
- The field is placed near `turn` so the two clock concepts are easy to find together.

Fail if:

- `round` is optional just to avoid updating tests.
- `round` is added to unrelated types first.

---

## Step 3 — Initialize New Worlds With Round Zero

File:

- `apps/server/src/simulation/worldGenerator.ts`

Pass if:

- New generated worlds start with `turn = 0` and `round = 0`.
- Existing world generation behavior otherwise stays the same.

Fail if:

- World generation changes NPC count, map size, items, trees, or randomness for this slice.

---

## Step 4 — Update Typed World Literals

Known files likely requiring updates:

- `apps/server/src/simulation/addMemoriesForWitnesses.test.ts`
- `apps/server/src/simulation/getActionOptions.test.ts`
- `packages/shared/src/getVisibleWorldContext.test.ts`

Pass if:

- All direct `World` object literals include `round`.
- The added `round` values are boring and intentional, usually `0`.

Fail if:

- Tests are loosened with `as any` or optional fields to avoid fixing the real type shape.
- Unrelated test data is changed.

---

## Step 5 — Add A Small Turn-Clock Seam

Goal: avoid baking `turn % npcs.length` deeper into `stepWorld`.

Pass if:

- Actor selection is moved behind a small helper/function with a clear name.
- Turn/round advancement is moved behind a small helper/function with a clear name.
- The helper behavior is equivalent to current behavior for the fixed-roster case.
- The no-NPC case still fails without advancing `turn` or `round`.

Fail if:

- `stepWorld` gets more scattered modulo logic.
- The helper tries to solve birth/death/sleep now.
- The helper changes event turn semantics accidentally.

Design note:

- It is okay if the helper still uses the current simple fixed-roster math internally.
- The point is to make the future replacement obvious and localized.

---

## Step 6 — Preserve Existing Event Semantics

Pass if:

- Events still record the attempted/action turn, not the post-step turn.
- Existing event/memory tests continue to pass.
- `turn` still advances once per successful NPC attempt.

Fail if:

- Existing event `turn` expectations change without a strong design reason.
- Memories start recording post-step turn values accidentally.

---

## Step 7 — Optional Client Display Follow-Up

Only do this after server/shared tests pass.

File:

- `apps/client/src/App.tsx`

Pass if:

- The UI shows both round and turn in the map header or nearby status area.
- The display is simple and does not add new derived round math in the client.

Fail if:

- The client calculates its own round from `turn` and `npcs.length`.
- The display work distracts from getting the engine behavior tested first.

---

## Step 8 — Update NEXT_STEPS

File:

- `NEXT_STEPS.md`

Pass if:

- The roadmap notes round tracking as the current/next simulation slice.
- The roadmap includes a future note: before birth/death/sleep, replace modulo-based actor selection with explicit per-round actor snapshots or equivalent turn-order state.
- Provider Test Panel follow-ups remain preserved as follow-up work, not erased.

Fail if:

- `NEXT_STEPS.md` becomes a huge design document.
- Existing completed milestone notes are removed.

---

## Validation Requirements

Run the most focused validation first.

Pass if:

- The targeted `stepWorld` tests pass.
- Broader test/typecheck validation passes if run.
- Any failing command is understood and either fixed or clearly noted.

Fail if:

- The implementation is considered done without running at least the focused test.
- Type errors are hidden with casts instead of fixed.

Suggested validation order:

1. Run the focused `stepWorld` test.
2. Run the relevant package/workspace tests if the focused test passes.
3. Run typecheck if available and reasonably quick.

---

## Final Acceptance Checklist

The slice is complete when all are true:

- [ ] `World` has `round`.
- [ ] `createWorld()` initializes `round` to `0`.
- [ ] Round tracking tests cover early-cycle, cycle-complete, and non-mutation behavior.
- [ ] `stepWorld` still picks actors correctly for the current fixed-roster behavior.
- [ ] `round` increments only after the final NPC in the current simple cycle acts.
- [ ] No-NPC failure does not advance `turn` or `round`.
- [ ] Existing event turn semantics are preserved.
- [ ] Turn/round logic has a small helper seam for future dynamic turn order.
- [ ] Direct `World` literals are updated without weakening types.
- [ ] `NEXT_STEPS.md` includes the future dynamic-turn-order note.
- [ ] Focused tests pass.

---

## Future Work Explicitly Not In This Slice

Do not implement these yet:

- NPC birth.
- NPC death.
- Sleeping or skipped turns.
- Explicit living/dead flags.
- Per-round actor snapshots.
- Persistent world storage.
- World tick systems such as hunger/weather/growth.
- A proper system/world-step failure result type for cases where no NPC can act.

Future design direction:

- Before adding birth/death/sleep, replace simple modulo actor selection with explicit per-round actor snapshots or another tested turn-order state model.
- Replace the temporary no-NPC fake `wait` action with a typed system result or world-step failure shape so failed steps do not need placeholder NPC actions.
