import type { World } from '@tilefolk/shared';

interface WorldSummaryProps {
  world: World;
}

export const WorldSummary = ({ world }: WorldSummaryProps) => {
  return (
    <div className="worldSummary">
      <p>World ID: {world.id}</p>
      <p>
        Dimensions: {world.width} x {world.height}
      </p>
      <p>NPCs: {world.npcs.length}</p>
      <p>Items: {world.items.length}</p>
      <p>Trees: {world.trees.length}</p>
      <p>Turn: {world.turn}</p>
    </div>
  );
};
