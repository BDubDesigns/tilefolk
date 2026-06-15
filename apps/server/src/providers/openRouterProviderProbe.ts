import { requestOpenRouterDecision } from '../simulation/controllers/openRouterDecisionClient.js';
import { runDecisionProviderProbe } from './decisionProviderProbe.js';

import type { DecisionRequester } from './decisionProviderProbe.js';
import type { ProviderTestProbeResult } from './executeProviderTests.js';
import type { ProviderTestTarget } from './providerTestTargets.js';

export type OpenRouterDecisionRequester = typeof requestOpenRouterDecision;

type RunOpenRouterProviderProbeOptions = {
  requestDecision?: OpenRouterDecisionRequester;
};

export async function runOpenRouterProviderProbe(
  target: ProviderTestTarget,
  { requestDecision = requestOpenRouterDecision }: RunOpenRouterProviderProbeOptions = {},
): Promise<ProviderTestProbeResult> {
  return runDecisionProviderProbe({
    providerLabel: 'OpenRouter',
    target,
    requestDecision: requestDecision as DecisionRequester,
  });
}
