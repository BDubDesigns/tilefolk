import { deterministicController } from './deterministicController.js';
import { expect, it, describe } from 'vitest';
import { createWorld } from '../worldGenerator.js';
import type { ActionOption } from './types.js';

describe('deterministicController', () => {
  it('returns a decision for the first option when options exist', async () => {
    const world = createWorld({ numNpcs: 1 });
    const npc = world.npcs[0];
    if (!npc) {
      throw new Error('npc not found');
    }
    const actionOptions: ActionOption[] = [
      {
        id: 'wait',
        description: 'Wait for this turn',
        action: { type: 'wait', npcId: npc.id },
      },
      {
        id: 'move:n',
        description: 'Move 1 tile north',
        action: { type: 'move', npcId: npc.id, direction: 'n' },
      },
    ];
    const controllerDecision = await deterministicController.chooseAction({
      world,
      npc,
      actionOptions,
    });
    const selectedOptionId = controllerDecision?.selectedOptionId;
    expect(selectedOptionId).toBe('wait');
  });

  it('returns null when no options exist', async () => {
    const world = createWorld({ numNpcs: 1 });
    const npc = world.npcs[0];

    if (!npc) {
      throw new Error('npc not found');
    }

    const selectedOptionId = await deterministicController.chooseAction({
      world,
      npc,
      actionOptions: [],
    });

    expect(selectedOptionId).toBeNull();
  });
});
