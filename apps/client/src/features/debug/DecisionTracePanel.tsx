import type { DecisionTrace } from '@tilefolk/shared';
import { useState } from 'react';

interface DecisionTracePanelProps {
  traces: DecisionTrace[];
}

export function DecisionTracePanel({ traces }: DecisionTracePanelProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState('all');
  const npcIds = [...new Set(traces.map((trace) => trace.npcId))].sort();
  const filteredTraces =
    selectedNpcId === 'all' ? traces : traces.filter((trace) => trace.npcId === selectedNpcId);
  const newestFirstTraces = [...filteredTraces].reverse();

  const handleCopyTraces = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(traces, null, 2));
      setCopyMessage('Copied decision traces JSON.');
    } catch (error) {
      setCopyMessage(
        error instanceof Error ? error.message : 'Failed to copy decision traces JSON.',
      );
    }
  };

  const handleCopyTrace = async (trace: DecisionTrace) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
      setCopyMessage(`Copied ${trace.id} JSON.`);
    } catch (error) {
      setCopyMessage(error instanceof Error ? error.message : `Failed to copy ${trace.id} JSON.`);
    }
  };

  return (
    <section className="decisionTracePanel" aria-label="Decision trace panel">
      <div className="panelHeader">
        <p className="panelEyebrow">Debug</p>
        <h2>Decision Traces</h2>
      </div>

      {traces.length === 0 ? (
        <p className="decisionTracePanel__empty">No decision traces recorded yet.</p>
      ) : (
        <>
          <div className="decisionTracePanel__controls">
            <label>
              NPC
              <select
                value={selectedNpcId}
                onChange={(event) => setSelectedNpcId(event.target.value)}
              >
                <option value="all">All NPCs</option>
                {npcIds.map((npcId) => (
                  <option key={npcId} value={npcId}>
                    {npcId}
                  </option>
                ))}
              </select>
            </label>
            <button className="decisionTracePanel__copyButton" onClick={handleCopyTraces}>
              Copy Decision Traces JSON
            </button>
          </div>
          {copyMessage ? <p className="decisionTracePanel__copyMessage">{copyMessage}</p> : null}

          <details className="decisionTracePanel__details">
            <summary>
              {filteredTraces.length} of {traces.length} decision trace(s) shown
            </summary>
            <ul className="decisionTracePanel__list">
              {newestFirstTraces.map((trace) => (
                <li key={trace.id} className="decisionTracePanel__trace">
                  <details>
                    <summary>
                      Turn {trace.turn}: {trace.npcId} — {trace.controllerDecisionStatus} —{' '}
                      {trace.actionResult.message}
                    </summary>
                    <button
                      className="decisionTracePanel__copyButton decisionTracePanel__copyButton--small"
                      onClick={() => void handleCopyTrace(trace)}
                    >
                      Copy Trace JSON
                    </button>

                    <dl className="decisionTracePanel__traceDetails">
                      <div>
                        <dt>Round</dt>
                        <dd>{trace.round}</dd>
                      </div>
                      <div>
                        <dt>Controller</dt>
                        <dd>{trace.controllerLabel}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{trace.controllerDecisionStatus}</dd>
                      </div>
                      <div>
                        <dt>Selected option</dt>
                        <dd>{trace.selectedOptionId ?? 'None'}</dd>
                      </div>
                      <div>
                        <dt>Reason</dt>
                        <dd>{trace.controllerReason ?? 'None'}</dd>
                      </div>
                      <div>
                        <dt>Duration</dt>
                        <dd>
                          {trace.controllerDurationMs !== undefined
                            ? `${trace.controllerDurationMs}ms`
                            : 'Unknown'}
                        </dd>
                      </div>
                    </dl>

                    <details className="decisionTracePanel__promptDetails">
                      <summary>Prompt</summary>
                      <pre className="decisionTracePanel__pre">{trace.decisionInput.prompt}</pre>
                    </details>

                    <details className="decisionTracePanel__rawDetails">
                      <summary>Raw trace JSON</summary>
                      <pre className="decisionTracePanel__pre">
                        {JSON.stringify(trace, null, 2)}
                      </pre>
                    </details>
                  </details>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
}
