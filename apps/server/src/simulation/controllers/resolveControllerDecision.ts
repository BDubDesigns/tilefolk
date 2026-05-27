import type { Npc, World } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import type { ControllerAssignment } from './controllerAssignments.js';
import { deterministicController } from './deterministicController.js';
import { requestGoogleAiDecision } from './googleAiDecisionClient.js';
import { requestOpenCodeGoDecision } from './openCodeGoDecisionClient.js';
import { requestOpenRouterDecision } from './openRouterDecisionClient.js';
import { getVisibleWorldContext } from '../getVisibleWorldContext.js';

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
  if (controllerAssignment.type === 'deterministic') {
    return deterministicController.chooseAction({
      world,
      npc,
      actionOptions,
    });
  }

  const recentEvents = world.events.slice(-5);
  const visibleContext = getVisibleWorldContext({ world, npc });

  switch (controllerAssignment.provider) {
    case 'opencode-go':
      return requestOpenCodeGoDecision({
        recentEvents,
        npc,
        actionOptions,
        model: controllerAssignment.model,
        visibleContext,
      });
    case 'google-ai':
      return requestGoogleAiDecision({
        recentEvents,
        npc,
        actionOptions,
        model: controllerAssignment.model,
        visibleContext,
      });
    case 'openrouter':
      return requestOpenRouterDecision({
        recentEvents,
        npc,
        actionOptions,
        model: controllerAssignment.model,
        visibleContext,
      });
    default:
      return null;
  }
}
