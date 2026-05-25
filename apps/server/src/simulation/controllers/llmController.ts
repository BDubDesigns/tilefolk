import type { ActionController } from './types.js';
import { requestGoogleAiDecision } from './googleAiDecisionClient.js';

export const llmController: ActionController = {
  async chooseAction(options) {
    const decision = await requestGoogleAiDecision({
      recentEvents: options.world.events.slice(-5),
      npc: options.npc,
      actionOptions: options.actionOptions,
    });
    if (!decision) {
      return null;
    }
    return decision;
  },
};
