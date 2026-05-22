import type { World } from '@tilefolk/shared';

interface NpcSummaryProps {
  npcs: World['npcs'];
  items: World['items'];
}
export const NpcSummary = ({ npcs, items }: NpcSummaryProps) => {
  const output = npcs.map((npc) => {
    return (
      <details>
        <summary>{npc.id}</summary>
        <p>
          <b>{npc.name}</b>
        </p>
        <p>
          X: {npc.position.x}, Y: {npc.position.y}
        </p>
        <ul>
          {items
            .filter((item) => item.location.type === 'inventory' && item.location.npcId === npc.id)
            .map((item) => {
              return <li>{item.name}</li>;
            })}
        </ul>
      </details>
    );
  });
  return <div>{output}</div>;
};
