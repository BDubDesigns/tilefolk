import { deterministicController } from './deterministicController.js';
import { expect, it, describe } from 'vitest';
import { createWorld } from '../worldGenerator.js';
import type { NpcAction } from '@tilefolk/shared';

describe('deterministicController', () => {
  it('returns the first action when actions exist', () => {
    const world = createWorld({ numNpcs: 1 });
    const npc = world.npcs[0];
    if (!npc) {
      throw new Error('npc not found');
    }
    const actions: NpcAction[] = [
      { type: 'wait', npcId: npc.id },
      { type: 'move', npcId: npc.id, direction: 'n' },
    ];
    const selectedAction = deterministicController.chooseAction({
      world,
      npc,
      actions,
    });
    expect(selectedAction).toEqual(actions[0]);
  });

  it('returns null when no actions exist', () => {
    const world = createWorld({ numNpcs: 1 });
    const npc = world.npcs[0];

    if (!npc) {
      throw new Error('npc not found');
    }

    const selectedAction = deterministicController.chooseAction({
      world,
      npc,
      actions: [],
    });

    expect(selectedAction).toBeNull();
  });
});
