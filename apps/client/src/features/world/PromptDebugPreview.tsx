import type { NpcId } from '@tilefolk/shared';
import { useState } from 'react';

interface PromptDebugPreviewProps {
  npcId: NpcId;
}

export function PromptDebugPreview({ npcId }: PromptDebugPreviewProps) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    setPrompt(null);
    setError(null);
    try {
      const response = await fetch(`/api/debug/npcs/${npcId}/prompt`);
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt: ${response.statusText}`);
      }
      const data = (await response.json()) as { prompt: string };
      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="promptDebugPreview">
      <button className="promptDebugPreview__button" onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading prompt...' : 'View Prompt'}
      </button>
      {error && <p className="promptDebugPreview__error">Error: {error}</p>}
      {prompt && (
        <details className="promptDebugPreview__details" open>
          <summary>Current Prompt Debug Info</summary>
          <pre className="promptDebugPreview__prompt">{prompt}</pre>
        </details>
      )}
    </div>
  );
}
