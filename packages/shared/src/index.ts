export type HealthResponse = {
  status: 'ok';
};

export type Position = {
  x: number;
  y: number;
};

export const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
export type Direction = (typeof directions)[number];

export type TerrainType = 'grass';

export type ItemType = 'axe';

// ID Aliases for better type safety and readability
export type WorldId = string;

export type NpcId = string;

export type ItemId = string;

export type TreeId = string;

export type MemoryId = string;

export type WorldEventId = string;

export type World = {
  id: WorldId;
  width: number;
  height: number;
  tiles: TileGrid;
  npcs: Npc[];
  items: Item[];
  trees: Tree[];
  turn: number;
  events: WorldEvent[];
};

export type Tile = {
  terrain: TerrainType;
};

export type TileGrid = Tile[][];

export type Memory = {
  id: MemoryId;
  text: string;
  turnNumber: number;
};

export type Npc = {
  id: NpcId;
  name: string;
  position: Position;
  memories: MemoryId[];
};

// ItemLocation can be either on the ground or held by an NPC
export type ItemLocation =
  | { type: 'ground'; position: Position }
  | { type: 'inventory'; npcId: NpcId };

export type Item = {
  id: ItemId;
  name: string;
  location: ItemLocation;
  type: ItemType;
};

export type Tree = {
  id: TreeId;
  position: Position;
  hitPoints: number;
};

export type MoveAction = {
  type: 'move';
  npcId: NpcId;
  direction: Direction;
};

export type PickupAction = {
  type: 'pickup';
  npcId: NpcId;
  itemId: ItemId;
};

export type WaitAction = {
  type: 'wait';
  npcId: NpcId;
};

export type NpcAction = MoveAction | WaitAction | PickupAction;

export type NpcActionType = NpcAction['type'];

export type ActionResult = {
  action: NpcAction;
  success: boolean;
  message: string;
};

export type StepWorldResponse = {
  world: World;
  actionResult: ActionResult;
};

export type WorldEvent = {
  id: WorldEventId;
  turn: number;
  actorId: NpcId | null;
  message: string;
  controllerReason?: string;
  controllerDurationMs?: number;
  controllerLabel?: string;
  position?: Position;
};

export interface GetVisibleWorldContextOptions {
  world: World;
  npc: Npc;
  radius?: number;
}

export interface VisibleWorldContext {
  radius: number;
  center: Position;
  nearbyNpcs: Npc[];
  nearbyTrees: Tree[];
  nearbyGroundItems: Item[];
}

function isPositionVisible(center: Position, candidatePosition: Position, radius: number): boolean {
  const xDist = Math.abs(center.x - candidatePosition.x);
  const yDist = Math.abs(center.y - candidatePosition.y);
  return xDist <= radius && yDist <= radius;
}

export function getVisibleWorldContext({
  world,
  npc,
  radius = 3,
}: GetVisibleWorldContextOptions): VisibleWorldContext {
  const center = npc.position;

  const nearbyNpcs = world.npcs.filter((candidateNpc) => {
    // exclude the npc itself
    if (npc.id === candidateNpc.id) return false;
    return isPositionVisible(center, candidateNpc.position, radius);
  });

  const nearbyTrees = world.trees.filter((candidateTree) => {
    return isPositionVisible(center, candidateTree.position, radius);
  });

  const nearbyGroundItems = world.items.filter((candidateGroundItem) => {
    if (candidateGroundItem.location.type !== 'ground') return false;
    return isPositionVisible(center, candidateGroundItem.location.position, radius);
  });

  return {
    radius,
    center: npc.position,
    nearbyNpcs,
    nearbyTrees,
    nearbyGroundItems,
  };
}
