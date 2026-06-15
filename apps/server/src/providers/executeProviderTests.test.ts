import { describe, expect, it, vi } from 'vitest';

import { executeProviderTests } from './executeProviderTests.js';

import type { ProviderTestProbe } from './executeProviderTests.js';
import type { ProviderTestTarget } from './providerTestTargets.js';

describe('executeProviderTests', () => {
  it('returns a successful provider test result from an injected probe', async () => {
    const targets: ProviderTestTarget[] = [
      {
        provider: 'cerebras',
        model: 'gpt-oss-120b',
      },
    ];

    const probe: ProviderTestProbe = async () => ({
      success: true,
      message: 'Provider responded.',
    });

    const nowValues = [100, 137];
    const now = () => nowValues.shift() ?? 137;

    const results = await executeProviderTests({ targets, probe, now });

    expect(results).toEqual([
      {
        provider: 'cerebras',
        model: 'gpt-oss-120b',
        success: true,
        durationMs: 37,
        message: 'Provider responded.',
      },
    ]);
  });

  it('returns a failed provider test result when an injected probe throws', async () => {
    const targets: ProviderTestTarget[] = [
      {
        provider: 'openrouter',
        model: 'poolside/laguna-xs.2:free',
      },
    ];

    const probe: ProviderTestProbe = async () => {
      throw new Error('Provider request failed.');
    };

    const nowValues = [200, 245];
    const now = () => nowValues.shift() ?? 245;

    const results = await executeProviderTests({ targets, probe, now });

    expect(results).toEqual([
      {
        provider: 'openrouter',
        model: 'poolside/laguna-xs.2:free',
        success: false,
        durationMs: 45,
        message: 'Provider request failed.',
      },
    ]);
  });

  it('returns no results and does not call the probe when there are no targets', async () => {
    const probe = vi.fn<ProviderTestProbe>();

    const results = await executeProviderTests({ targets: [], probe });

    expect(results).toEqual([]);
    expect(probe).not.toHaveBeenCalled();
  });
});
