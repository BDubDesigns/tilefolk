import { requestGoogleAiDecision } from '../simulation/controllers/googleAiDecisionClient.js';
import { runDecisionProviderProbe } from './decisionProviderProbe.js';

import type { DecisionRequester } from './decisionProviderProbe.js';
import type { ProviderTestProbeResult } from './executeProviderTests.js';
import type { ProviderTestTarget } from './providerTestTargets.js';

export type GoogleAiDecisionRequester = typeof requestGoogleAiDecision;

type RunGoogleAiProviderProbeOptions = {
  requestDecision?: GoogleAiDecisionRequester;
};

export async function runGoogleAiProviderProbe(
  target: ProviderTestTarget,
  { requestDecision = requestGoogleAiDecision }: RunGoogleAiProviderProbeOptions = {},
): Promise<ProviderTestProbeResult> {
  return runDecisionProviderProbe({
    providerLabel: 'Google AI',
    target,
    requestDecision: requestDecision as DecisionRequester,
  });
}
