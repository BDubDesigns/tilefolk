import { describe, expect, it, vi } from 'vitest';

import { runCerebrasProviderProbe, type CerebrasDecisionRequester } from './cerebrasProviderProbe.js';

import type { ProviderTestTarget } from './providerTestTargets.js';

const cerebrasTarget: ProviderTestTarget = {
  provider: 'cerebras',
  model: 'gpt-oss-120b',
};

describe('runCerebrasProviderProbe', () => {
  it('returns success when Cerebras selects the expected provider test option', async () => {
    const requestDecision = vi.fn<CerebrasDecisionRequester>(async () => ({
      selectedOptionId: 'provider-test-wait',
      reason: 'Only available option.',
    }));

    const result = await runCerebrasProviderProbe(cerebrasTarget, { requestDecision });

    expect(result).toEqual({
      success: true,
      message: 'Cerebras selected expected provider test option provider-test-wait.',
    });
    expect(requestDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-oss-120b',
        actionOptions: [
          expect.objectContaining({
            id: 'provider-test-wait',
          }),
        ],
      }),
    );
  });

  it('returns failure when Cerebras returns no valid decision', async () => {
    const requestDecision = vi.fn<CerebrasDecisionRequester>(async () => null);

    const result = await runCerebrasProviderProbe(cerebrasTarget, { requestDecision });

    expect(result).toEqual({
      success: false,
      message: 'Cerebras returned no valid provider test decision.',
    });
  });

  it('returns failure when Cerebras selects the wrong option', async () => {
    const requestDecision = vi.fn<CerebrasDecisionRequester>(async () => ({
      selectedOptionId: 'unexpected-option',
      reason: 'Selected something else.',
    }));

    const result = await runCerebrasProviderProbe(cerebrasTarget, { requestDecision });

    expect(result).toEqual({
      success: false,
      message: 'Cerebras selected unexpected option unexpected-option.',
    });
  });
});
