import { describe, expect, it } from 'vitest';
import type { Npc, NpcAction, World } from '@tilefolk/shared';
import { getActionOptions } from './getActionOptions.js';

const testNpc: Npc = {
  id: 'npc_0',
  name: 'Test NPC',
  position: { x: 3, y: 4 },
  memories: [],
  needs: { hunger: 0 },
};

describe('getActionOptions', () => {
  it('converts move actions into action options', () => {
    const moveAction: NpcAction = { type: 'move', npcId: 'npc_0', direction: 'n' };

    const options = getActionOptions([moveAction], { npc: testNpc });

    expect(options).toEqual([
      {
        id: 'move:n',
        description: 'Move 1 tile north to (3, 3)',
        action: moveAction,
      },
    ]);
  });

  it('can describe move actions without destination context', () => {
    const moveAction: NpcAction = { type: 'move', npcId: 'npc_0', direction: 'se' };

    const options = getActionOptions([moveAction]);

    expect(options).toEqual([
      {
        id: 'move:se',
        description: 'Move 1 tile southeast',
        action: moveAction,
      },
    ]);
  });

  it('converts pickup actions into action options', () => {
    const pickupAction: NpcAction = { type: 'pickup', npcId: 'npc_0', itemId: 'item_0' };

    const options = getActionOptions([pickupAction]);

    expect(options).toEqual([
      {
        id: 'pickup:item_0',
        description: 'Pick up item item_0',
        action: pickupAction,
      },
    ]);
  });

  it('uses item context when describing pickup actions', () => {
    const pickupAction: NpcAction = { type: 'pickup', npcId: 'npc_0', itemId: 'item_0' };
    const world: World = {
      id: 'world_0',
      width: 25,
      height: 25,
      turn: 0,
      round: 0,
      tiles: [],
      npcs: [testNpc],
      trees: [],
      bushes: [],
      items: [
        {
          id: 'item_0',
          name: 'Bronze Axe',
          type: 'axe',
          location: { type: 'ground', position: { x: 4, y: 4 } },
        },
      ],
      events: [],
      debug: { decisionTraces: [] },
    };

    const options = getActionOptions([pickupAction], { world });

    expect(options).toEqual([
      {
        id: 'pickup:item_0',
        description: 'Pick up Bronze Axe (item_0)',
        action: pickupAction,
      },
    ]);
  });

  it('uses tree context when describing chop tree actions', () => {
    const chopAction: NpcAction = { type: 'chopTree', npcId: 'npc_0', treeId: 'tree_0' };
    const world: World = {
      id: 'world_0',
      width: 25,
      height: 25,
      turn: 0,
      round: 0,
      tiles: [],
      npcs: [testNpc],
      trees: [
        {
          id: 'tree_0',
          position: { x: 5, y: 6 },
          hitPoints: 2,
        },
      ],
      bushes: [],
      items: [],
      events: [],
      debug: { decisionTraces: [] },
    };

    const options = getActionOptions([chopAction], { world });

    expect(options).toEqual([
      {
        id: 'chopTree:tree_0',
        description: 'Chop tree tree_0 at (5, 6), hp 2',
        action: chopAction,
      },
    ]);
  });

  it('converts wait actions into action options', () => {
    const waitAction: NpcAction = { type: 'wait', npcId: 'npc_0' };

    const options = getActionOptions([waitAction]);

    expect(options).toEqual([
      {
        id: 'wait',
        description: 'Wait for this turn',
        action: waitAction,
      },
    ]);
  });

  it('preserves the original action object inside each option', () => {
    const moveAction: NpcAction = { type: 'move', npcId: 'npc_0', direction: 'ne' };

    const option = getActionOptions([moveAction])[0];

    expect(option?.action).toBe(moveAction);
  });
});
