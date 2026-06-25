import type { DecisionTrace } from '@tilefolk/shared';
import { useState } from 'react';

interface DecisionTracePanelProps {
  traces: DecisionTrace[];
}

export function DecisionTracePanel({ traces }: DecisionTracePanelProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

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
          <button className="decisionTracePanel__copyButton" onClick={handleCopyTraces}>
            Copy Decision Traces JSON
          </button>
          {copyMessage ? <p className="decisionTracePanel__copyMessage">{copyMessage}</p> : null}

          <details className="decisionTracePanel__details">
            <summary>{traces.length} decision trace(s) recorded</summary>
            <ul className="decisionTracePanel__list">
              {traces.map((trace) => (
                <li key={trace.id} className="decisionTracePanel__trace">
                  <details>
                    <summary>
                      Turn {trace.turn}: {trace.npcId} — {trace.controllerDecisionStatus} —{' '}
                      {trace.actionResult.message}
                    </summary>
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
