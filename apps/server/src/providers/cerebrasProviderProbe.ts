import { requestCerebrasDecision } from '../simulation/controllers/cerebrasDecisionClient.js';
import { runDecisionProviderProbe } from './decisionProviderProbe.js';

import type { DecisionRequester } from './decisionProviderProbe.js';
import type { ProviderTestProbeResult } from './executeProviderTests.js';
import type { ProviderTestTarget } from './providerTestTargets.js';

export type CerebrasDecisionRequester = typeof requestCerebrasDecision;

type RunCerebrasProviderProbeOptions = {
  requestDecision?: CerebrasDecisionRequester;
};

export async function runCerebrasProviderProbe(
  target: ProviderTestTarget,
  { requestDecision = requestCerebrasDecision }: RunCerebrasProviderProbeOptions = {},
): Promise<ProviderTestProbeResult> {
  return runDecisionProviderProbe({
    providerLabel: 'Cerebras',
    target,
    requestDecision: requestDecision as DecisionRequester,
  });
}
