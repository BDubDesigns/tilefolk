import { describe, expect, it } from 'vitest';
import type { World } from '@tilefolk/shared';
import { applyRoundTicks } from './applyRoundTicks.js';

const createTestWorld = (): World => ({
  id: 'world_test',
  width: 10,
  height: 10,
  tiles: [],
  npcs: [
    {
      id: 'npc_0',
      name: 'NPC 0',
      position: { x: 1, y: 1 },
      memories: [],
      needs: { hunger: 0 },
    },
    {
      id: 'npc_1',
      name: 'NPC 1',
      position: { x: 2, y: 2 },
      memories: [],
      needs: { hunger: 5 },
    },
    {
      id: 'npc_2',
      name: 'NPC 2',
      position: { x: 3, y: 3 },
      memories: [],
      needs: { hunger: 100 },
    },
  ],
  items: [],
  trees: [],
  events: [],
  turn: 0,
  round: 0,
});

describe('applyRoundTicks', () => {
  it('increases every NPC hunger by 3', () => {
    const world = createTestWorld();

    applyRoundTicks(world);

    expect(world.npcs[0]?.needs.hunger).toBe(3);
    expect(world.npcs[1]?.needs.hunger).toBe(8);
  });

  it('caps NPC hunger at 100', () => {
    const world = createTestWorld();

    applyRoundTicks(world);

    expect(world.npcs[2]?.needs.hunger).toBe(100);
  });

  it('does not change the NPC roster', () => {
    const world = createTestWorld();
    const npcIdsBeforeTick = world.npcs.map((npc) => npc.id);

    applyRoundTicks(world);

    expect(world.npcs.map((npc) => npc.id)).toEqual(npcIdsBeforeTick);
  });
});
