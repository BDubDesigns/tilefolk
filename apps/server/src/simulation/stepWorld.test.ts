import { describe, it, expect } from 'vitest';
import { stepWorld } from './stepWorld.js';
import { createWorld } from './worldGenerator.js';
import type { World, Position, WorldEvent } from '@tilefolk/shared';

function createWorldWithNpcAt(position: Position): World {
  const world: World = createWorld();
  // remove the other npcs from the world
  world.npcs = world.npcs.filter((npc) => npc.id === 'npc_0');

  const npc = getNpcOrThrow(world, 0);
  // remove trees
  world.trees = [];
  // remove items
  world.items = [];

  // safely set the NPC position
  npc.position.x = position.x;
  npc.position.y = position.y;
  return world;
}

// returns the NPC at the given index or throws an error
function getNpcOrThrow(world: World, index: number) {
  const npc = world.npcs[index];

  if (!npc) {
    throw new Error(`Expected NPC at index ${index}`);
  }

  return npc;
}

// returns the event at the given index or throws an error
function getEventOrThrow(world: World, index: number): WorldEvent {
  const event = world.events[index];

  if (!event) {
    throw new Error(`Expected event at index ${index}`);
  }

  return event;
}

describe('stepWorld', () => {
  describe('successful movement', () => {
    it('moves npc_0 one tile north', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);

      expect(stepResult.actionResult.success).toBe(true);
      expect(npc.position.x).toBe(2);
      expect(npc.position.y).toBe(1);
    });

    it('does not mutate the original world', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = stepWorld(world);
      const steppedNpc = getNpcOrThrow(stepResult.world, 0);
      const originalNpc = getNpcOrThrow(world, 0);

      expect(stepResult.actionResult.success).toBe(true);
      expect(steppedNpc.position.x).toBe(2);
      expect(steppedNpc.position.y).toBe(1);
      expect(originalNpc.position.x).toBe(2);
      expect(originalNpc.position.y).toBe(2);
    });

    it('does not block movement when another NPC is not on the destination', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 3, y: 1 },
        memories: [],
      });

      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);

      expect(npc.position.x).toBe(2);
      expect(npc.position.y).toBe(1);
      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.message).toBe('npc_0 moved n');
    });
  });

  describe('blocked movement', () => {
    it('fails when the NPC is at the edge of the world', () => {
      const world = createWorldWithNpcAt({ x: 0, y: 0 });

      const stepResult = stepWorld(world);
      const steppedNpc = getNpcOrThrow(stepResult.world, 0);

      expect(steppedNpc.position.x).toBe(0);
      expect(steppedNpc.position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 is at the edge of the world');
    });

    it('fails when the NPC collides with a tree', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.trees = [
        {
          id: 'tree_0',
          position: { x: 2, y: 1 },
          hitPoints: 3,
        },
      ];

      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);

      expect(npc.position.x).toBe(2);
      expect(npc.position.y).toBe(2);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with a tree');
    });

    it('fails when the destination contains a ground item', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items.push({
        id: 'item_0',
        name: 'Bronze Axe',
        location: { type: 'ground', position: { x: 2, y: 1 } },
        type: 'axe',
      });

      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);

      expect(npc.position.x).toBe(2);
      expect(npc.position.y).toBe(2);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with an item');
    });

    it('fails when the destination contains another NPC', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 2, y: 1 },
        memories: [],
      });

      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);

      expect(npc.position.x).toBe(2);
      expect(npc.position.y).toBe(2);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with another NPC');
    });
  });

  describe('missing actors', () => {
    it('fails when there are no NPCs in the world', () => {
      const world = createWorld();
      world.npcs = [];

      const stepResult = stepWorld(world);

      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('No NPCs to move');
    });
  });

  describe('turn tracking', () => {
    it('increments the world turn after a successful step', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = stepWorld(world);

      expect(stepResult.world.turn).toBe(1);
    });

    it('does not mutate the original world turn', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = stepWorld(world);

      expect(stepResult.world.turn).toBe(1);
      expect(world.turn).toBe(0);
    });

    it('increments the world turn after a blocked movement attempt', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 2, y: 1 },
        memories: [],
      });

      const stepResult = stepWorld(world);

      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.world.turn).toBe(1);
    });

    it('uses the world turn to choose which NPC acts', () => {
      const world = createWorld();
      world.trees = [];
      world.items = [];
      world.turn = 1;

      const npc0 = getNpcOrThrow(world, 0);
      const npc1 = getNpcOrThrow(world, 1);
      npc0.position.x = 2;
      npc0.position.y = 2;
      npc1.position.x = 4;
      npc1.position.y = 4;

      const stepResult = stepWorld(world);
      const steppedNpc0 = getNpcOrThrow(stepResult.world, 0);
      const steppedNpc1 = getNpcOrThrow(stepResult.world, 1);

      expect(steppedNpc0.position.x).toBe(2);
      expect(steppedNpc0.position.y).toBe(2);
      expect(stepResult.actionResult.action.type).toBe('move');
      expect(stepResult.actionResult.action.npcId).toBe('npc_1');
      if (stepResult.actionResult.action.type !== 'move') {
        throw new Error('Expected action to be a move action');
      }
      expect(stepResult.actionResult.action.direction).toBe('ne');
      expect(steppedNpc1.position.x).toBe(5);
      expect(steppedNpc1.position.y).toBe(3);
      expect(stepResult.world.turn).toBe(2);
    });
  });

  describe('event logging', () => {
    it('appends an event after a successful movement', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 moved n');
      expect(stepResult.actionResult.success).toBe(true);
    });

    it('does not mutate the original world events', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 moved n');
      expect(stepResult.actionResult.success).toBe(true);
      expect(world.events).toHaveLength(0);
    });

    it('records the attempted turn on the event', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.turn = 3;

      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.turn).toBe(3);
      expect(stepResult.world.turn).toBe(4);
    });

    it('appends an event after a blocked movement attempt', () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 2, y: 1 },
        memories: [],
      });

      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 collides with another NPC');
      expect(stepResult.actionResult.success).toBe(false);
    });
  });
});
