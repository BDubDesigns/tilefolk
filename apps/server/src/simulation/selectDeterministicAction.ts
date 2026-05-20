import type { Npc, NpcAction, World } from '@tilefolk/shared';

interface SelectActionOptions {
  world: World;
  npc: Npc;
  actions: NpcAction[];
}

export function selectDeterministicAction({ actions }: SelectActionOptions): NpcAction | null {
  // for now choose the first valid action deterministically
  return actions[0] ?? null;
}
