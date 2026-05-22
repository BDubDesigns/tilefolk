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
};
