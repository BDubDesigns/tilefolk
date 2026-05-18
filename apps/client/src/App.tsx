import { useEffect, useState } from 'react';
import { WorldGrid } from './features/world/WorldGrid';
import './App.css';
import type { StepWorldResponse, World, ActionResult } from '@tilefolk/shared';
import { WorldSummary } from './features/world/WorldSummary';
import { SimulationControls } from './features/simulation/SimulationControls';
import { EventLog } from './features/simulation/EventLog';

export function App() {
  const [world, setWorld] = useState<null | World>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [lastActionResult, setLastActionResult] = useState<null | ActionResult>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetWorld = async () => {
    setResetLoading(true);

    try {
      // hit reset endpoint, which returns a new world
      const response = await fetch('/api/worlds/reset', { method: 'POST' });
      const data = (await response.json()) as World;
      if (!response.ok) {
        setError(`An error occurred: ${response.statusText}`);
      } else {
        setError(null);
        setWorld(data);
        setLastActionResult(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(`An error occurred: ${error}`);
      }
    } finally {
      setResetLoading(false);
    }
  };
  const handleStepWorld = async () => {
    setStepLoading(true);

    try {
      // fetch world from server
      const response = await fetch('/api/worlds/default/step', { method: 'POST' });
      const data = (await response.json()) as StepWorldResponse;
      // guard against no world
      if (!response.ok) {
        setError(`An error occurred: ${response.statusText}`);
      } else {
        setError(null);
        // update world state
        setWorld(data.world);
        // update last action result
        setLastActionResult(data.actionResult);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(`An error occurred: ${error}`);
      }
    } finally {
      setStepLoading(false);
    }
  };

  useEffect(() => {
    const fetchWorld = async () => {
      setLoading(true);

      try {
        // clear error state first
        setError(null);
        // fetch world from server
        const response = await fetch('/api/worlds/default');
        const data = (await response.json()) as World;
        if (!response.ok) {
          setError(`An error occurred: ${response.statusText}`);
        } else {
          setWorld(data);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(`An error occurred: ${error}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorld();
  }, []);

  let content;

  if (loading) {
    content = <p className="loading">Loading...</p>;
  } else if (error) {
    content = <p className="error">{error}</p>;
  } else if (world) {
    content = (
      <div id="world-container">
        <div className="simulationPanel">
          <WorldSummary world={world} />

          <SimulationControls
            stepLoading={stepLoading}
            resetLoading={resetLoading}
            lastActionResult={lastActionResult}
            onStepWorld={handleStepWorld}
            onResetWorld={handleResetWorld}
          />
          <EventLog events={world.events} />
        </div>

        <WorldGrid tiles={world.tiles} npcs={world.npcs} items={world.items} trees={world.trees} />
      </div>
    );
  } else {
    content = null;
  }

  return (
    <main className="appShell">
      <section aria-labelledby="app-title">
        <p className="eyebrow">Tilefolk NPC Simulation</p>
        <h1 id="app-title">Simulation Console</h1>
        <div>{content}</div>
      </section>
    </main>
  );
}
