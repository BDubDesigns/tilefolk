import type { NpcAction, Npc, World } from '@tilefolk/shared';

export interface ActionOption {
  id: string;
  description: string;
  action: NpcAction;
}

export interface ChooseActionOptions {
  world: World;
  npc: Npc;
  actionOptions: ActionOption[];
}

export interface ActionController {
  chooseAction(options: ChooseActionOptions): Promise<string | null>;
}
