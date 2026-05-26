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
      <div>
        <div className="simulationControls__buttons">
          {/* step world button */}
          <button onClick={onStepWorld} disabled={stepLoading}>
            Step World
          </button>
          {/* reset world button */}
          <button onClick={onResetWorld} disabled={resetLoading}>
            Reset World
          </button>
        </div>
        <div className="simulationControls__token">
          <label>
            Admin Token:{' '}
            <input
              type="password"
              value={adminToken}
              onChange={(e) => onAdminTokenChange(e.target.value)}
            />
          </label>
          {actionError && <p className="simulationControls__error">{actionError}</p>}
        </div>
      </div>
      {lastActionResult ? (
        <p>Last Action Result: {lastActionResult.message}</p>
      ) : (
        <p>Last Action Result: No actions yet</p>
      )}
    </div>
  );
};
