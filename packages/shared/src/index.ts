export type HealthResponse = {
  status: 'ok';
};

export type StatusResponse = {
  version: string;
  defaultController: 'deterministic' | 'llm';
  useSampleControllerAssignments: boolean;
  isAdminTokenConfigured: boolean;
};

export type ProviderTestResult = {
  provider: string;
  model: string;
  success: boolean;
  durationMs: number;
  message: string;
};

export type Position = {
  x: number;
  y: number;
};

export const NEEDS_MAX_VALUES = {
  hunger: 100,
} as const;

export const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
export type Direction = (typeof directions)[number];

export type TerrainType = 'grass';

export type ItemType = 'axe' | 'wood' | 'berry';

// ID Aliases for better type safety and readability
export type WorldId = string;

export type NpcId = string;

export type ItemId = string;

export type TreeId = string;

export type BushId = string;

export type MemoryId = string;

export type WorldEventId = string;

export type DecisionTraceId = string;

export type ControllerDecisionStatus = 'selected' | 'noDecision' | 'invalidOption';

export type ControllerType = 'deterministic' | 'llm';

export type ActionOption = {
  id: string;
  description: string;
  action: NpcAction;
};

export type ControllerDecision = {
  selectedOptionId: string;
  reason: string;
};

export type NpcDecisionInput = {
  npc: Npc;
  turn: number;
  round: number;
  actionOptions: ActionOption[];
  visibleContext: VisibleWorldContext;
  recentMemories: Memory[];
  prompt: string;
};

export type DecisionTrace = {
  id: DecisionTraceId;
  turn: number;
  round: number;
  npcId: NpcId;

  controllerType: ControllerType;
  controllerLabel: string;
  provider?: string;
  model?: string;

  decisionInput: NpcDecisionInput;

  selectedOptionId?: string;
  controllerReason?: string;
  controllerDecisionStatus: ControllerDecisionStatus;
  controllerDurationMs?: number;

  actionResult: ActionResult;
};

export type World = {
  id: WorldId;
  width: number;
  height: number;
  tiles: TileGrid;
  npcs: Npc[];
  items: Item[];
  trees: Tree[];
  bushes: Bush[];
  turn: number;
  round: number;
  events: WorldEvent[];
  debug: { decisionTraces: DecisionTrace[] };
};

export type Tile = {
  terrain: TerrainType;
};

export type TileGrid = Tile[][];

export type Memory = {
  id: MemoryId;
  npcId: NpcId;
  sourceEventId: WorldEventId;
  turn: number;
  message: string;
  position: Position;
};

export type Npc = {
  id: NpcId;
  name: string;
  position: Position;
  memories: Memory[];
  needs: {
    hunger: number;
  };
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

export type BerryBush = {
  id: BushId;
  type: 'berry';
  position: Position;
  berries: number;
  maxBerries: number;
};

// Keep Bush as a category alias so future bush variants can add their own state.
export type Bush = BerryBush;

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

export type ChopTreeAction = {
  type: 'chopTree';
  npcId: NpcId;
  treeId: TreeId;
};

export type WaitAction = {
  type: 'wait';
  npcId: NpcId;
};

export type CarefullyPickBerryAction = {
  type: 'carefullyPickBerry';
  npcId: NpcId;
  berryBushId: BushId;
};

export type NpcAction =
  | MoveAction
  | WaitAction
  | PickupAction
  | ChopTreeAction
  | CarefullyPickBerryAction;

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
  nearbyBushes: Bush[];
  nearbyGroundItems: Item[];
}

export function isPositionInSquareRadius(
  center: Position,
  candidatePosition: Position,
  radius: number,
): boolean {
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
    return isPositionInSquareRadius(center, candidateNpc.position, radius);
  });

  const nearbyTrees = world.trees.filter((candidateTree) => {
    return isPositionInSquareRadius(center, candidateTree.position, radius);
  });

  const nearbyBushes = world.bushes.filter((candidateBush) => {
    return isPositionInSquareRadius(center, candidateBush.position, radius);
  });

  const nearbyGroundItems = world.items.filter((candidateGroundItem) => {
    if (candidateGroundItem.location.type !== 'ground') return false;
    return isPositionInSquareRadius(center, candidateGroundItem.location.position, radius);
  });

  return {
    radius,
    center: npc.position,
    nearbyNpcs,
    nearbyTrees,
    nearbyBushes,
    nearbyGroundItems,
  };
}
