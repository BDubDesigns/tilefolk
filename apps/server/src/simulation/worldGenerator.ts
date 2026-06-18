import type {
  World,
  Tile,
  TileGrid,
  Position,
  Npc,
  Tree,
  Item,
  WorldEvent,
} from '@tilefolk/shared';

interface CreateWorldOptions {
  id?: string;
  width?: number;
  height?: number;
  numNpcs?: number;
  numItems?: number;
  numTrees?: number;
}

// helper functions

// returns a random number between 0 and max
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

// swap positions in place
function swapPositions(pool: Position[], firstIndex: number, secondIndex: number): void {
  // first check if the indices are valid
  if (
    firstIndex < 0 ||
    firstIndex >= pool.length ||
    secondIndex < 0 ||
    secondIndex >= pool.length
  ) {
    throw new Error('invalid index');
  }

  // check if there is anything in both indices
  if (!pool[firstIndex] || !pool[secondIndex]) {
    throw new Error('position(s) are empty');
  }

  // swap the positions
  const temp = pool[firstIndex];
  pool[firstIndex] = pool[secondIndex];
  pool[secondIndex] = temp;
}

// returns an array of all the positions in the world
function createPositionPool(width: number, height: number): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      positions.push({ x: col, y: row });
    }
  }
  return positions;
}

// shuffles the positions in the pool using Fisher-Yates shuffle
function shufflePositions(pool: Position[]): void {
  //   Start at the last index in the array.
  // While the current index is greater than 0:
  //   Pick a random index between 0 and the current index, inclusive.
  //   Swap the item at the current index with the item at the random index.
  //   Move current index one step left.
  // shuffle in place
  for (let i = pool.length - 1; i > 0; i--) {
    const randomIndex = getRandomInt(i + 1);
    swapPositions(pool, i, randomIndex);
  }
}

// removes a position from the pool and returns it
function takePosition(pool: Position[]): Position {
  const position = pool.pop();
  if (!position) {
    throw new Error('position pool is empty');
  }
  return position;
}

// create a tile grid from parameters
function createTileGrid(width: number, height: number): TileGrid {
  const tiles: TileGrid = [];
  for (let row = 0; row < height; row++) {
    const rowTiles: Tile[] = [];
    for (let col = 0; col < width; col++) {
      rowTiles.push({ terrain: 'grass' });
    }
    tiles.push(rowTiles);
  }
  return tiles;
}

/**
 * Generates an array of NPC objects and assigns them positions from a provided pool.
 *
 * @param numNpcs - The total number of NPCs to create.
 * @param positionPool - The collection of available positions to draw from.
 * @returns An array of fully initialized Npc objects.
 */
const createNpcs = (numNpcs: number, positionPool: Position[]): Npc[] => {
  const npcs: Npc[] = [];

  for (let i = 0; i < numNpcs; i++) {
    const position: Position = takePosition(positionPool);

    npcs.push({
      id: `npc_${i}`,
      name: `NPC ${i}`,
      position,
      memories: [],
    });
  }

  return npcs;
};

/**
 * Generates an array of tree objects and assigns them positions from a provided pool.
 *
 * @param numTrees - The total number of trees to create.
 * @param positionPool - The collection of available positions to draw from.
 * @returns An array of fully initialized tree objects.
 */
const createTrees = (numTrees: number, positionPool: Position[]): Tree[] => {
  const trees: Tree[] = [];

  for (let i = 0; i < numTrees; i++) {
    const position: Position = takePosition(positionPool);

    trees.push({
      id: `tree_${i}`,
      position,
      hitPoints: 3,
    });
  }

  return trees;
};

/**
 * Generates an array of item objects and assigns them positions from a provided pool.
 *
 * @param numItems - The total number of items to create.
 * @param positionPool - The collection of available positions to draw from.
 * @returns An array of fully initialized item objects.
 */
const createItems = (numItems: number, positionPool: Position[]): Item[] => {
  const items: Item[] = [];

  for (let i = 0; i < numItems; i++) {
    const position: Position = takePosition(positionPool);

    items.push({
      id: `item_${i}`,
      name: `Bronze Axe`,
      location: { type: 'ground', position },
      type: 'axe',
    });
  }

  return items;
};

export function createWorld({
  id = `world_0`, // only one world to start so we can safely hardcode this. revisit if needed.
  width = 25,
  height = 25,
  numNpcs = 4,
  numItems = 1,
  numTrees = 20,
}: CreateWorldOptions = {}): World {
  //   Create a TileGrid. Each row is an array of Tiles.
  const tiles: TileGrid = createTileGrid(width, height);

  // Create a pool of positions
  const positionPool: Position[] = createPositionPool(width, height);
  // Shuffle the positions in the pool
  shufflePositions(positionPool);

  // Create a pool of NPCS
  const npcs: Npc[] = createNpcs(numNpcs, positionPool);
  const trees: Tree[] = createTrees(numTrees, positionPool);
  const items: Item[] = createItems(numItems, positionPool);
  const events: WorldEvent[] = [];

  const world: World = {
    id,
    width,
    height,
    tiles,
    npcs,
    items,
    trees,
    events,
    turn: 0,
    round: 0,
  };
  return world;
}
