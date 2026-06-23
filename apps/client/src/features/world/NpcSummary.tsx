import { getVisibleWorldContext, NEEDS_MAX_VALUES, type World } from '@tilefolk/shared';
import { PromptDebugPreview } from './PromptDebugPreview';

interface NpcSummaryProps {
  world: World;
}

export const NpcSummary = ({ world }: NpcSummaryProps) => {
  const npcs = world.npcs;
  const items = world.items;

  const output = npcs.map((npc) => {
    const visibleContext = getVisibleWorldContext({ world, npc });
    const inventoryItems = items.filter(
      (item) => item.location.type === 'inventory' && item.location.npcId === npc.id,
    );

    return (
      <details key={npc.id} className="npcSummary__npc">
        <summary>
          <span>{npc.id}</span>
          <span>
            {npc.position.x}, {npc.position.y}
          </span>
        </summary>
        <p>
          <b>{npc.name}</b>
        </p>
        <p>
          <b>Needs:</b>
        </p>
        <ul>
          <li>
            Hunger: {npc.needs.hunger} / {NEEDS_MAX_VALUES.hunger}
          </li>
        </ul>
        <p>
          X: {npc.position.x}, Y: {npc.position.y}
        </p>
        <p>
          <b>Inventory:</b>
        </p>
        <ul>
          {inventoryItems.length === 0 ? (
            <li>None</li>
          ) : (
            inventoryItems.map((item) => {
              return <li key={item.id}>{item.name}</li>;
            })
          )}
        </ul>
        <p>
          <b>Visible Context:</b> radius {visibleContext.radius}
        </p>
        <p>Nearby NPCs:</p>
        <ul>
          {visibleContext.nearbyNpcs.length === 0 ? (
            <li>None</li>
          ) : (
            visibleContext.nearbyNpcs.map((visibleNpc) => {
              return (
                <li key={visibleNpc.id}>
                  {visibleNpc.name} ({visibleNpc.position.x}, {visibleNpc.position.y})
                </li>
              );
            })
          )}
        </ul>
        <p>Nearby trees:</p>
        <ul>
          {visibleContext.nearbyTrees.length === 0 ? (
            <li>None</li>
          ) : (
            visibleContext.nearbyTrees.map((tree) => {
              return (
                <li key={tree.id}>
                  {tree.id}: {tree.hitPoints}hp ({tree.position.x}, {tree.position.y})
                </li>
              );
            })
          )}
        </ul>
        <p>Nearby ground items:</p>
        <ul>
          {visibleContext.nearbyGroundItems.length === 0 ? (
            <li>None</li>
          ) : (
            visibleContext.nearbyGroundItems.map((item) => {
              if (item.location.type !== 'ground') return null;

              return (
                <li key={item.id}>
                  {item.name} ({item.location.position.x}, {item.location.position.y})
                </li>
              );
            })
          )}
        </ul>
        <PromptDebugPreview npcId={npc.id} />
      </details>
    );
  });

  return (
    <div className="npcSummary">
      <div className="panelHeader">
        <p className="panelEyebrow">Agents</p>
        <h2>NPC Context</h2>
      </div>
      <div className="npcSummary__list">{output}</div>
    </div>
  );
};
