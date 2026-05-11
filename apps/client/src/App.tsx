import { useEffect, useState } from 'react';
import type { HealthResponse } from '@tilefolk/shared';

import './App.css';

type ConnectionState = 'checking' | 'ready' | 'offline';

export function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking');

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const response = await fetch('/api/health');
        const body = (await response.json()) as HealthResponse;

        if (isMounted) {
          setConnectionState(response.ok && body.status === 'ok' ? 'ready' : 'offline');
        }
      } catch {
        if (isMounted) {
          setConnectionState('offline');
        }
      }
    }

    void checkHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="appShell">
      <section className="statusPanel" aria-labelledby="app-title">
        <p className="eyebrow">Tilefolk NPC Simulation</p>
        <h1 id="app-title">Simulation Console</h1>
        <p className="statusLine">API status: {connectionState}</p>
      </section>
    </main>
  );
}
