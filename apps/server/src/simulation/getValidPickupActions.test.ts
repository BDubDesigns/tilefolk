import { describe, expect, it } from 'vitest';
import type { World } from '@tilefolk/shared';
import { getValidPickupActions } from './getValidPickupActions.js';
import { createWorld } from './worldGenerator.js';

function getNpcOrThrow(world: World, index: number) {
  const npc = world.npcs[index];

  if (!npc) {
    throw new Error(`Expected NPC at index ${index}`);
  }

  return npc;
}

function createKnownWorld(): World {
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

describe('getValidPickupActions', () => {
  it('returns an empty array when the NPC does not exist', () => {
    const world = createKnownWorld();

    const actions = getValidPickupActions({ world, npcId: 'missing_npc' });

    expect(actions).toEqual([]);
  });

  it('returns pickup actions for ground items within one tile', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.items = [
      {
        id: 'item_same_tile',
        name: 'Same Tile Axe',
        location: { type: 'ground', position: { x: 2, y: 2 } },
        type: 'axe',
      },
      {
        id: 'item_diagonal',
        name: 'Diagonal Axe',
        location: { type: 'ground', position: { x: 3, y: 3 } },
        type: 'axe',
      },
    ];

    const actions = getValidPickupActions({ world, npcId: npc.id });

    expect(actions).toEqual(
      expect.arrayContaining([
        { type: 'pickup', npcId: npc.id, itemId: 'item_same_tile' },
        { type: 'pickup', npcId: npc.id, itemId: 'item_diagonal' },
      ]),
    );
  });

  it('does not return pickup actions for ground items outside one tile', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.items = [
      {
        id: 'item_far',
        name: 'Far Axe',
        location: { type: 'ground', position: { x: 4, y: 2 } },
        type: 'axe',
      },
    ];

    const actions = getValidPickupActions({ world, npcId: npc.id });

    expect(actions).toEqual([]);
  });

  it('does not return pickup actions for inventory items', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.items = [
      {
        id: 'item_held',
        name: 'Held Axe',
        location: { type: 'inventory', npcId: npc.id },
        type: 'axe',
      },
    ];

    const actions = getValidPickupActions({ world, npcId: npc.id });

    expect(actions).toEqual([]);
  });
});
