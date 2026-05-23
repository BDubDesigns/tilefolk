import type { ActionController, ChooseActionOptions } from './types.js';

export const deterministicController: ActionController = {
  async chooseAction(options: ChooseActionOptions): Promise<string | null> {
    const actionOptions = options.actionOptions;
    const selectedOption = actionOptions[0];

    if (selectedOption === undefined) {
      return null;
    }

    return selectedOption.id;
  },
};
