import { createProviderTestScenario } from './providerTestScenario.js';
import { buildControllerPrompt } from '../simulation/controllers/buildControllerPrompt.js';

import type { NpcDecisionInput } from '../simulation/controllers/buildNpcDecisionInput.js';
import type { ControllerDecision } from '../simulation/controllers/types.js';
import type { ProviderTestProbeResult } from './executeProviderTests.js';
import type { ProviderTestTarget } from './providerTestTargets.js';

export type DecisionRequester = (options: {
  decisionInput: NpcDecisionInput;
  model?: string;
  onFailure?: (message: string) => void;
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
  const decisionInput: NpcDecisionInput = {
    npc: scenario.npc,
    turn: 0,
    round: 0,
    recentMemories: scenario.recentMemories,
    actionOptions: scenario.actionOptions,
    visibleContext: scenario.visibleContext,
    prompt: buildControllerPrompt({
      npc: scenario.npc,
      recentMemories: scenario.recentMemories,
      actionOptions: scenario.actionOptions,
      visibleContext: scenario.visibleContext,
    }),
  };
  let failureMessage: string | null = null;
  const decision = await requestDecision({
    decisionInput,
    model: target.model,
    onFailure: (message) => {
      failureMessage = message;
    },
  });

  if (decision === null) {
    return {
      success: false,
      message: failureMessage ?? `${providerLabel} returned no valid provider test decision.`,
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
