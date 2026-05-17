export type HealthResponse = {
  status: 'ok';
};

export type Position = {
  x: number;
  y: number;
};

export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export type TerrainType = 'grass';

export type ItemType = 'axe';

// ID Aliases for better type safety and readability
export type WorldId = string;

export type NpcId = string;

export type ItemId = string;

export type TreeId = string;

export type MemoryId = string;

export type World = {
  id: WorldId;
  width: number;
  height: number;
  tiles: TileGrid;
  npcs: Npc[];
  items: Item[];
  trees: Tree[];
  turn: number;
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

export type WaitAction = {
  type: 'wait';
  npcId: NpcId;
};

export type NpcAction = MoveAction | WaitAction;

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
