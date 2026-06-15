import type { ProviderTestResult } from '@tilefolk/shared';
import { runCerebrasProviderProbe } from './cerebrasProviderProbe.js';
import { runGoogleAiProviderProbe } from './googleAiProviderProbe.js';
import { runOpenCodeGoProviderProbe } from './openCodeGoProviderProbe.js';
import { runOpenRouterProviderProbe } from './openRouterProviderProbe.js';
import { getProviderTestTargets, type ProviderTestTarget } from './providerTestTargets.js';

export type ProviderTestProbeResult = {
  success: boolean;
  message: string;
};

export type ProviderTestProbe = (target: ProviderTestTarget) => Promise<ProviderTestProbeResult>;

type ExecuteProviderTestsOptions = {
  targets?: ProviderTestTarget[];
  probe?: ProviderTestProbe;
  now?: () => number;
};

export async function executeProviderTests(
  options: ExecuteProviderTestsOptions = {},
): Promise<ProviderTestResult[]> {
  const targets = options.targets ?? getProviderTestTargets();
  const probe = options.probe ?? runRealProviderProbe;
  const now = options.now ?? (() => performance.now());

  return Promise.all(
    targets.map(async (target) => {
      const startedAt = now();

      try {
        const result = await probe(target);

        return {
          provider: target.provider,
          model: target.model,
          success: result.success,
          durationMs: Math.round(now() - startedAt),
          message: result.message,
        };
      } catch (error) {
        return {
          provider: target.provider,
          model: target.model,
          success: false,
          durationMs: Math.round(now() - startedAt),
          message: error instanceof Error ? error.message : 'Provider test failed.',
        };
      }
    }),
  );
}

export const runRealProviderProbe: ProviderTestProbe = async (target) => {
  switch (target.provider) {
    case 'cerebras':
      return runCerebrasProviderProbe(target);
    case 'opencode-go':
      return runOpenCodeGoProviderProbe(target);
    case 'openrouter':
      return runOpenRouterProviderProbe(target);
    case 'google-ai':
      return runGoogleAiProviderProbe(target);
  }
};
