import type { Npc, World } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import type { ControllerAssignment } from './controllerAssignments.js';
import { deterministicController } from './deterministicController.js';
import { requestGoogleAiDecision } from './googleAiDecisionClient.js';
import { requestOpenCodeGoDecision } from './openCodeGoDecisionClient.js';
import { requestOpenRouterDecision } from './openRouterDecisionClient.js';
import { requestCerebrasDecision } from './cerebrasDecisionClient.js';
import { getVisibleWorldContext } from '@tilefolk/shared';
import { getRecentMemoriesForNpc } from '../getRecentMemoriesForNpc.js';

interface ResolveControllerDecisionOptions {
  world: World;
  npc: Npc;
  actionOptions: ActionOption[];
  controllerAssignment: ControllerAssignment;
}

export async function resolveControllerDecision({
  world,
  npc,
  actionOptions,
  controllerAssignment,
}: ResolveControllerDecisionOptions): Promise<ControllerDecision | null> {
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

  const recentMemories = getRecentMemoriesForNpc({ npc });
  const visibleContext = getVisibleWorldContext({ world, npc });

  let providerDecision: ControllerDecision | null;

  switch (controllerAssignment.provider) {
    case 'opencode-go':
      providerDecision = await requestOpenCodeGoDecision({
        recentMemories,
        npc,
        actionOptions,
        model: controllerAssignment.model,
        visibleContext,
      });
      break;
    case 'google-ai':
      providerDecision = await requestGoogleAiDecision({
        recentMemories,
        npc,
        actionOptions,
        model: controllerAssignment.model,
        visibleContext,
      });
      break;
    case 'openrouter':
      providerDecision = await requestOpenRouterDecision({
        recentMemories,
        npc,
        actionOptions,
        model: controllerAssignment.model,
        visibleContext,
      });
      break;
    case 'cerebras':
      providerDecision = await requestCerebrasDecision({
        recentMemories,
        npc,
        actionOptions,
        model: controllerAssignment.model,
        visibleContext,
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
