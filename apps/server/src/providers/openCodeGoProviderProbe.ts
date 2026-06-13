import { requestOpenCodeGoDecision } from '../simulation/controllers/openCodeGoDecisionClient.js';
import { runDecisionProviderProbe } from './decisionProviderProbe.js';

import type { DecisionRequester } from './decisionProviderProbe.js';
import type { ProviderTestProbeResult } from './executeProviderTests.js';
import type { ProviderTestTarget } from './providerTestTargets.js';

export type OpenCodeGoDecisionRequester = typeof requestOpenCodeGoDecision;

type RunOpenCodeGoProviderProbeOptions = {
  requestDecision?: OpenCodeGoDecisionRequester;
};

export async function runOpenCodeGoProviderProbe(
  target: ProviderTestTarget,
  { requestDecision = requestOpenCodeGoDecision }: RunOpenCodeGoProviderProbeOptions = {},
): Promise<ProviderTestProbeResult> {
  return runDecisionProviderProbe({
    providerLabel: 'OpenCode Go',
    target,
    requestDecision: requestDecision as DecisionRequester,
  });
}
