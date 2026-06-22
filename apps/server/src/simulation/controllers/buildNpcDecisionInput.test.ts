import { describe, expect, it } from 'vitest';
import { createWorld } from '../worldGenerator.js';
import { buildNpcDecisionInput } from './buildNpcDecisionInput.js';
import type { Memory } from '@tilefolk/shared';

function createMemory(id: string, turn: number): Memory {
  return {
    id,
    npcId: 'npc_0',
    sourceEventId: `event_${turn}`,
    turn,
    message: `memory ${turn}`,
    position: { x: turn, y: turn },
  };
}

describe('buildNpcDecisionInput', () => {
  it('builds the server-owned controller input for an NPC decision', () => {
    const world = createWorld({
      width: 8,
      height: 8,
      numNpcs: 1,
      numItems: 0,
      numTrees: 0,
      numBushes: 0,
    });
    world.turn = 4;
    world.round = 1;

    const npc = world.npcs[0];
    if (!npc) throw new Error('Expected test world to include an NPC');

    npc.position = { x: 2, y: 2 };
    npc.memories = [createMemory('memory_0', 0)];
    world.bushes = [
      {
        id: 'bush_0',
        type: 'berry',
        position: { x: 3, y: 2 },
        berries: 3,
        maxBerries: 3,
      },
    ];

    const decisionInput = buildNpcDecisionInput({ world, npc });

    expect(decisionInput.npc).toBe(npc);
    expect(decisionInput.turn).toBe(4);
    expect(decisionInput.round).toBe(1);
    expect(decisionInput.recentMemories).toEqual(npc.memories);
    expect(decisionInput.visibleContext.nearbyBushes).toEqual(world.bushes);
    expect(decisionInput.actionOptions).toContainEqual({
      id: 'carefullyPickBerry:bush_0',
      description: 'Carefully pick berry from bush bush_0',
      action: { type: 'carefullyPickBerry', npcId: npc.id, berryBushId: 'bush_0' },
    });
    expect(decisionInput.prompt).toContain('Nearby bushes:');
    expect(decisionInput.prompt).toContain('bush_0: berry bush, 3/3 berries');
    expect(decisionInput.prompt).toContain('carefullyPickBerry:bush_0');
    expect(decisionInput.prompt).toContain('Turn 0: memory 0');
  });
});
