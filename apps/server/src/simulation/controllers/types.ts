import type { NpcAction, Npc, World } from '@tilefolk/shared';

export interface ChooseActionOptions {
  world: World;
  npc: Npc;
  actions: NpcAction[];
}

export interface ActionController {
  chooseAction(options: ChooseActionOptions): NpcAction | null;
}
