import type { ActionResult } from '@tilefolk/shared';
import './SimulationControls.css';

interface SimulationControlsProps {
  stepLoading: boolean;
  resetLoading: boolean;
  lastActionResult: ActionResult | null;
  onStepWorld: () => void;
  onResetWorld: () => void;
}

export const SimulationControls = ({
  stepLoading,
  resetLoading,
  lastActionResult,
  onStepWorld,
  onResetWorld,
}: SimulationControlsProps) => {
  return (
    <div className="simulationControls">
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
      {lastActionResult ? (
        <p>Last Action Result: {lastActionResult.message}</p>
      ) : (
        <p>Last Action Result: No actions yet</p>
      )}
    </div>
  );
};
