import { describe, expect, it } from 'vitest';
import { getVisibleWorldContext, type World } from './index.js';

const createTestWorld = (): World => ({
  id: 'world_test',
  width: 10,
  height: 10,
  tiles: [],
  turn: 0,
  round: 0,
  events: [],
  npcs: [
    {
      id: 'npc_viewer',
      name: 'Viewer',
      position: { x: 5, y: 5 },
      memories: [],
    },
    {
      id: 'npc_near',
      name: 'Near NPC',
      position: { x: 7, y: 5 },
      memories: [],
    },
    {
      id: 'npc_far',
      name: 'Far NPC',
      position: { x: 9, y: 5 },
      memories: [],
    },
  ],
  trees: [
    {
      id: 'tree_near',
      position: { x: 4, y: 4 },
      hitPoints: 3,
    },
    {
      id: 'tree_far',
      position: { x: 1, y: 1 },
      hitPoints: 3,
    },
  ],
  items: [
    {
      id: 'item_near',
      name: 'Nearby Axe',
      type: 'axe',
      location: {
        type: 'ground',
        position: { x: 6, y: 6 },
      },
    },
    {
      id: 'item_far',
      name: 'Far Axe',
      type: 'axe',
      location: {
        type: 'ground',
        position: { x: 9, y: 9 },
      },
    },
    {
      id: 'item_inventory',
      name: 'Held Axe',
      type: 'axe',
      location: {
        type: 'inventory',
        npcId: 'npc_viewer',
      },
    },
  ],
});

const getViewer = (world: World) => {
  const viewer = world.npcs.find((npc) => npc.id === 'npc_viewer');
  if (!viewer) throw new Error('Expected test world to include npc_viewer');
  return viewer;
};

describe('getVisibleWorldContext', () => {
  it('includes nearby NPCs and excludes the viewing NPC', () => {
    const world = createTestWorld();
    const viewer = getViewer(world);

    const context = getVisibleWorldContext({ world, npc: viewer, radius: 3 });

    expect(context.nearbyNpcs.map((npc) => npc.id)).toEqual(['npc_near']);
  });

  it('includes trees inside the visible radius and excludes trees outside it', () => {
    const world = createTestWorld();
    const viewer = getViewer(world);

    const context = getVisibleWorldContext({ world, npc: viewer, radius: 3 });

    expect(context.nearbyTrees.map((tree) => tree.id)).toEqual(['tree_near']);
  });

  it('includes ground items inside the visible radius and excludes far or held items', () => {
    const world = createTestWorld();
    const viewer = getViewer(world);

    const context = getVisibleWorldContext({ world, npc: viewer, radius: 3 });

    expect(context.nearbyGroundItems.map((item) => item.id)).toEqual(['item_near']);
  });

  it('uses a square radius that includes diagonals', () => {
    const world = createTestWorld();
    const viewer = getViewer(world);

    const context = getVisibleWorldContext({ world, npc: viewer, radius: 1 });

    expect(context.nearbyTrees.map((tree) => tree.id)).toEqual(['tree_near']);
    expect(context.nearbyGroundItems.map((item) => item.id)).toEqual(['item_near']);
  });

  it('defaults to a radius of 3', () => {
    const world = createTestWorld();
    const viewer = getViewer(world);

    const context = getVisibleWorldContext({ world, npc: viewer });

    expect(context.radius).toBe(3);
    expect(context.nearbyNpcs.map((npc) => npc.id)).toEqual(['npc_near']);
  });
});
