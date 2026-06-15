import { describe, expect, it } from 'vitest';

import { createProviderTestScenario } from './providerTestScenario.js';

describe('createProviderTestScenario', () => {
  it('points the expected option id at a server-owned action option for the test npc', () => {
    const scenario = createProviderTestScenario();

    const expectedOption = scenario.actionOptions.find(
      (option) => option.id === scenario.expectedOptionId,
    );

    expect(expectedOption).toBeDefined();
    expect(expectedOption?.action).toEqual({
      type: 'wait',
      npcId: scenario.npc.id,
    });
  });
});
