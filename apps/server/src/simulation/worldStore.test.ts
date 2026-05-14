import { describe, it, expect } from 'vitest';
import { getActiveWorld, resetWorld } from './worldStore.js';

describe('getActiveWorld', () => {
  it('returns the same world when called multiple times', () => {
    const world1 = getActiveWorld();
    const world2 = getActiveWorld();

    expect(world1).toBe(world2);
  });
});

describe('resetWorld', () => {
  it('returns a new world', () => {
    const world1 = getActiveWorld();
    const world2 = resetWorld();

    expect(world1).not.toBe(world2);
  });
});
