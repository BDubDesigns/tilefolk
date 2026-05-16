import { useEffect, useState } from 'react';
import { WorldGrid } from './features/world/WorldGrid';
import './App.css';
import type { StepWorldResponse, World, ActionResult } from '@tilefolk/shared';

export function App() {
  const [world, setWorld] = useState<null | World>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [lastActionResult, setLastActionResult] = useState<null | ActionResult>(null);

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
        <div className="world">
          <p>World ID: {world.id}</p>
          <p>
            Dimensions: {world.width} x {world.height}
          </p>
          <p>NPCs: {world.npcs.length}</p>
          <p>Items: {world.items.length}</p>
          <p>Trees: {world.trees.length}</p>
        </div>
        <div>
          {/* step world button */}
          <button onClick={handleStepWorld} disabled={stepLoading}>
            Step World
          </button>
          {lastActionResult ? (
            <p>Last Action Result: {lastActionResult.message}</p>
          ) : (
            <p>Last Action Result: No actions yet</p>
          )}
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
