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
    it('moves npc_0 one tile east', () => {
      // step the world
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      const stepResult = stepWorld(world);
      // guard against no NPC in the world
      const npc = getNpcOrThrow(stepResult.world, 0);
      expect(stepResult.actionResult.success).toBe(true);
      expect(npc.position.x).toBe(1);
      expect(npc.position.y).toBe(0);
    });
    it('does not mutate the original world', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // step the world
      const stepResult = stepWorld(world);
      // guard against no NPC in the world
      const npc1 = getNpcOrThrow(stepResult.world, 0);
      const npc2 = getNpcOrThrow(world, 0);
      expect(stepResult.actionResult.success).toBe(true);
      expect(npc1.position.x).toBe(1);
      expect(npc1.position.y).toBe(0);
      expect(npc2.position.x).toBe(0);
      expect(npc2.position.y).toBe(0);
    });

    it('does not block movement when an entity has the same x but a different y', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // place another NPC on the ground
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 1, y: 1 },
        memories: [],
      });

      // step the world
      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);
      expect(npc.position.x).toBe(1);
      expect(npc.position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.message).toBe('npc_0 moved east');
    });
  });

  describe('blocked movement', () => {
    it('fails when the NPC is at the edge of the world', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      const npc = getNpcOrThrow(world, 0);
      // move the npc to the edge of the world
      npc.position.x = world.width - 1;
      // step the world
      const stepResult = stepWorld(world);
      const steppedNpc = getNpcOrThrow(stepResult.world, 0);
      expect(steppedNpc.position.x).toBe(world.width - 1);
      expect(steppedNpc.position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 is at the edge of the world');
    });

    it('fails when the NPC collides with a tree', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // place a tree to the right of the NPC
      world.trees = [
        {
          id: 'tree_0',
          position: { x: 1, y: 0 },
          hitPoints: 3,
        },
      ];
      // step the world
      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);
      expect(npc.position.x).toBe(0);
      expect(npc.position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with a tree');
    });

    it('fails when the destination contains a ground item', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // place an item on the ground
      world.items.push({
        id: 'item_0',
        name: 'Bronze Axe',
        location: { type: 'ground', position: { x: 1, y: 0 } },
        type: 'axe',
      });

      // step the world
      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);
      expect(npc.position.x).toBe(0);
      expect(npc.position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with an item');
    });

    it('fails when the destination contains another NPC', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // place another NPC on the ground
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 1, y: 0 },
        memories: [],
      });

      // step the world
      const stepResult = stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);
      expect(npc.position.x).toBe(0);
      expect(npc.position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with another NPC');
    });
  });

  describe('missing actors', () => {
    it('fails when there are no NPCs in the world', () => {
      // create a world with no NPCs
      const world = createWorld();
      // remove all NPCs from the world
      world.npcs = [];
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('No NPCs to move');
    });
  });

  describe('turn tracking', () => {
    it('increments the world turn after a successful step', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.world.turn).toBe(1);
    });

    it('does not mutate the original world turn', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.world.turn).toBe(1);
      expect(world.turn).toBe(0);
    });

    it('increments the world turn after a blocked movement attempt', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // place another NPC on the ground
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 1, y: 0 },
        memories: [],
      });
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.world.turn).toBe(1);
    });

    it('uses the world turn to choose which NPC acts', () => {
      // create a standard world
      const world = createWorld();
      world.trees = [];
      world.items = [];
      world.turn = 1;

      // guard npc_0 and npc_1 exist
      const npc0 = getNpcOrThrow(world, 0);
      const npc1 = getNpcOrThrow(world, 1);
      // set npc_0 to { x: 0, y: 0 }
      npc0.position.x = 0;
      npc0.position.y = 0;
      // set npc_1 to { x: 10, y: 0 }
      npc1.position.x = 10;
      npc1.position.y = 0;

      // step
      const stepResult = stepWorld(world);
      const steppedNpc0 = getNpcOrThrow(stepResult.world, 0);
      const steppedNpc1 = getNpcOrThrow(stepResult.world, 1);
      expect(steppedNpc0.position.x).toBe(0);
      expect(steppedNpc0.position.y).toBe(0);
      expect(stepResult.actionResult.action.npcId).toBe('npc_1');
      expect(steppedNpc1.position.x).toBe(11);
      expect(steppedNpc1.position.y).toBe(0);
      expect(stepResult.world.turn).toBe(2);
    });
  });

  describe('event logging', () => {
    it('appends an event after a successful movement', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      // grab the event
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 moved east');
      expect(stepResult.actionResult.success).toBe(true);
    });
    it('does not mutate the original world events', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      // grab the event
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 moved east');
      expect(stepResult.actionResult.success).toBe(true);
      // check that the original world is not mutated
      expect(world.events).toHaveLength(0);
    });
    it('records the attempted turn on the event', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      world.turn = 3;
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      // grab the event
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.turn).toBe(3);
      expect(stepResult.world.turn).toBe(4);
    });
    it('appends an event after a blocked movement attempt', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // place another NPC on the ground
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 1, y: 0 },
        memories: [],
      });
      // step the world
      const stepResult = stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      // grab the event
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 collides with another NPC');
      expect(stepResult.actionResult.success).toBe(false);
    });
  });
});
