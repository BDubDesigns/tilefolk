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
    expect(actions).toContainEqual({ type: 'move', npcId: npc.id, direction: 'n' });
  });

  it('includes wait as a valid action', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    const actions = getValidActions({ world, npcId: npc.id });
    expect(actions).toContainEqual({ type: 'wait', npcId: npc.id });
  });

  it('includes valid chop tree actions for an axe-holding NPC', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.items = [
      {
        id: 'item_axe',
        name: 'Bronze Axe',
        location: { type: 'inventory', npcId: npc.id },
        type: 'axe',
      },
    ];
    world.trees = [{ id: 'tree_adjacent', position: { x: 3, y: 2 }, hitPoints: 3 }];

    const actions = getValidActions({ world, npcId: npc.id });

    expect(actions).toContainEqual({
      type: 'chopTree',
      npcId: npc.id,
      treeId: 'tree_adjacent',
    });
  });

  it('returns wait when movement is fully blocked', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.trees = [
      { id: 'tree_0', position: { x: 1, y: 1 }, hitPoints: 3 },
      { id: 'tree_1', position: { x: 2, y: 1 }, hitPoints: 3 },
      { id: 'tree_2', position: { x: 3, y: 1 }, hitPoints: 3 },
      { id: 'tree_3', position: { x: 1, y: 2 }, hitPoints: 3 },
      { id: 'tree_4', position: { x: 3, y: 2 }, hitPoints: 3 },
      { id: 'tree_5', position: { x: 1, y: 3 }, hitPoints: 3 },
      { id: 'tree_6', position: { x: 2, y: 3 }, hitPoints: 3 },
      { id: 'tree_7', position: { x: 3, y: 3 }, hitPoints: 3 },
    ];
    const actions = getValidActions({ world, npcId: npc.id });
    expect(actions).toHaveLength(1);
    expect(actions).toContainEqual({ type: 'wait', npcId: npc.id });
  });

  it('returns an empty array when the NPC does not exist', () => {
    const world = createKnownWorld();
    const actions = getValidActions({ world, npcId: 'N/A' });
    expect(actions).toHaveLength(0);
  });
});
