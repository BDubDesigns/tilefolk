import { requestCerebrasDecision } from '../simulation/controllers/cerebrasDecisionClient.js';
import { createProviderTestScenario } from './providerTestScenario.js';

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
  const scenario = createProviderTestScenario();
  const decision = await requestDecision({
    npc: scenario.npc,
    recentMemories: scenario.recentMemories,
    actionOptions: scenario.actionOptions,
    visibleContext: scenario.visibleContext,
    model: target.model,
  });

  if (decision === null) {
    return {
      success: false,
      message: 'Cerebras returned no valid provider test decision.',
    };
  }

  if (decision.selectedOptionId !== scenario.expectedOptionId) {
    return {
      success: false,
      message: `Cerebras selected unexpected option ${decision.selectedOptionId}.`,
    };
  }

  return {
    success: true,
    message: `Cerebras selected expected provider test option ${scenario.expectedOptionId}.`,
  };
}
