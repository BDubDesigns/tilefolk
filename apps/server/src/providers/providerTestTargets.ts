import { serverEnv } from '../config/env.js';

const providerTestDefinitions = [
  {
    provider: 'cerebras',
    getApiKey: () => serverEnv.cerebrasApiKey,
    getModel: () => serverEnv.cerebrasModel,
  },
  {
    provider: 'opencode-go',
    getApiKey: () => serverEnv.openCodeGoApiKey,
    getModel: () => serverEnv.openCodeGoModel,
  },
  {
    provider: 'openrouter',
    getApiKey: () => serverEnv.openRouterApiKey,
    getModel: () => serverEnv.openRouterModel,
  },
  {
    provider: 'google-ai',
    getApiKey: () => serverEnv.googleAiApiKey,
    getModel: () => serverEnv.googleAiModel,
  },
] as const;

export type ProviderTestProvider = (typeof providerTestDefinitions)[number]['provider'];

export type ProviderTestTarget = {
  provider: ProviderTestProvider;
  model: string;
};

export function getProviderTestTargets(): ProviderTestTarget[] {
  const targets: ProviderTestTarget[] = [];

  for (const definition of providerTestDefinitions) {
    const apiKey = definition.getApiKey();
    const model = definition.getModel();

    if (apiKey !== null && model !== null) {
      targets.push({
        provider: definition.provider,
        model,
      });
    }
  }

  return targets;
}
