import { describe, expect, it } from 'vitest';
import { createWorld } from '../worldGenerator.js';
import { llmController } from './llmController.js';
import type { ActionOption } from './types.js';

describe('llmController', () => {
  it('returns a decision for the second option when at least two options exist', async () => {
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

    const decision = await llmController.chooseAction({
      world,
      npc,
      actionOptions,
    });

    expect(decision?.selectedOptionId).toBe('move:n');
    expect(decision?.reason).toContain('stub');
  });

  it('returns null when no second option exists', async () => {
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
    ];

    const decision = await llmController.chooseAction({
      world,
      npc,
      actionOptions,
    });

    expect(decision).toBeNull();
  });
});
