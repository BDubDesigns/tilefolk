import type { ActionResult } from '@tilefolk/shared';
import './SimulationControls.css';

interface SimulationControlsProps {
  stepLoading: boolean;
  resetLoading: boolean;
  lastActionResult: ActionResult | null;
  actionError: string | null;
  adminToken: string;
  onAdminTokenChange: (token: string) => void;
  onStepWorld: () => void;
  onResetWorld: () => void;
}

export const SimulationControls = ({
  stepLoading,
  resetLoading,
  lastActionResult,
  actionError,
  adminToken,
  onAdminTokenChange,
  onStepWorld,
  onResetWorld,
}: SimulationControlsProps) => {
  return (
    <div className="simulationControls">
      <div className="panelHeader">
        <p className="panelEyebrow">Admin Controls</p>
        <h2>Drive The Sim</h2>
      </div>

      <div className="simulationControls__body">
        <div className="simulationControls__buttons">
          <button onClick={onStepWorld} disabled={stepLoading}>
            {stepLoading ? 'Stepping...' : 'Step World'}
          </button>
          <button onClick={onResetWorld} disabled={resetLoading}>
            {resetLoading ? 'Resetting...' : 'Reset World'}
          </button>
        </div>
        <div className="simulationControls__token">
          <label htmlFor="admin-token">Admin Token</label>
          <div className="simulationControls__inputRow">
            <input
              id="admin-token"
              type="password"
              placeholder="Required to mutate world"
              value={adminToken}
              onChange={(e) => onAdminTokenChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      {actionError && <p className="simulationControls__error">{actionError}</p>}
      {lastActionResult ? (
        <p className="simulationControls__lastAction">{lastActionResult.message}</p>
      ) : (
        <p className="simulationControls__lastAction">No actions yet</p>
      )}
    </div>
  );
};
