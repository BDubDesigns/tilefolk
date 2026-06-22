import { useEffect, useState } from 'react';
import { WorldGrid } from './features/world/WorldGrid';
import './App.css';
import { WorldSummary } from './features/world/WorldSummary';
import { SimulationControls } from './features/simulation/SimulationControls';
import { EventLog } from './features/simulation/EventLog';
import { NpcSummary } from './features/world/NpcSummary';

import type {
  StepWorldResponse,
  World,
  ActionResult,
  StatusResponse,
  ProviderTestResult,
} from '@tilefolk/shared';

export function App() {
  const [world, setWorld] = useState<null | World>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [lastActionResult, setLastActionResult] = useState<null | ActionResult>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('adminToken') ?? '';
  });
  const [status, setStatus] = useState<null | StatusResponse>(null);
  const [providerTestResults, setProviderTestResults] = useState<ProviderTestResult[] | null>(null);
  const [providerTestLoading, setProviderTestLoading] = useState(false);
  const [providerTestError, setProviderTestError] = useState<string | null>(null);

  const getAdminHeaders = (): HeadersInit => {
    if (adminToken) {
      return { 'x-tilefolk-admin-token': adminToken };
    }
    return {};
  };

  const handleAdminTokenChange = (token: string) => {
    setAdminToken(token);
    if (token === '') {
      sessionStorage.removeItem('adminToken');
    } else {
      sessionStorage.setItem('adminToken', token);
    }
  };

  const handleRunProviderTests = async () => {
    setProviderTestLoading(true);
    try {
      setProviderTestError(null);
      const response = await fetch('/api/providers/test', {
        method: 'POST',
        headers: getAdminHeaders(),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        setProviderTestError(errorBody.error ?? `An error occurred: ${response.statusText}`);
        return;
      }

      const body = (await response.json()) as ProviderTestResult[];
      setProviderTestResults(body);
      setProviderTestError(null);
    } catch (error) {
      setProviderTestError(error instanceof Error ? error.message : String(error));
    } finally {
      setProviderTestLoading(false);
    }
  };

  const handleResetWorld = async () => {
    setResetLoading(true);

    try {
      // hit reset endpoint, which returns a new world
      const response = await fetch('/api/worlds/reset', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        setActionError(errorBody.error ?? `An error occurred: ${response.statusText}`);
      } else {
        const data = (await response.json()) as World;
        setActionError(null);
        setWorld(data);
        setLastActionResult(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setActionError(error.message);
      } else {
        setActionError(`An error occurred: ${error}`);
      }
    } finally {
      setResetLoading(false);
    }
  };
  const handleStepWorld = async () => {
    setStepLoading(true);

    try {
      // fetch world from server
      const response = await fetch('/api/worlds/default/step', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      // guard against no world
      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        setActionError(errorBody.error ?? `An error occurred: ${response.statusText}`);
      } else {
        const data = (await response.json()) as StepWorldResponse;
        setActionError(null);
        // update world state
        setWorld(data.world);
        // update last action result
        setLastActionResult(data.actionResult);
      }
    } catch (error) {
      if (error instanceof Error) {
        setActionError(error.message);
      } else {
        setActionError(`An error occurred: ${error}`);
      }
    } finally {
      setStepLoading(false);
    }
  };

  useEffect(() => {
    // fetch status on load to display version number
    const fetchStatus = async () => {
      const response = await fetch('/api/status');
      const data = (await response.json()) as StatusResponse;
      setStatus(data);
    };

    // fetch world on load
    const fetchWorld = async () => {
      setLoading(true);

      try {
        // clear error state first
        setLoadError(null);
        // fetch world from server
        const response = await fetch('/api/worlds/default');
        const data = (await response.json()) as World;
        if (!response.ok) {
          setLoadError(`An error occurred: ${response.statusText}`);
        } else {
          setWorld(data);
        }
      } catch (error) {
        if (error instanceof Error) {
          setLoadError(error.message);
        } else {
          setLoadError(`An error occurred: ${error}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorld();
    fetchStatus();
  }, []);

  let content;

  if (loading) {
    content = <p className="loading">Loading...</p>;
  } else if (loadError) {
    content = <p className="error">{loadError}</p>;
  } else if (world) {
    content = (
      <div className="simulationConsole">
        <aside className="sidebarPanel sidebarPanel--left" aria-label="World controls">
          <WorldSummary world={world} />

          <SimulationControls
            stepLoading={stepLoading}
            resetLoading={resetLoading}
            lastActionResult={lastActionResult}
            onStepWorld={handleStepWorld}
            onResetWorld={handleResetWorld}
            adminToken={adminToken}
            onAdminTokenChange={handleAdminTokenChange}
            actionError={actionError}
          />

          <section className="providerTestPanel" aria-label="Provider test panel">
            <div className="panelHeader">
              <p className="panelEyebrow">Provider Tests</p>
              <h2>LLM Diagnostics</h2>
            </div>

            <button onClick={handleRunProviderTests} disabled={providerTestLoading}>
              {providerTestLoading ? 'Testing providers...' : 'Run Provider Tests'}
            </button>

            {providerTestError ? (
              <p className="providerTestPanel__error">{providerTestError}</p>
            ) : null}

            {providerTestResults ? (
              <ul className="providerTestPanel__results">
                {providerTestResults.map((result) => (
                  <li
                    key={`${result.provider}-${result.model}`}
                    className={`providerTestPanel__result providerTestPanel__result--${
                      result.success ? 'success' : 'failure'
                    }`}
                  >
                    <div>
                      <strong>{result.provider}</strong>
                      <span>{result.model}</span>
                    </div>
                    <p>
                      {result.success ? '✅' : '❌'} {result.durationMs}ms — {result.message}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="providerTestPanel__empty">No provider tests run yet.</p>
            )}
          </section>
        </aside>

        <section className="mapPanel" aria-label="Tilefolk world map">
          <div className="mapPanel__header">
            <div>
              <p className="panelEyebrow">Live World</p>
              <h2>25 x 25 Tile Map</h2>
            </div>
            <p className="turnBadge">
              Round {world.round} - Turn {world.turn}
            </p>
          </div>

          <WorldGrid
            tiles={world.tiles}
            npcs={world.npcs}
            items={world.items}
            trees={world.trees}
            bushes={world.bushes}
          />
        </section>

        <div className="sidebarPanel sidebarPanel--right">
          <EventLog events={world.events} />
          <NpcSummary world={world} />
        </div>
      </div>
    );
  } else {
    content = null;
  }

  return (
    <main className="appShell">
      <section className="appFrame" aria-labelledby="app-title">
        <header className="appHeader">
          <div>
            <p className="eyebrow">Tilefolk NPC Simulation</p>
            <h1 id="app-title">Simulation Console</h1>
          </div>
          {status ? (
            <div className="statusCluster" aria-label="Operational status">
              <span>Version: v{status.version}</span>
              <span>Controller: {status.defaultController.toUpperCase()}</span>
              <span>
                Assignments: {status.useSampleControllerAssignments ? 'Sample' : 'Default'}
              </span>
              <span>Mutation: {status.isAdminTokenConfigured ? 'Locked' : 'Open'}</span>
            </div>
          ) : null}
        </header>
        <div>{content}</div>
      </section>
    </main>
  );
}
