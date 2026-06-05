import type { World } from '@tilefolk/shared';

interface WorldSummaryProps {
  world: World;
}

export const WorldSummary = ({ world }: WorldSummaryProps) => {
  const groundItemCount = world.items.filter((item) => item.location.type === 'ground').length;
  const inventoryItemCount = world.items.filter((item) => item.location.type === 'inventory').length;

  return (
    <div className="worldSummary">
      <div className="panelHeader">
        <p className="panelEyebrow">World State</p>
        <h2>Snapshot</h2>
      </div>
      <dl className="summaryGrid">
        <div>
          <dt>World</dt>
          <dd>{world.id}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>
            {world.width} x {world.height}
          </dd>
        </div>
        <div>
          <dt>NPCs</dt>
          <dd>{world.npcs.length}</dd>
        </div>
        <div>
          <dt>Trees</dt>
          <dd>{world.trees.length}</dd>
        </div>
        <div>
          <dt>Ground Items</dt>
          <dd>{groundItemCount}</dd>
        </div>
        <div>
          <dt>Held Items</dt>
          <dd>{inventoryItemCount}</dd>
        </div>
      </dl>
    </div>
  );
};
