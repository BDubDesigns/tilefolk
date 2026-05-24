import type { ActionController } from './types.js';

export const llmController: ActionController = {
  async chooseAction(options) {
    const actionOptions = options.actionOptions;
    const selectedOption = actionOptions[1];

    if (!selectedOption) {
      return null;
    }

    return {
      selectedOptionId: selectedOption.id,
      reason: 'LLM controller stub selected the second available option for testing.',
    };
  },
};
