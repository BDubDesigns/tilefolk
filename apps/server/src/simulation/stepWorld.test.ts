import { describe, it, expect } from 'vitest';
import { stepWorld } from './stepWorld.js';
import { createWorld } from './worldGenerator.js';
import type { World, Position } from '@tilefolk/shared';

function createWorldWithNpcAt(position: Position): World {
  const world: World = createWorld();
  // remove the other npcs from the world
  world.npcs = world.npcs.filter((npc) => npc.id === 'npc_0');

  const npc = world.npcs[0];
  // remove trees
  world.trees = [];
  // remove items
  world.items = [];

  // guard against no NPCs or world
  if (npc === undefined) {
    throw new Error('No NPCs in world');
  }
  // safely set the NPC position
  npc.position.x = position.x;
  npc.position.y = position.y;
  return world;
}

describe('stepWorld', () => {
  describe('successful movement', () => {
    it('moves npc_0 one tile east', () => {
      // step the world
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      const stepResult = stepWorld(world);
      // guard against no NPC in the world
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.world.npcs[0].position.x).toBe(1);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
    });
    it('does not mutate the original world', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // step the world
      const stepResult = stepWorld(world);
      // guard against no NPC in the world
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      if (!world.npcs[0]) {
        throw new Error('World is undefined');
      }
      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.world.npcs[0].position.x).toBe(1);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
      expect(world.npcs[0].position.x).toBe(0);
      expect(world.npcs[0].position.y).toBe(0);
    });

    it('does not block movement when an entity has the same x but a different y', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
      // place another NPC on the ground
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 1, y: 1 },
        memories: [],
      });

      // step the world
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.npcs[0].position.x).toBe(1);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.message).toBe('npc_0 moved east');
    });
  });

  describe('blocked movement', () => {
    it('fails when the NPC is at the edge of the world', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
      // move the npc to the edge of the world
      world.npcs[0].position.x = world.width - 1;
      // step the world
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.npcs[0].position.x).toBe(world.width - 1);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 is at the edge of the world');
    });

    it('fails when the NPC collides with a tree', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
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
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.npcs[0].position.x).toBe(0);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with a tree');
    });

    it('fails when the destination contains a ground item', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
      // place an item on the ground
      world.items.push({
        id: 'item_0',
        name: 'Bronze Axe',
        location: { type: 'ground', position: { x: 1, y: 0 } },
        type: 'axe',
      });

      // step the world
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.npcs[0].position.x).toBe(0);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.message).toBe('npc_0 collides with an item');
    });

    it('fails when the destination contains another NPC', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
      // place another NPC on the ground
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 1, y: 0 },
        memories: [],
      });

      // step the world
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.npcs[0].position.x).toBe(0);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
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
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
      // step the world
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.turn).toBe(1);
    });

    it('does not mutate the original world turn', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
      // step the world
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.turn).toBe(1);
      expect(world.turn).toBe(0);
    });

    it('increments the world turn after a blocked movement attempt', () => {
      // create a world with an NPC at position (0, 0)
      const world = createWorldWithNpcAt({ x: 0, y: 0 });
      // guard against no NPC in the world
      if (!world.npcs[0]) {
        throw new Error('No NPCS in world');
      }
      // place another NPC on the ground
      world.npcs.push({
        id: 'npc_1',
        name: 'NPC 1',
        position: { x: 1, y: 0 },
        memories: [],
      });
      // step the world
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0]) {
        throw new Error('Failed to step world');
      }
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
      if (!world.npcs[0] || !world.npcs[1]) {
        throw new Error('No NPCS in world');
      }
      // set npc_0 to { x: 0, y: 0 }
      world.npcs[0].position.x = 0;
      world.npcs[0].position.y = 0;
      // set npc_1 to { x: 10, y: 0 }
      world.npcs[1].position.x = 10;
      world.npcs[1].position.y = 0;

      // step
      const stepResult = stepWorld(world);
      if (!stepResult.world.npcs[0] || !stepResult.world.npcs[1]) {
        throw new Error('Failed to step world');
      }
      expect(stepResult.world.npcs[0].position.x).toBe(0);
      expect(stepResult.world.npcs[0].position.y).toBe(0);
      expect(stepResult.actionResult.action.npcId).toBe('npc_1');
      expect(stepResult.world.npcs[1].position.x).toBe(11);
      expect(stepResult.world.npcs[1].position.y).toBe(0);
      expect(stepResult.world.turn).toBe(2);
    });
  });
});
