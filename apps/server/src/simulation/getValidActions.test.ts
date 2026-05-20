import { getValidActions } from './getValidActions.js';
import { describe, expect, it } from 'vitest';
import { createWorld } from './worldGenerator.js';
import type { World } from '@tilefolk/shared';

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

describe('getValidActions', () => {
  it('includes valid movement actions for the NPC', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    const actions = getValidActions({ world, npcId: npc.id });
    expect(actions).toHaveLength(9);
  });

  it('includes wait as a valid action', () => {});

  it('returns wait when movement is fully blocked');

  it('returns an empty array when the NPC does not exist');
});
