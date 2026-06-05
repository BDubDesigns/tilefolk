import type { WorldEvent } from '@tilefolk/shared';
import './EventLog.css';

interface EventLogProps {
  events: WorldEvent[];
}

export const EventLog = ({ events }: EventLogProps) => {
  const reverseEvents = [...events].reverse();
  const newestEvents = reverseEvents.slice(0, 5);
  return (
    <div className="eventLog">
      <div className="panelHeader">
        <p className="panelEyebrow">Recent Turns</p>
        <h2>Event Log</h2>
      </div>
      {!events.length && <p className="eventLog__empty">No events yet</p>}
      {newestEvents.map((event) => {
        return (
          <div key={event.id} className="eventLogItem">
            <p className="eventMessage">
              Turn {event.turn}: {event.message}
            </p>
            {event.controllerReason && (
              <p className="eventReason">Reason: {event.controllerReason}</p>
            )}
            {event.controllerDurationMs !== undefined && (
              <p className="eventDebug">
                Controller: {event.controllerLabel ?? 'unknown'} ({event.controllerDurationMs}ms)
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
