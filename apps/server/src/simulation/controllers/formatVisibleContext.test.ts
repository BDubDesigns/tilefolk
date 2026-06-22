import { describe, expect, it } from 'vitest';
import type { VisibleWorldContext } from '@tilefolk/shared';
import { formatVisibleContext } from './formatVisibleContext.js';

describe('formatVisibleContext', () => {
  it('describes visible entities with relative direction and distance', () => {
    const context: VisibleWorldContext = {
      radius: 3,
      center: { x: 5, y: 5 },
      nearbyNpcs: [
        {
          id: 'npc_1',
          name: 'Neighbor',
          position: { x: 6, y: 4 },
          memories: [],
          needs: { hunger: 0 },
        },
      ],
      nearbyTrees: [{ id: 'tree_0', position: { x: 5, y: 7 }, hitPoints: 3 }],
      nearbyBushes: [
        { id: 'bush_0', position: { x: 5, y: 6 }, type: 'berry', berries: 3, maxBerries: 3 },
      ],
      nearbyGroundItems: [
        {
          id: 'item_0',
          name: 'Bronze Axe',
          type: 'axe',
          location: { type: 'ground', position: { x: 3, y: 6 } },
        },
      ],
    };

    const promptText = formatVisibleContext(context);

    expect(promptText).toContain('Neighbor (6, 4) - northeast, 1 tile away');
    expect(promptText).toContain('tree_0: 3hp (5, 7) - south, 2 tiles away');
    expect(promptText).toContain('bush_0: berry bush, 3/3 berries (5, 6) - south, 1 tile away');
    expect(promptText).toContain('Bronze Axe (3, 6) - southwest, 2 tiles away');
  });

  it('uses None for empty visible sections', () => {
    const context: VisibleWorldContext = {
      radius: 3,
      center: { x: 5, y: 5 },
      nearbyNpcs: [],
      nearbyTrees: [],
      nearbyBushes: [],
      nearbyGroundItems: [],
    };

    const promptText = formatVisibleContext(context);

    expect(promptText).toContain('Nearby NPCs:\n  None');
    expect(promptText).toContain('Nearby trees:\n  None');
    expect(promptText).toContain('Nearby bushes:\n  None');
    expect(promptText).toContain('Nearby ground items:\n  None');
  });
});
