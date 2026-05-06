import { useState, useEffect, useCallback } from 'react';

interface UseCreditsReturn {
  credits: number | null;
  isLoading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
}

export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/credits');
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      const data = await response.json();
      setCredits(data.credits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCredits();
    const interval = setInterval(refreshCredits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshCredits]);

  return { credits, isLoading, error, refreshCredits };
}
