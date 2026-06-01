import { describe, expect, it } from 'vitest';
import type { World } from '@tilefolk/shared';
import { createWorld } from './worldGenerator.js';
import { getValidChopTreeActions } from './getValidChopTreeActions.js';

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

function giveNpcAxe(world: World, npcId: string): void {
  world.items = [
    {
      id: 'item_axe',
      name: 'Bronze Axe',
      location: { type: 'inventory', npcId },
      type: 'axe',
    },
  ];
}

describe('getValidChopTreeActions', () => {
  it('returns an empty array when the NPC does not exist', () => {
    const world = createKnownWorld();

    const actions = getValidChopTreeActions({ world, npcId: 'missing_npc' });

    expect(actions).toEqual([]);
  });

  it('returns an empty array when the NPC does not have an axe', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    world.trees = [{ id: 'tree_adjacent', position: { x: 3, y: 2 }, hitPoints: 3 }];

    const actions = getValidChopTreeActions({ world, npcId: npc.id });

    expect(actions).toEqual([]);
  });

  it('returns chop tree actions for adjacent trees when the NPC has an axe', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    giveNpcAxe(world, npc.id);
    world.trees = [{ id: 'tree_adjacent', position: { x: 3, y: 2 }, hitPoints: 3 }];

    const actions = getValidChopTreeActions({ world, npcId: npc.id });

    expect(actions).toEqual([
      {
        type: 'chopTree',
        npcId: npc.id,
        treeId: 'tree_adjacent',
      },
    ]);
  });

  it('includes diagonal adjacent trees', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    giveNpcAxe(world, npc.id);
    world.trees = [{ id: 'tree_diagonal', position: { x: 3, y: 3 }, hitPoints: 3 }];

    const actions = getValidChopTreeActions({ world, npcId: npc.id });

    expect(actions).toContainEqual({
      type: 'chopTree',
      npcId: npc.id,
      treeId: 'tree_diagonal',
    });
  });

  it('does not return actions for trees outside one tile', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    giveNpcAxe(world, npc.id);
    world.trees = [{ id: 'tree_far', position: { x: 4, y: 2 }, hitPoints: 3 }];

    const actions = getValidChopTreeActions({ world, npcId: npc.id });

    expect(actions).toEqual([]);
  });

  it('returns one action per adjacent tree', () => {
    const world = createKnownWorld();
    const npc = getNpcOrThrow(world, 0);
    giveNpcAxe(world, npc.id);
    world.trees = [
      { id: 'tree_north', position: { x: 2, y: 1 }, hitPoints: 3 },
      { id: 'tree_east', position: { x: 3, y: 2 }, hitPoints: 3 },
      { id: 'tree_far', position: { x: 4, y: 2 }, hitPoints: 3 },
    ];

    const actions = getValidChopTreeActions({ world, npcId: npc.id });

    expect(actions).toEqual([
      { type: 'chopTree', npcId: npc.id, treeId: 'tree_north' },
      { type: 'chopTree', npcId: npc.id, treeId: 'tree_east' },
    ]);
  });
});
