import type { ActionController } from './types.js';
import { requestOpenCodeGoDecision } from './openCodeGoDecisionClient.js';

export const llmController: ActionController = {
  async chooseAction(options) {
    return requestOpenCodeGoDecision({
      recentEvents: options.world.events.slice(-5),
      npc: options.npc,
      actionOptions: options.actionOptions,
    });
  },
};
