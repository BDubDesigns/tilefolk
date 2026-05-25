import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWorld } from '../worldGenerator.js';
import { llmController } from './llmController.js';
import { requestOpenCodeGoDecision } from './openCodeGoDecisionClient.js';
import type { ActionOption } from './types.js';

vi.mock('./openCodeGoDecisionClient.js', () => ({
  requestOpenCodeGoDecision: vi.fn(),
}));

const mockedRequestOpenCodeGoDecision = vi.mocked(requestOpenCodeGoDecision);

describe('llmController', () => {
  beforeEach(() => {
    mockedRequestOpenCodeGoDecision.mockReset();
  });

  it('returns the OpenCode Go decision', async () => {
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

    mockedRequestOpenCodeGoDecision.mockResolvedValue({
      selectedOptionId: 'move:n',
      reason: 'Move north to explore.',
    });

    const decision = await llmController.chooseAction({
      world,
      npc,
      actionOptions,
    });

    expect(decision).toEqual({
      selectedOptionId: 'move:n',
      reason: 'Move north to explore.',
    });
  });

  it('passes only the latest five events to OpenCode Go', async () => {
    const world = createWorld({ numNpcs: 1 });
    const npc = world.npcs[0];

    if (!npc) {
      throw new Error('npc not found');
    }

    world.events = Array.from({ length: 6 }, (_, index) => ({
      id: `event_${index}`,
      turn: index,
      actorId: npc.id,
      message: `event ${index}`,
    }));

    mockedRequestOpenCodeGoDecision.mockResolvedValue(null);

    await llmController.chooseAction({
      world,
      npc,
      actionOptions: [],
    });

    expect(mockedRequestOpenCodeGoDecision).toHaveBeenCalledWith({
      recentEvents: world.events.slice(-5),
      npc,
      actionOptions: [],
    });
  });
});
