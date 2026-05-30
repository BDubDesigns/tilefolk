import type { Npc, Memory } from '@tilefolk/shared';

interface GetRecentMemoriesForNpcOptions {
  npc: Npc;
  limit?: number;
}

export const getRecentMemoriesForNpc = ({
  npc,
  limit = 7,
}: GetRecentMemoriesForNpcOptions): Memory[] => {
  return npc.memories.slice(-limit);
};
