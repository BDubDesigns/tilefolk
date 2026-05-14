import type { TileGrid, Npc, Item, Tree } from '@tilefolk/shared';
import './WorldGrid.css';

type WorldGridProps = {
  tiles: TileGrid;
  npcs: Npc[];
  items: Item[];
  trees: Tree[];
};

export const WorldGrid = ({ tiles, npcs, items, trees }: WorldGridProps) => {
  // guard against empty tiles
  const firstRow = tiles[0];
  if (!firstRow || firstRow.length === 0) {
    return null;
  }

  const dynamicColumnCount = firstRow.length;
  const squareSideLength = 16;
  const gap = 1;
  const cellStride = squareSideLength + gap;
  return (
    <div className="world-grid-viewport">
      {/* wrapper for board */}
      <div className="world-board">
        {/* wrapper for grid and entity layer */}
        <div
          className="world-grid"
          // we manually set gap and gridTemplateColumns to prevent the grid from overflowing the viewport
          style={{
            gap: `${gap}px`,
            gridTemplateColumns: `repeat(${dynamicColumnCount}, ${squareSideLength}px)`,
          }}
        >
          {tiles.map((row, rowIndex) =>
            row.map((tile, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                style={{
                  backgroundColor: tile.terrain === 'grass' ? '#19e24f' : '#555',
                  width: `${squareSideLength}px`,
                  height: `${squareSideLength}px`,
                }}
              />
            )),
          )}
        </div>
        <div className="entity-layer">
          {/* wrapper for npc entities */}
          {npcs.map((npc, index) => (
            <div
              key={npc.id}
              className="entity-marker entity-marker--npc"
              style={{
                left: `${npc.position.x * cellStride}px`,
                top: `${npc.position.y * cellStride}px`,
              }}
            >
              {index}
            </div>
          ))}

          {/* wrapper for tree entities */}
          {trees.map((tree) => (
            <div
              key={tree.id}
              className="entity-marker entity-marker--tree"
              style={{
                left: `${tree.position.x * cellStride}px`,
                top: `${tree.position.y * cellStride}px`,
              }}
            >
              T
            </div>
          ))}

          {/* wrapper for item entities */}
          {items.map((item) => {
            // guard against not being on the ground
            if (item.location.type !== 'ground') {
              return null; // don't render if not on the ground (its held by an NPC)
            }
            return (
              <div
                key={item.id}
                className="entity-marker entity-marker--item"
                style={{
                  left: `${item.location.position.x * cellStride}px`,
                  top: `${item.location.position.y * cellStride}px`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
