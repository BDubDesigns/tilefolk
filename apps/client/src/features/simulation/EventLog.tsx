import type { WorldEvent } from '@tilefolk/shared';

interface EventLogProps {
  events: WorldEvent[];
}

export const EventLog = ({ events }: EventLogProps) => {
  const reverseEvents = [...events].reverse();
  const newestEvents = reverseEvents.slice(0, 5);
  return (
    <div>
      <h2>Event Log</h2>
      {!events.length && <p>No events yet</p>}
      {newestEvents.map((event) => {
        return (
          <p key={event.id}>
            Turn {event.turn}: {event.message}
          </p>
        );
      })}
    </div>
  );
};
