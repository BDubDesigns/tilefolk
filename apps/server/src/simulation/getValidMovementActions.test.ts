import { describe, it, expect } from 'vitest';
import { getValidMovementActions } from './getValidMovementActions.js';
import { createWorld } from './worldGenerator.js';
import type { World } from '@tilefolk/shared';

function getNpcOrThrow(world: World, index: number) {
  const npc = world.npcs[index];

  if (!npc) {
    throw new Error(`Expected NPC at index ${index}`);
  }

  return npc;
}

function createKnownWorld() {
  const world = createWorld({
    width: 5,
    height: 5,
    numNpcs: 1,
    numItems: 0,
    numTrees: 0,
  });

  const npc = getNpcOrThrow(world, 0);

  npc.position = { x: 2, y: 2 };

  world.items = [];
  world.trees = [];
  world.events = [];
  world.turn = 0;

  return world;
}

describe('getValidMovementActions', () => {
  it('returns all movement actions when every adjacent tile is in bounds and unblocked', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    expect(getValidMovementActions({ world, npcId: npc.id })).toHaveLength(8);
  });
  it('does not return out-of-bounds movement actions', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    npc.position.x = 0;
    npc.position.y = 0;

    const actions = getValidMovementActions({ world, npcId: npc.id });
    const actionDirections = actions.map((action) => action.direction);

    expect(actions).toHaveLength(3);
    expect(actionDirections).toEqual(expect.arrayContaining(['s', 'se', 'e']));
  });
  it('does not return movement actions blocked by a tree', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.trees = [
      {
        id: 'tree_0',
        position: { x: 2, y: 1 },
        hitPoints: 3,
      },
    ];
    const actions = getValidMovementActions({ world, npcId: npc.id });
    const actionDirections = actions.map((action) => action.direction);

    expect(actions).toHaveLength(7);
    expect(actionDirections).not.toContain('n');
  });

  it('does not return movement actions blocked by a ground item', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.items = [
      {
        id: 'item_0',
        name: 'Bronze Axe',
        location: { type: 'ground', position: { x: 2, y: 1 } },
        type: 'axe',
      },
    ];
    const actions = getValidMovementActions({ world, npcId: npc.id });
    const actionDirections = actions.map((action) => action.direction);

    expect(actions).toHaveLength(7);
    expect(actionDirections).not.toContain('n');
  });
  it('does not return movement actions blocked by another NPC', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.npcs.push({
      id: 'npc_1',
      name: 'NPC 1',
      position: { x: 3, y: 1 },
      memories: [],
    });
    const actions = getValidMovementActions({ world, npcId: npc.id });
    const actionDirections = actions.map((action) => action.direction);

    expect(actions).toHaveLength(7);
    expect(actionDirections).not.toContain('ne');
  });
  it('returns an empty array when the NPC does not exist', () => {
    const world = createKnownWorld();
    world.npcs = [];
    const actions = getValidMovementActions({ world, npcId: 'npc_0' });

    expect(actions).toHaveLength(0);
  });
});
