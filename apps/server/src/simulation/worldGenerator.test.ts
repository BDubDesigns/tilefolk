import { createWorld } from './worldGenerator.js';
import { describe, it, expect } from 'vitest';
import type { World, Position } from '@tilefolk/shared';

// helper functions
function expectPositionInsideBounds(position: Position, world: World): void {
  expect(position.x).toBeGreaterThanOrEqual(0);
  expect(position.x).toBeLessThan(world.width);

  expect(position.y).toBeGreaterThanOrEqual(0);
  expect(position.y).toBeLessThan(world.height);
}

describe('createWorld', () => {
  it('creates a world with default dimensions', () => {
    const world = createWorld();

    expect(world.width).toBe(25);
    expect(world.height).toBe(25);
  });

  it('creates a tile grid matching the world dimensions', () => {
    const world = createWorld();

    expect(world.tiles).toHaveLength(world.height);

    for (const row of world.tiles) {
      expect(row).toHaveLength(world.width);
    }
  });

  it('fills every tile with grass', () => {
    const world = createWorld();

    for (const row of world.tiles) {
      for (const tile of row) {
        expect(tile.terrain).toBe('grass');
      }
    }
  });

  it('creates the requested number of NPCs, items, and trees', () => {
    const world = createWorld({ numNpcs: 5, numItems: 10, numTrees: 15 });

    expect(world.npcs).toHaveLength(5);
    expect(world.items).toHaveLength(10);
    expect(world.trees).toHaveLength(15);
  });

  it('places every entity inside world bounds', () => {
    const testWidth = 10;
    const testHeight = 10;

    const world = createWorld({
      width: testWidth,
      height: testHeight,
    });

    for (const npc of world.npcs) {
      expectPositionInsideBounds(npc.position, world);
    }

    for (const tree of world.trees) {
      expectPositionInsideBounds(tree.position, world);
    }

    for (const item of world.items) {
      // check that the location is on the ground (on initial world generation, this is always the case)
      expect(item.location.type).toBe('ground');

      // guard against not being on the ground
      if (item.location.type !== 'ground') {
        throw new Error('Expected item to be on the ground');
      }

      // check that the position is inside the world bounds
      expectPositionInsideBounds(item.location.position, world);
    }
  });

  it('does not place two starting entities on the same position', () => {
    const world = createWorld({ width: 2, height: 2, numNpcs: 2, numItems: 1, numTrees: 1 });

    const npcs = world.npcs;
    const items = world.items;
    const trees = world.trees;

    const usedLocations = new Set<string>();

    for (const npc of npcs) {
      const coords = `${npc.position.x},${npc.position.y}`;
      expect(usedLocations.has(coords)).toBe(false);
      usedLocations.add(coords);
    }

    for (const item of items) {
      // guard against not being on the ground (it is on the ground always at initial creation)
      if (item.location.type !== 'ground') {
        throw new Error('Expected item to be on the ground');
      }
      const coords = `${item.location.position.x},${item.location.position.y}`;

      expect(usedLocations.has(coords)).toBe(false);
      usedLocations.add(coords);
    }

    for (const tree of trees) {
      const coords = `${tree.position.x},${tree.position.y}`;

      expect(usedLocations.has(coords)).toBe(false);
      usedLocations.add(coords);
    }
  });

  it('creates ground items with axe type', () => {
    const world = createWorld();

    for (const item of world.items) {
      expect(item.type).toBe('axe');
      expect(item.location.type).toBe('ground');
    }
  });

  it('throws when creating more entities than available positions', () => {
    expect(() => {
      createWorld({ width: 3, height: 3, numNpcs: 5, numItems: 5, numTrees: 5 });
    }).toThrow();
  });

  it('creates generated npcs with hunger 0', () => {
    const world = createWorld();

    for (const npc of world.npcs) {
      expect(npc.needs.hunger).toBe(0);
    }
  });
});
