import { useState, useEffect, useCallback, useRef } from 'react';
import { TaskResponse } from '@/lib/types';

interface UseTaskPollingReturn {
  task: TaskResponse | null;
  isLoading: boolean;
  error: string | null;
  startPolling: (taskId: string) => void;
  stopPolling: () => void;
}

export function useTaskPolling(): UseTaskPollingReturn {
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTaskIdRef = useRef<string | null>(null);

  const pollTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task status');
      }
      const data = await response.json();
      setTask(data);

      if (data.status === 'success' || data.status === 'fail' || data.status === 'download_failed') {
        stopPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      stopPolling();
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const startPolling = useCallback(
    (taskId: string) => {
      stopPolling();
      currentTaskIdRef.current = taskId;
      setIsLoading(true);
      setError(null);
      setTask(null);

      pollTask(taskId);
      intervalRef.current = setInterval(() => pollTask(taskId), 3000);
    },
    [pollTask, stopPolling]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { task, isLoading, error, startPolling, stopPolling };
}
