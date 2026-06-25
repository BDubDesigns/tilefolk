import type { ActionOption, ControllerDecision, Npc, World } from '@tilefolk/shared';

export interface ChooseActionOptions {
  world: World;
  npc: Npc;
  actionOptions: ActionOption[];
}

export interface ActionController {
  chooseAction(options: ChooseActionOptions): Promise<ControllerDecision | null>;
}
