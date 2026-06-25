import type { DecisionTrace } from '@tilefolk/shared';

interface DecisionTracePanelProps {
  traces: DecisionTrace[];
}

export function DecisionTracePanel({ traces }: DecisionTracePanelProps) {
  return (
    <section className="decisionTracePanel" aria-label="Decision trace panel">
      <div className="panelHeader">
        <p className="panelEyebrow">Debug</p>
        <h2>Decision Traces</h2>
      </div>

      {traces.length === 0 ? (
        <p className="decisionTracePanel__empty">No decision traces recorded yet.</p>
      ) : (
        <details className="decisionTracePanel__details">
          <summary>{traces.length} decision trace(s) recorded</summary>
          <ul className="decisionTracePanel__list">
            {traces.map((trace) => (
              <li key={trace.id} className="decisionTracePanel__trace">
                Turn {trace.turn}: {trace.npcId} — {trace.controllerDecisionStatus}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
