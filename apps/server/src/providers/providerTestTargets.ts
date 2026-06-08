import { serverEnv } from '../config/env.js';

export type ProviderTestTarget = {
  provider: string;
  model: string;
};

export function getProviderTestTargets(): ProviderTestTarget[] {
  const targets: ProviderTestTarget[] = [];

  if (serverEnv.isCerebrasConfigured && serverEnv.cerebrasModel !== null) {
    targets.push({
      provider: 'cerebras',
      model: serverEnv.cerebrasModel,
    });
  }

  if (serverEnv.isOpenCodeGoConfigured && serverEnv.openCodeGoModel !== null) {
    targets.push({
      provider: 'opencode-go',
      model: serverEnv.openCodeGoModel,
    });
  }

  if (serverEnv.isOpenRouterConfigured && serverEnv.openRouterModel !== null) {
    targets.push({
      provider: 'openrouter',
      model: serverEnv.openRouterModel,
    });
  }

  if (serverEnv.isGoogleAiConfigured && serverEnv.googleAiModel !== null) {
    targets.push({
      provider: 'google-ai',
      model: serverEnv.googleAiModel,
    });
  }

  return targets;
}
