import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWorld } from '../worldGenerator.js';
import { resolveControllerDecision } from './resolveControllerDecision.js';
import { requestOpenRouterDecision } from './openRouterDecisionClient.js';
import type { ActionOption } from './types.js';

vi.mock('./openRouterDecisionClient.js', () => ({
  requestOpenRouterDecision: vi.fn(),
}));

vi.mock('./openCodeGoDecisionClient.js', () => ({
  requestOpenCodeGoDecision: vi.fn(),
}));

vi.mock('./googleAiDecisionClient.js', () => ({
  requestGoogleAiDecision: vi.fn(),
}));

const mockedRequestOpenRouterDecision = vi.mocked(requestOpenRouterDecision);

const getNpcOrThrow = (world: ReturnType<typeof createWorld>) => {
  const npc = world.npcs[0];
  if (!npc) throw new Error('Expected test world to include an NPC');
  return npc;
};

describe('resolveControllerDecision', () => {
  beforeEach(() => {
    mockedRequestOpenRouterDecision.mockReset();
  });

  it('returns the provider decision when the provider selects an option', async () => {
    const world = createWorld({ numNpcs: 1, numItems: 0, numTrees: 0 });
    const npc = getNpcOrThrow(world);
    const actionOptions: ActionOption[] = [
      {
        id: 'wait',
        description: 'Wait for this turn',
        action: { type: 'wait', npcId: npc.id },
      },
    ];

    mockedRequestOpenRouterDecision.mockResolvedValue({
      selectedOptionId: 'wait',
      reason: 'Provider chose to wait.',
    });

    const decision = await resolveControllerDecision({
      world,
      npc,
      actionOptions,
      controllerAssignment: { type: 'llm', provider: 'openrouter' },
    });

    expect(decision).toEqual({
      selectedOptionId: 'wait',
      reason: 'Provider chose to wait.',
    });
  });

  it('falls back to deterministic selection when the provider returns null', async () => {
    const world = createWorld({ numNpcs: 1, numItems: 0, numTrees: 0 });
    const npc = getNpcOrThrow(world);
    const actionOptions: ActionOption[] = [
      {
        id: 'move:n',
        description: 'Move 1 tile north to (2, 1)',
        action: { type: 'move', npcId: npc.id, direction: 'n' },
      },
      {
        id: 'wait',
        description: 'Wait for this turn',
        action: { type: 'wait', npcId: npc.id },
      },
    ];

    mockedRequestOpenRouterDecision.mockResolvedValue(null);

    const decision = await resolveControllerDecision({
      world,
      npc,
      actionOptions,
      controllerAssignment: { type: 'llm', provider: 'openrouter' },
    });

    expect(decision).toEqual({
      selectedOptionId: 'move:n',
      reason: 'LLM failed; deterministic fallback selected the first valid option.',
    });
  });
});
