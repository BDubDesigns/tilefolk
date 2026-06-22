import type { World } from '@tilefolk/shared';
import type { ControllerDecision } from './types.js';
import type { ControllerAssignment } from './controllerAssignments.js';
import { deterministicController } from './deterministicController.js';
import { requestGoogleAiDecision } from './googleAiDecisionClient.js';
import { requestOpenCodeGoDecision } from './openCodeGoDecisionClient.js';
import { requestOpenRouterDecision } from './openRouterDecisionClient.js';
import { requestCerebrasDecision } from './cerebrasDecisionClient.js';
import type { NpcDecisionInput } from './buildNpcDecisionInput.js';

interface ResolveControllerDecisionOptions {
  world: World;
  decisionInput: NpcDecisionInput;
  controllerAssignment: ControllerAssignment;
}

export async function resolveControllerDecision({
  world,
  decisionInput,
  controllerAssignment,
}: ResolveControllerDecisionOptions): Promise<ControllerDecision | null> {
  const { npc, actionOptions } = decisionInput;
  const deterministicDecision = async (
    reason = 'Chose the first option in the list of valid options, deterministically.',
  ): Promise<ControllerDecision | null> => {
    const decision = await deterministicController.chooseAction({
      world,
      npc,
      actionOptions,
    });

    return decision ? { ...decision, reason } : null;
  };

  if (controllerAssignment.type === 'deterministic') {
    return deterministicDecision();
  }

  let providerDecision: ControllerDecision | null;

  switch (controllerAssignment.provider) {
    case 'opencode-go':
      providerDecision = await requestOpenCodeGoDecision({
        decisionInput,
        model: controllerAssignment.model,
      });
      break;
    case 'google-ai':
      providerDecision = await requestGoogleAiDecision({
        decisionInput,
        model: controllerAssignment.model,
      });
      break;
    case 'openrouter':
      providerDecision = await requestOpenRouterDecision({
        decisionInput,
        model: controllerAssignment.model,
      });
      break;
    case 'cerebras':
      providerDecision = await requestCerebrasDecision({
        decisionInput,
        model: controllerAssignment.model,
      });
      break;
    default:
      return null;
  }

  return (
    providerDecision ??
    deterministicDecision('LLM failed; deterministic fallback selected the first valid option.')
  );
}
