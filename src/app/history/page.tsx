'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskCard } from '@/components/history/TaskCard';
import { TaskDetailModal } from '@/components/history/TaskDetailModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskRow {
  id: string;
  prompt: string;
  aspectRatio: string;
  resolution: string;
  status: string;
  failCode: string | null;
  failMsg: string | null;
  createdAt: Date | number;
  completedAt: Date | number | null;
  costTime: number | null;
}

const STATUS_FILTERS = [
  { value: '', label: 'Все' },
  { value: 'success', label: 'Успешные' },
  { value: 'generating', label: 'Генерация' },
  { value: 'waiting', label: 'Ожидание' },
  { value: 'queuing', label: 'В очереди' },
  { value: 'fail', label: 'Ошибки' },
  { value: 'download_failed', label: 'Ошибка загрузки' },
];

export default function HistoryPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks?page=all');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
        История задач
      </h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
              statusFilter === filter.value
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/30">Задачи не найдены</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-white/10 text-white hover:bg-white/20 rounded-xl"
              >
                Назад
              </Button>
              <span className="text-sm text-white/50">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-white/10 text-white hover:bg-white/20 rounded-xl"
              >
                Далее
              </Button>
            </div>
          )}
        </>
      )}

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
