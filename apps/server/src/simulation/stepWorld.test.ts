import { describe, expect, it } from 'vitest';
import { stepWorld } from './stepWorld.js';
import { createWorld } from './worldGenerator.js';
import { NEEDS_MAX_VALUES, type Position, type World, type WorldEvent } from '@tilefolk/shared';

function createWorldWithNpcAt(position: Position): World {
  const world = createWorld();
  world.npcs = world.npcs.filter((npc) => npc.id === 'npc_0');
  world.trees = [];
  world.items = [];

  const npc = getNpcOrThrow(world, 0);
  npc.position.x = position.x;
  npc.position.y = position.y;

  return world;
}

function getNpcOrThrow(world: World, index: number) {
  const npc = world.npcs[index];

  if (!npc) {
    throw new Error(`Expected NPC at index ${index}`);
  }

  return npc;
}

function getEventOrThrow(world: World, index: number): WorldEvent {
  const event = world.events[index];

  if (!event) {
    throw new Error(`Expected event at index ${index}`);
  }

  return event;
}

function getItemOrThrow(world: World, itemId: string) {
  const item = world.items.find((item) => item.id === itemId);

  if (!item) {
    throw new Error(`Expected item with id ${itemId}`);
  }

  return item;
}

function surroundNpcWithTrees(world: World, center: Position): void {
  world.trees = [
    { id: 'tree_n', position: { x: center.x, y: center.y - 1 }, hitPoints: 3 },
    { id: 'tree_ne', position: { x: center.x + 1, y: center.y - 1 }, hitPoints: 3 },
    { id: 'tree_e', position: { x: center.x + 1, y: center.y }, hitPoints: 3 },
    { id: 'tree_se', position: { x: center.x + 1, y: center.y + 1 }, hitPoints: 3 },
    { id: 'tree_s', position: { x: center.x, y: center.y + 1 }, hitPoints: 3 },
    { id: 'tree_sw', position: { x: center.x - 1, y: center.y + 1 }, hitPoints: 3 },
    { id: 'tree_w', position: { x: center.x - 1, y: center.y }, hitPoints: 3 },
    { id: 'tree_nw', position: { x: center.x - 1, y: center.y - 1 }, hitPoints: 3 },
  ];
}

describe('stepWorld', () => {
  describe('movement application', () => {
    it('applies the first valid movement action', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);

      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.action.type).toBe('move');
      expect(npc.position.x).toBe(2);
      expect(npc.position.y).toBe(1);
      if (stepResult.actionResult.action.type !== 'move') {
        throw new Error('Expected action to be a move action');
      }
      expect(stepResult.actionResult.action.direction).toBe('n');
    });

    it('does not mutate the original world', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);
      const steppedNpc = getNpcOrThrow(stepResult.world, 0);
      const originalNpc = getNpcOrThrow(world, 0);

      expect(stepResult.actionResult.success).toBe(true);
      expect(steppedNpc.position.x).toBe(2);
      expect(steppedNpc.position.y).toBe(1);
      expect(originalNpc.position.x).toBe(2);
      expect(originalNpc.position.y).toBe(2);
    });

    it('uses the next valid movement action when the first direction is blocked', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.trees = [{ id: 'tree_0', position: { x: 2, y: 1 }, hitPoints: 3 }];

      const stepResult = await stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);

      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.action.type).toBe('move');
      expect(npc.position.x).toBe(3);
      expect(npc.position.y).toBe(1);
      if (stepResult.actionResult.action.type !== 'move') {
        throw new Error('Expected action to be a move action');
      }
      expect(stepResult.actionResult.action.direction).toBe('ne');
      expect(stepResult.actionResult.message).toBe('npc_0 moved ne');
    });
  });

  describe('wait fallback', () => {
    it('waits when the active NPC has no valid movement actions', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      surroundNpcWithTrees(world, { x: 2, y: 2 });

      const stepResult = await stepWorld(world);
      const npc = getNpcOrThrow(stepResult.world, 0);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.action).toEqual({ type: 'wait', npcId: 'npc_0' });
      expect(stepResult.actionResult.message).toBe('npc_0 waited');
      expect(npc.position.x).toBe(2);
      expect(npc.position.y).toBe(2);
      expect(stepResult.world.turn).toBe(1);
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 waited');
    });
  });

  describe('pickup application', () => {
    it('moves an in-range ground item into the active NPC inventory', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_0',
          name: 'Bronze Axe',
          location: { type: 'ground', position: { x: 3, y: 2 } },
          type: 'axe',
        },
      ];

      const stepResult = await stepWorld(world);
      const item = getItemOrThrow(stepResult.world, 'item_0');

      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.action).toEqual({
        type: 'pickup',
        npcId: 'npc_0',
        itemId: 'item_0',
      });
      expect(item.location).toEqual({ type: 'inventory', npcId: 'npc_0' });
    });

    it('does not mutate the original world item location', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_0',
          name: 'Bronze Axe',
          location: { type: 'ground', position: { x: 3, y: 2 } },
          type: 'axe',
        },
      ];

      const stepResult = await stepWorld(world);
      const steppedItem = getItemOrThrow(stepResult.world, 'item_0');
      const originalItem = getItemOrThrow(world, 'item_0');

      expect(steppedItem.location).toEqual({ type: 'inventory', npcId: 'npc_0' });
      expect(originalItem.location).toEqual({
        type: 'ground',
        position: { x: 3, y: 2 },
      });
    });

    it('records a pickup event', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_0',
          name: 'Bronze Axe',
          location: { type: 'ground', position: { x: 3, y: 2 } },
          type: 'axe',
        },
      ];

      const stepResult = await stepWorld(world);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 picked up item_0');
    });
  });

  describe('chop tree application', () => {
    it('reduces the target tree hit points by 1', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_axe',
          name: 'Bronze Axe',
          location: { type: 'inventory', npcId: 'npc_0' },
          type: 'axe',
        },
      ];
      world.trees = [{ id: 'tree_0', position: { x: 3, y: 2 }, hitPoints: 3 }];

      const stepResult = await stepWorld(world);
      const tree = stepResult.world.trees.find((tree) => tree.id === 'tree_0');

      expect(stepResult.actionResult.success).toBe(true);
      expect(stepResult.actionResult.action).toEqual({
        type: 'chopTree',
        npcId: 'npc_0',
        treeId: 'tree_0',
      });
      expect(tree?.hitPoints).toBe(2);
    });

    it('does not mutate the original world tree hit points', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_axe',
          name: 'Bronze Axe',
          location: { type: 'inventory', npcId: 'npc_0' },
          type: 'axe',
        },
      ];
      world.trees = [{ id: 'tree_0', position: { x: 3, y: 2 }, hitPoints: 3 }];

      const stepResult = await stepWorld(world);
      const steppedTree = stepResult.world.trees.find((tree) => tree.id === 'tree_0');
      const originalTree = world.trees.find((tree) => tree.id === 'tree_0');

      expect(steppedTree?.hitPoints).toBe(2);
      expect(originalTree?.hitPoints).toBe(3);
    });

    it('records a chop tree event', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_axe',
          name: 'Bronze Axe',
          location: { type: 'inventory', npcId: 'npc_0' },
          type: 'axe',
        },
      ];
      world.trees = [{ id: 'tree_0', position: { x: 3, y: 2 }, hitPoints: 3 }];

      const stepResult = await stepWorld(world);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 chopped tree tree_0');
      expect(event.position).toEqual({ x: 2, y: 2 });
    });

    it('creates memories for nearby NPCs that witness a chop event', async () => {
      const world = createWorld();
      world.npcs = world.npcs.slice(0, 2);
      world.items = [
        {
          id: 'item_axe',
          name: 'Bronze Axe',
          location: { type: 'inventory', npcId: 'npc_0' },
          type: 'axe',
        },
      ];
      world.trees = [{ id: 'tree_0', position: { x: 3, y: 2 }, hitPoints: 3 }];
      world.turn = 0;

      const actor = getNpcOrThrow(world, 0);
      const witness = getNpcOrThrow(world, 1);
      actor.position = { x: 2, y: 2 };
      witness.position = { x: 4, y: 2 };

      const stepResult = await stepWorld(world);
      const steppedActor = getNpcOrThrow(stepResult.world, 0);
      const steppedWitness = getNpcOrThrow(stepResult.world, 1);

      expect(steppedActor.memories[0]).toMatchObject({
        npcId: 'npc_0',
        sourceEventId: 'event_0',
        message: 'npc_0 chopped tree tree_0',
      });
      expect(steppedWitness.memories[0]).toMatchObject({
        npcId: 'npc_1',
        sourceEventId: 'event_0',
        message: 'npc_0 chopped tree tree_0',
      });
    });

    it('removes a depleted tree and creates wood at the tree position', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_axe',
          name: 'Bronze Axe',
          location: { type: 'inventory', npcId: 'npc_0' },
          type: 'axe',
        },
      ];
      world.trees = [{ id: 'tree_0', position: { x: 3, y: 2 }, hitPoints: 1 }];

      const stepResult = await stepWorld(world);
      const depletedTree = stepResult.world.trees.find((tree) => tree.id === 'tree_0');
      const wood = stepResult.world.items.find((item) => item.id === 'item_wood_tree_0');

      expect(depletedTree).toBeUndefined();
      expect(wood).toEqual({
        id: 'item_wood_tree_0',
        name: 'Wood',
        location: { type: 'ground', position: { x: 3, y: 2 } },
        type: 'wood',
      });
    });

    it('does not mutate the original world when a depleted tree drops wood', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.items = [
        {
          id: 'item_axe',
          name: 'Bronze Axe',
          location: { type: 'inventory', npcId: 'npc_0' },
          type: 'axe',
        },
      ];
      world.trees = [{ id: 'tree_0', position: { x: 3, y: 2 }, hitPoints: 1 }];

      const stepResult = await stepWorld(world);

      expect(stepResult.world.items).toContainEqual({
        id: 'item_wood_tree_0',
        name: 'Wood',
        location: { type: 'ground', position: { x: 3, y: 2 } },
        type: 'wood',
      });
      expect(world.trees).toEqual([{ id: 'tree_0', position: { x: 3, y: 2 }, hitPoints: 1 }]);
      expect(world.items).toEqual([
        {
          id: 'item_axe',
          name: 'Bronze Axe',
          location: { type: 'inventory', npcId: 'npc_0' },
          type: 'axe',
        },
      ]);
    });
  });

  describe('missing actors', () => {
    it('fails when there are no NPCs in the world', async () => {
      const world = createWorld();
      world.npcs = [];

      const stepResult = await stepWorld(world);

      expect(stepResult.actionResult.success).toBe(false);
      expect(stepResult.actionResult.action).toEqual({ type: 'wait', npcId: 'N/A' });
      expect(stepResult.actionResult.message).toBe('No NPCs to act');
    });
  });

  describe('round tracking', () => {
    it("doesn't increment the round prematurely", async () => {
      const world = createWorld();

      const stepResult = await stepWorld(world);

      expect(stepResult.world.round).toBe(0);
      expect(stepResult.world.turn).toBe(1);
    });

    it('increments the round after all NPCs have acted', async () => {
      const world = createWorld();
      world.turn = 3;
      world.round = 0;

      const stepResult = await stepWorld(world);

      expect(stepResult.actionResult.action.npcId).toBe('npc_3');
      expect(stepResult.world.round).toBe(1);
      expect(stepResult.world.turn).toBe(4);
    });

    it('does not mutate the original world round', async () => {
      const world = createWorld();
      world.turn = 3;
      world.round = 0;

      const stepResult = await stepWorld(world);

      expect(stepResult.world.round).toBe(1);
      expect(world.round).toBe(0);
    });

    it('does not increase hunger before a full round completes', async () => {
      const world = createWorld();
      world.turn = 0;
      world.round = 0;

      const stepResult = await stepWorld(world);

      expect(stepResult.world.round).toBe(0);
      expect(stepResult.world.npcs.map((npc) => npc.needs.hunger)).toEqual(
        world.npcs.map((npc) => npc.needs.hunger),
      );
    });

    it('increases every NPC hunger when a full round completes', async () => {
      const world = createWorld();
      world.turn = world.npcs.length - 1;
      world.round = 0;
      for (const npc of world.npcs) {
        npc.needs.hunger = 10;
      }

      const stepResult = await stepWorld(world);

      expect(stepResult.world.round).toBe(1);
      expect(stepResult.world.npcs.map((npc) => npc.needs.hunger)).toEqual(
        world.npcs.map(() => 11),
      );
    });

    it('does not mutate original world NPC hunger when a full round completes', async () => {
      const world = createWorld();
      world.turn = world.npcs.length - 1;
      world.round = 0;
      for (const npc of world.npcs) {
        npc.needs.hunger = 10;
      }

      const stepResult = await stepWorld(world);

      expect(stepResult.world.npcs.map((npc) => npc.needs.hunger)).toEqual(
        world.npcs.map(() => 11),
      );
      expect(world.npcs.map((npc) => npc.needs.hunger)).toEqual(world.npcs.map(() => 10));
    });

    it('does not increase hunger above the max when a full round completes', async () => {
      const world = createWorld();
      world.turn = world.npcs.length - 1;
      world.round = 0;
      for (const npc of world.npcs) {
        npc.needs.hunger = NEEDS_MAX_VALUES.hunger;
      }

      const stepResult = await stepWorld(world);

      expect(stepResult.world.npcs.map((npc) => npc.needs.hunger)).toEqual(
        world.npcs.map(() => NEEDS_MAX_VALUES.hunger),
      );
    });
  });

  describe('turn tracking', () => {
    it('increments the world turn after a successful step', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);

      expect(stepResult.world.turn).toBe(1);
    });

    it('does not mutate the original world turn', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);

      expect(stepResult.world.turn).toBe(1);
      expect(world.turn).toBe(0);
    });

    it('uses the world turn to choose which NPC acts', async () => {
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

      const stepResult = await stepWorld(world);
      const steppedNpc0 = getNpcOrThrow(stepResult.world, 0);
      const steppedNpc1 = getNpcOrThrow(stepResult.world, 1);

      expect(steppedNpc0.position.x).toBe(2);
      expect(steppedNpc0.position.y).toBe(2);
      expect(stepResult.actionResult.action.type).toBe('move');
      expect(stepResult.actionResult.action.npcId).toBe('npc_1');
      if (stepResult.actionResult.action.type !== 'move') {
        throw new Error('Expected action to be a move action');
      }
      expect(stepResult.actionResult.action.direction).toBe('n');
      expect(steppedNpc1.position.x).toBe(4);
      expect(steppedNpc1.position.y).toBe(3);
      expect(stepResult.world.turn).toBe(2);
    });
  });

  describe('event logging', () => {
    it('appends an event after a successful movement', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 moved n');
      expect(event.position).toEqual({ x: 2, y: 1 });
      expect(stepResult.actionResult.success).toBe(true);
    });

    it('does not mutate the original world events', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.id).toBe('event_0');
      expect(event.turn).toBe(0);
      expect(event.actorId).toBe('npc_0');
      expect(event.message).toBe('npc_0 moved n');
      expect(event.position).toEqual({ x: 2, y: 1 });
      expect(stepResult.actionResult.success).toBe(true);
      expect(world.events).toHaveLength(0);
    });

    it('records the attempted turn on the event', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });
      world.turn = 3;

      const stepResult = await stepWorld(world);
      expect(stepResult.world.events).toHaveLength(1);
      const event = getEventOrThrow(stepResult.world, 0);

      expect(event.turn).toBe(3);
      expect(stepResult.world.turn).toBe(4);
    });

    it('records event position as a snapshot', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);
      const event = getEventOrThrow(stepResult.world, 0);
      const npc = getNpcOrThrow(stepResult.world, 0);

      npc.position.x = 9;
      npc.position.y = 9;

      expect(event.position).toEqual({ x: 2, y: 1 });
    });
  });

  describe('memory creation', () => {
    it('creates a memory for the acting NPC after a positioned event', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);
      const actor = getNpcOrThrow(stepResult.world, 0);

      expect(actor.memories).toHaveLength(1);
      expect(actor.memories[0]).toMatchObject({
        id: 'memory_npc_0_0',
        npcId: 'npc_0',
        sourceEventId: 'event_0',
        turn: 0,
        message: 'npc_0 moved n',
        position: { x: 2, y: 1 },
      });
    });

    it('creates memories for nearby NPCs that witness an event', async () => {
      const world = createWorld();
      world.npcs = world.npcs.slice(0, 2);
      world.items = [];
      world.trees = [];
      world.turn = 0;

      const actor = getNpcOrThrow(world, 0);
      const witness = getNpcOrThrow(world, 1);
      actor.position = { x: 2, y: 2 };
      witness.position = { x: 3, y: 1 };

      const stepResult = await stepWorld(world);
      const steppedActor = getNpcOrThrow(stepResult.world, 0);
      const steppedWitness = getNpcOrThrow(stepResult.world, 1);

      expect(steppedActor.memories.map((memory) => memory.npcId)).toEqual(['npc_0']);
      expect(steppedWitness.memories.map((memory) => memory.npcId)).toEqual(['npc_1']);
      expect(steppedActor.memories[0]).toMatchObject({
        id: 'memory_npc_0_0',
        sourceEventId: 'event_0',
      });
      expect(steppedWitness.memories[0]).toMatchObject({
        id: 'memory_npc_1_0',
        sourceEventId: 'event_0',
      });
    });

    it('does not create memories for NPCs outside the witness radius', async () => {
      const world = createWorld();
      world.npcs = world.npcs.slice(0, 2);
      world.items = [];
      world.trees = [];
      world.turn = 0;

      const actor = getNpcOrThrow(world, 0);
      const farNpc = getNpcOrThrow(world, 1);
      actor.position = { x: 2, y: 2 };
      farNpc.position = { x: 9, y: 9 };

      const stepResult = await stepWorld(world);
      const steppedActor = getNpcOrThrow(stepResult.world, 0);
      const steppedFarNpc = getNpcOrThrow(stepResult.world, 1);

      expect(steppedActor.memories).toHaveLength(1);
      expect(steppedActor.memories[0]).toMatchObject({
        id: 'memory_npc_0_0',
        npcId: 'npc_0',
      });
      expect(steppedFarNpc.memories).toEqual([]);
    });

    it('does not mutate the original world NPC memories', async () => {
      const world = createWorldWithNpcAt({ x: 2, y: 2 });

      const stepResult = await stepWorld(world);

      expect(getNpcOrThrow(stepResult.world, 0).memories).toHaveLength(1);
      expect(getNpcOrThrow(world, 0).memories).toEqual([]);
    });
  });
});
