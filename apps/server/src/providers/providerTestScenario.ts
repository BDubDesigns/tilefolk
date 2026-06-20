import type { Memory, Npc, VisibleWorldContext } from '@tilefolk/shared';
import type { ActionOption } from '../simulation/controllers/types.js';

export type ProviderTestScenario = {
  npc: Npc;
  recentMemories: Memory[];
  actionOptions: ActionOption[];
  visibleContext: VisibleWorldContext;
  expectedOptionId: string;
};

export function createProviderTestScenario(): ProviderTestScenario {
  const testNpcPosition = { x: 0, y: 0 };
  const testOptionId = 'provider-test-wait';
  const testNpc: Npc = {
    id: 'npc_1',
    name: 'Alex',
    position: testNpcPosition,
    memories: [],
    needs: { hunger: 0 },
  };
  const testActionOption: ActionOption = {
    id: testOptionId,
    description: 'Wait in place',
    action: { type: 'wait', npcId: testNpc.id },
  };

  const output = {
    npc: testNpc,
    recentMemories: [],
    actionOptions: [testActionOption],
    visibleContext: {
      center: testNpcPosition,
      radius: 1,
      nearbyNpcs: [],
      nearbyTrees: [],
      nearbyGroundItems: [],
    },
    expectedOptionId: testOptionId,
  };

  return output;
}
