import type { ActionController } from './types.js';

export const deterministicController: ActionController = {
  async chooseAction(options) {
    const actionOptions = options.actionOptions;
    const selectedOption = actionOptions[0];

    if (selectedOption === undefined) {
      return null;
    }

    return {
      selectedOptionId: selectedOption.id,
      reason: 'Chose the first option in the list of valid options, deterministically.',
    };
  },
};
