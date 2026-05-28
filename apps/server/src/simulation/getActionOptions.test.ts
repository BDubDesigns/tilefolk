import { describe, expect, it } from 'vitest';
import type { Npc, NpcAction } from '@tilefolk/shared';
import { getActionOptions } from './getActionOptions.js';

const testNpc: Npc = {
  id: 'npc_0',
  name: 'Test NPC',
  position: { x: 3, y: 4 },
  memories: [],
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
