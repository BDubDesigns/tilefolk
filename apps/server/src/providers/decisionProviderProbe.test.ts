import { describe, expect, it, vi } from 'vitest';

import { runDecisionProviderProbe, type DecisionRequester } from './decisionProviderProbe.js';

import type { ProviderTestTarget } from './providerTestTargets.js';

const target: ProviderTestTarget = {
  provider: 'openrouter',
  model: 'test-model',
};

describe('runDecisionProviderProbe', () => {
  it('returns success when the requester selects the expected provider test option', async () => {
    const requestDecision = vi.fn<DecisionRequester>(async () => ({
      selectedOptionId: 'provider-test-wait',
      reason: 'Only available option.',
    }));

    const result = await runDecisionProviderProbe({
      providerLabel: 'Test Provider',
      target,
      requestDecision,
    });

    expect(result).toEqual({
      success: true,
      message: 'Test Provider selected expected provider test option provider-test-wait.',
    });
    expect(requestDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'test-model',
        actionOptions: [
          expect.objectContaining({
            id: 'provider-test-wait',
          }),
        ],
      }),
    );
  });

  it('returns failure when the requester returns no valid decision', async () => {
    const requestDecision = vi.fn<DecisionRequester>(async () => null);

    const result = await runDecisionProviderProbe({
      providerLabel: 'Test Provider',
      target,
      requestDecision,
    });

    expect(result).toEqual({
      success: false,
      message: 'Test Provider returned no valid provider test decision.',
    });
  });

  it('returns requester failure details when provided', async () => {
    const requestDecision = vi.fn<DecisionRequester>(async ({ onFailure }) => {
      onFailure?.('Provider API returned status 500.');
      return null;
    });

    const result = await runDecisionProviderProbe({
      providerLabel: 'Test Provider',
      target,
      requestDecision,
    });

    expect(result).toEqual({
      success: false,
      message: 'Provider API returned status 500.',
    });
  });

  it('returns failure when the requester selects the wrong option', async () => {
    const requestDecision = vi.fn<DecisionRequester>(async () => ({
      selectedOptionId: 'unexpected-option',
      reason: 'Selected something else.',
    }));

    const result = await runDecisionProviderProbe({
      providerLabel: 'Test Provider',
      target,
      requestDecision,
    });

    expect(result).toEqual({
      success: false,
      message: 'Test Provider selected unexpected option unexpected-option.',
    });
  });
});
