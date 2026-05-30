import type { World, WorldEvent } from '@tilefolk/shared';

interface AddMemoriesForWitnessesOptions {
  world: World;
  event: WorldEvent;
  radius?: number;
}

export function addMemoriesForWitnesses({
  world,
  event,
  radius = 3,
}: AddMemoriesForWitnessesOptions): void {
  if (!event.position) return;
  const eventPosition = event.position;

  const witnesses = world.npcs.filter((npc) => {
    return (
      Math.abs(npc.position.x - eventPosition.x) <= radius &&
      Math.abs(npc.position.y - eventPosition.y) <= radius
    );
  });

  for (const witness of witnesses) {
    const memoryId = `memory_${witness.id}_${witness.memories.length}`;
    witness.memories.push({
      id: memoryId,
      npcId: witness.id,
      sourceEventId: event.id,
      turn: event.turn,
      message: event.message,
      position: { ...eventPosition },
    });
  }
}
