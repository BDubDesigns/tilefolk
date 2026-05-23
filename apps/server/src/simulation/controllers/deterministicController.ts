import type { ActionController, ChooseActionOptions } from './types.js';

export const deterministicController: ActionController = {
  chooseAction(options: ChooseActionOptions): string | null {
    // The deterministic controller only needs the valid actions for now,
    // but future controllers can also use options.world and options.npc
    const actionOptions = options.actionOptions;
    const selectedOption = actionOptions[0];
    // if the selected action is undefined, return null to indicate no valid action was found
    if (selectedOption === undefined) {
      return null;
    }
    // return the selected action to the caller
    return selectedOption.id;
  },
};
