import type { Npc, WorldEvent } from '@tilefolk/shared';
import type { ActionOption, ControllerDecision } from './types.js';
import { serverEnv } from '../../config/env.js';

interface RequestGoogleAiDecisionOptions {
  npc: Npc;
  recentEvents: WorldEvent[];
  actionOptions: ActionOption[];
}
export async function requestGoogleAiDecision(
  options: RequestGoogleAiDecisionOptions,
): Promise<ControllerDecision | null> {
  if (options.actionOptions.length === 0 || !serverEnv.isGoogleAiConfigured) return null;

  const selectedOption = options.actionOptions[0];
  if (!selectedOption) return null;

  return {
    selectedOptionId: selectedOption.id,
    reason: 'Temporary Google AI decision client fallback selected the first available option.',
  };
}
