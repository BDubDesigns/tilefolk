import { describe, expect, it } from 'vitest';
import type { World } from '@tilefolk/shared';
import { createWorld } from './worldGenerator.js';
import { getValidCarefullyPickBerryActions } from './getValidCarefullyPickBerry.js';

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
    numBushes: 0,
  });

  const npc = getNpcOrThrow(world, 0);
  npc.position = { x: 2, y: 2 };

  world.items = [];
  world.trees = [];
  world.bushes = [];
  world.events = [];
  world.turn = 0;

  return world;
}

describe('getValidCarefullyPickBerryActions', () => {
  it('returns an empty array when the NPC does not exist', () => {
    const world = createKnownWorld();

    const actions = getValidCarefullyPickBerryActions({ world, npcId: 'missing_npc' });

    expect(actions).toEqual([]);
  });

  it('returns carefully pick berry actions for adjacent berry bushes with berries', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.bushes = [
      {
        id: 'bush_adjacent',
        type: 'berry',
        position: { x: 3, y: 2 },
        berries: 3,
        maxBerries: 3,
      },
    ];

    const actions = getValidCarefullyPickBerryActions({ world, npcId: npc.id });

    expect(actions).toEqual([
      {
        type: 'carefullyPickBerry',
        npcId: npc.id,
        berryBushId: 'bush_adjacent',
      },
    ]);
  });

  it('includes diagonal adjacent berry bushes', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.bushes = [
      {
        id: 'bush_diagonal',
        type: 'berry',
        position: { x: 3, y: 3 },
        berries: 3,
        maxBerries: 3,
      },
    ];

    const actions = getValidCarefullyPickBerryActions({ world, npcId: npc.id });

    expect(actions).toContainEqual({
      type: 'carefullyPickBerry',
      npcId: npc.id,
      berryBushId: 'bush_diagonal',
    });
  });

  it('does not return actions for berry bushes outside one tile', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.bushes = [
      {
        id: 'bush_far',
        type: 'berry',
        position: { x: 4, y: 2 },
        berries: 3,
        maxBerries: 3,
      },
    ];

    const actions = getValidCarefullyPickBerryActions({ world, npcId: npc.id });

    expect(actions).toEqual([]);
  });

  it('does not return actions for berry bushes with no berries', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.bushes = [
      {
        id: 'bush_empty',
        type: 'berry',
        position: { x: 3, y: 2 },
        berries: 0,
        maxBerries: 3,
      },
    ];

    const actions = getValidCarefullyPickBerryActions({ world, npcId: npc.id });

    expect(actions).toEqual([]);
  });

  it('does not return actions for berry bushes on the NPC tile', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.bushes = [
      {
        id: 'bush_same_tile',
        type: 'berry',
        position: { x: 2, y: 2 },
        berries: 3,
        maxBerries: 3,
      },
    ];

    const actions = getValidCarefullyPickBerryActions({ world, npcId: npc.id });

    expect(actions).toEqual([]);
  });
});
