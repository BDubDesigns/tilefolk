import type { VisibleWorldContext } from '@tilefolk/shared';

export function formatVisibleContext(context: VisibleWorldContext): string {
  const nearbyNpcs = context.nearbyNpcs
    .map((npc) => `${npc.name} (${npc.position.x}, ${npc.position.y})`)
    .join('\n');
  const nearbyTrees = context.nearbyTrees
    .map((tree) => `${tree.id}: ${tree.hitPoints}hp (${tree.position.x}, ${tree.position.y})`)
    .join('\n');
  const nearbyGroundItems = context.nearbyGroundItems
    .map((item) =>
      item.location.type === 'ground'
        ? `${item.name} (${item.location.position.x}, ${item.location.position.y})`
        : null,
    )
    .filter(Boolean)
    .join('\n');

  return `You can see in a ${context.radius} square radius, including diagonals.
  Nearby NPCs:
  ${nearbyNpcs || 'None'}
  Nearby trees:
  ${nearbyTrees || 'None'}
  Nearby ground items:
  ${nearbyGroundItems || 'None'}
`;
}
