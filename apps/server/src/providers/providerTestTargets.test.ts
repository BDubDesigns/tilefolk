import { afterEach, describe, expect, it } from 'vitest';

import { serverEnv } from '../config/env.js';
import { getProviderTestTargets } from './providerTestTargets.js';

function resetProviderConfig(): void {
  serverEnv.googleAiApiKey = null;
  serverEnv.googleAiModel = null;
  serverEnv.isGoogleAiConfigured = false;

  serverEnv.openCodeGoApiKey = null;
  serverEnv.openCodeGoModel = null;
  serverEnv.isOpenCodeGoConfigured = false;

  serverEnv.openRouterApiKey = null;
  serverEnv.openRouterModel = null;
  serverEnv.isOpenRouterConfigured = false;

  serverEnv.cerebrasApiKey = null;
  serverEnv.cerebrasModel = null;
  serverEnv.isCerebrasConfigured = false;
}

afterEach(() => {
  resetProviderConfig();
});

describe('getProviderTestTargets', () => {
  it('returns no targets when no providers are configured', () => {
    resetProviderConfig();

    expect(getProviderTestTargets()).toEqual([]);
  });

  it('returns a configured Cerebras provider target', () => {
    resetProviderConfig();

    serverEnv.cerebrasApiKey = 'test-cerebras-key';
    serverEnv.cerebrasModel = 'gpt-oss-120b';
    serverEnv.isCerebrasConfigured = true;

    expect(getProviderTestTargets()).toEqual([
      {
        provider: 'cerebras',
        model: 'gpt-oss-120b',
      },
    ]);
  });

  it('returns all configured provider targets', () => {
    resetProviderConfig();

    serverEnv.cerebrasApiKey = 'test-cerebras-key';
    serverEnv.cerebrasModel = 'gpt-oss-120b';
    serverEnv.isCerebrasConfigured = true;

    serverEnv.openCodeGoApiKey = 'test-opencode-go-key';
    serverEnv.openCodeGoModel = 'deepseek-v4-flash';
    serverEnv.isOpenCodeGoConfigured = true;

    serverEnv.openRouterApiKey = 'test-openrouter-key';
    serverEnv.openRouterModel = 'poolside/laguna-xs.2:free';
    serverEnv.isOpenRouterConfigured = true;

    serverEnv.googleAiApiKey = 'test-google-ai-key';
    serverEnv.googleAiModel = 'gemma-4-26b-a4b-it';
    serverEnv.isGoogleAiConfigured = true;

    expect(getProviderTestTargets()).toEqual([
      {
        provider: 'cerebras',
        model: 'gpt-oss-120b',
      },
      {
        provider: 'opencode-go',
        model: 'deepseek-v4-flash',
      },
      {
        provider: 'openrouter',
        model: 'poolside/laguna-xs.2:free',
      },
      {
        provider: 'google-ai',
        model: 'gemma-4-26b-a4b-it',
      },
    ]);
  });

  it('omits providers without both an API key and model', () => {
    resetProviderConfig();

    serverEnv.cerebrasApiKey = 'test-cerebras-key';
    serverEnv.cerebrasModel = null;
    serverEnv.isCerebrasConfigured = false;

    serverEnv.openCodeGoApiKey = null;
    serverEnv.openCodeGoModel = 'deepseek-v4-flash';
    serverEnv.isOpenCodeGoConfigured = false;

    expect(getProviderTestTargets()).toEqual([]);
  });
});
