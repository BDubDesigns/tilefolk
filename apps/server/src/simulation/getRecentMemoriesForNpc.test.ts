import { describe, expect, it } from 'vitest';
import type { Memory, Npc } from '@tilefolk/shared';
import { getRecentMemoriesForNpc } from './getRecentMemoriesForNpc.js';

const createMemory = (id: string, turn: number): Memory => ({
  id,
  npcId: 'npc_0',
  sourceEventId: `event_${turn}`,
  turn,
  message: `memory ${turn}`,
  position: { x: turn, y: turn },
});

const createNpcWithMemories = (memories: Memory[]): Npc => ({
  id: 'npc_0',
  name: 'NPC 0',
  position: { x: 0, y: 0 },
  memories,
  needs: { hunger: 0 },
});

describe('getRecentMemoriesForNpc', () => {
  it('returns the newest memories in stored order', () => {
    const npc = createNpcWithMemories([
      createMemory('memory_0', 0),
      createMemory('memory_1', 1),
      createMemory('memory_2', 2),
    ]);

    const memories = getRecentMemoriesForNpc({ npc, limit: 2 });

    expect(memories.map((memory) => memory.id)).toEqual(['memory_1', 'memory_2']);
  });

  it('respects the default limit', () => {
    const npc = createNpcWithMemories([
      createMemory('memory_0', 0),
      createMemory('memory_1', 1),
      createMemory('memory_2', 2),
      createMemory('memory_3', 3),
      createMemory('memory_4', 4),
      createMemory('memory_5', 5),
      createMemory('memory_6', 6),
      createMemory('memory_7', 7),
    ]);

    const memories = getRecentMemoriesForNpc({ npc });

    expect(memories.map((memory) => memory.id)).toEqual([
      'memory_1',
      'memory_2',
      'memory_3',
      'memory_4',
      'memory_5',
      'memory_6',
      'memory_7',
    ]);
  });

  it('does not require a world-level lookup', () => {
    const npc = createNpcWithMemories([createMemory('memory_0', 0)]);

    const memories = getRecentMemoriesForNpc({ npc });

    expect(memories).toEqual(npc.memories);
  });
});
