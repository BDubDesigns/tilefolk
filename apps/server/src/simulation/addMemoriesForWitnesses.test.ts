import { describe, expect, it } from 'vitest';
import type { World, WorldEvent } from '@tilefolk/shared';
import { addMemoriesForWitnesses } from './addMemoriesForWitnesses.js';

const createTestWorld = (): World => ({
  id: 'world_test',
  width: 10,
  height: 10,
  tiles: [],
  npcs: [
    {
      id: 'npc_actor',
      name: 'Actor',
      position: { x: 5, y: 5 },
      memories: [],
    },
    {
      id: 'npc_near',
      name: 'Near',
      position: { x: 7, y: 5 },
      memories: [],
    },
    {
      id: 'npc_far',
      name: 'Far',
      position: { x: 9, y: 5 },
      memories: [],
    },
  ],
  items: [],
  trees: [],
  events: [],
  memories: [],
  turn: 0,
});

const createPositionedEvent = (): WorldEvent => ({
  id: 'event_0',
  turn: 3,
  actorId: 'npc_actor',
  message: 'npc_actor picked up item_0',
  position: { x: 5, y: 5 },
});

const getNpcOrThrow = (world: World, npcId: string) => {
  const npc = world.npcs.find((candidateNpc) => candidateNpc.id === npcId);
  if (!npc) throw new Error(`Expected test world to include ${npcId}`);
  return npc;
};

describe('addMemoriesForWitnesses', () => {
  it('adds a memory for the actor when the event has a position', () => {
    const world = createTestWorld();
    const event = createPositionedEvent();

    addMemoriesForWitnesses({ world, event });

    const actor = getNpcOrThrow(world, 'npc_actor');
    expect(actor.memories).toEqual(['memory_0']);
    expect(world.memories[0]).toMatchObject({
      id: 'memory_0',
      npcId: 'npc_actor',
      sourceEventId: 'event_0',
      turn: 3,
      message: 'npc_actor picked up item_0',
      position: { x: 5, y: 5 },
    });
  });

  it('adds memories for nearby NPCs within the witness radius', () => {
    const world = createTestWorld();
    const event = createPositionedEvent();

    addMemoriesForWitnesses({ world, event });

    const nearNpc = getNpcOrThrow(world, 'npc_near');
    expect(nearNpc.memories).toEqual(['memory_1']);
    expect(world.memories.map((memory) => memory.npcId)).toEqual(['npc_actor', 'npc_near']);
  });

  it('does not add memories for NPCs outside the witness radius', () => {
    const world = createTestWorld();
    const event = createPositionedEvent();

    addMemoriesForWitnesses({ world, event });

    const farNpc = getNpcOrThrow(world, 'npc_far');
    expect(farNpc.memories).toEqual([]);
    expect(world.memories).toHaveLength(2);
  });

  it('does nothing for events without a position', () => {
    const world = createTestWorld();
    const event: WorldEvent = {
      id: 'event_0',
      turn: 3,
      actorId: 'npc_actor',
      message: 'npc_actor waited',
    };

    addMemoriesForWitnesses({ world, event });

    expect(world.memories).toEqual([]);
    expect(world.npcs.every((npc) => npc.memories.length === 0)).toBe(true);
  });

  it('snapshots the event position', () => {
    const world = createTestWorld();
    const event = createPositionedEvent();

    addMemoriesForWitnesses({ world, event });

    expect(world.memories[0]?.position).toEqual(event.position);
    expect(world.memories[0]?.position).not.toBe(event.position);
  });
});
