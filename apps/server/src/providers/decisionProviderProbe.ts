import { createProviderTestScenario } from './providerTestScenario.js';

import type { ControllerDecision } from '../simulation/controllers/types.js';
import type { ProviderTestProbeResult } from './executeProviderTests.js';
import type { ProviderTestTarget } from './providerTestTargets.js';

export type DecisionRequester = (options: {
  npc: ReturnType<typeof createProviderTestScenario>['npc'];
  recentMemories: ReturnType<typeof createProviderTestScenario>['recentMemories'];
  actionOptions: ReturnType<typeof createProviderTestScenario>['actionOptions'];
  visibleContext: ReturnType<typeof createProviderTestScenario>['visibleContext'];
  model?: string;
}) => Promise<ControllerDecision | null>;

type RunDecisionProviderProbeOptions = {
  providerLabel: string;
  target: ProviderTestTarget;
  requestDecision: DecisionRequester;
};

export async function runDecisionProviderProbe({
  providerLabel,
  target,
  requestDecision,
}: RunDecisionProviderProbeOptions): Promise<ProviderTestProbeResult> {
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
      message: `${providerLabel} returned no valid provider test decision.`,
    };
  }

  if (decision.selectedOptionId !== scenario.expectedOptionId) {
    return {
      success: false,
      message: `${providerLabel} selected unexpected option ${decision.selectedOptionId}.`,
    };
  }

  return {
    success: true,
    message: `${providerLabel} selected expected provider test option ${scenario.expectedOptionId}.`,
  };
}
