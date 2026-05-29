import type { World, Npc, Memory } from '@tilefolk/shared';

interface getRecentMemoriesForNpcOptions {
  world: World;
  npc: Npc;
  limit?: number;
}

export const getRecentMemoriesForNpc = ({
  world,
  npc,
  limit = 7,
}: getRecentMemoriesForNpcOptions): Memory[] => {
  const { memories } = npc;
  const recentMemoryIds = memories.slice(-limit);
  const recentMemories = recentMemoryIds.map((id) => world.memories[id]);
  return recentMemories;
};
