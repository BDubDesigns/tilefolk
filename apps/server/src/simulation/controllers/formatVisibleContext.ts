import type { Position, VisibleWorldContext } from '@tilefolk/shared';

function formatRelativePosition(center: Position, position: Position): string {
  const dx = position.x - center.x;
  const dy = position.y - center.y;
  const horizontal = dx > 0 ? 'east' : dx < 0 ? 'west' : '';
  const vertical = dy > 0 ? 'south' : dy < 0 ? 'north' : '';
  const direction = `${vertical}${horizontal}` || 'here';
  const distance = Math.max(Math.abs(dx), Math.abs(dy));

  return `${direction}, ${distance} tile${distance === 1 ? '' : 's'} away`;
}

export function formatVisibleContext(context: VisibleWorldContext): string {
  const nearbyNpcs = context.nearbyNpcs
    .map(
      (npc) =>
        `${npc.name} (${npc.position.x}, ${npc.position.y}) - ${formatRelativePosition(
          context.center,
          npc.position,
        )}`,
    )
    .join('\n');
  const nearbyTrees = context.nearbyTrees
    .map(
      (tree) =>
        `${tree.id}: ${tree.hitPoints}hp (${tree.position.x}, ${tree.position.y}) - ${formatRelativePosition(
          context.center,
          tree.position,
        )}`,
    )
    .join('\n');
  const nearbyGroundItems = context.nearbyGroundItems
    .map((item) =>
      item.location.type === 'ground'
        ? `${item.name} (${item.location.position.x}, ${
            item.location.position.y
          }) - ${formatRelativePosition(context.center, item.location.position)}`
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
