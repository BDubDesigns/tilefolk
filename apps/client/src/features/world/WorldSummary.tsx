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
      <p>
        Items:{' '}
        <ul>
          <li>Ground: {world.items.filter((item) => item.location.type === 'ground').length}</li>
          <li>
            Inventory: {world.items.filter((item) => item.location.type === 'inventory').length}
          </li>
        </ul>
      </p>
      <p>Trees: {world.trees.length}</p>
      <p>Turn: {world.turn}</p>
    </div>
  );
};
