'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskDetailModalProps {
  task: {
    id: string;
    prompt: string;
    aspectRatio: string;
    resolution: string;
    status: string;
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    createdAt: Date | number;
    completedAt: Date | number | null;
  } | null;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-white/10 text-white/60',
  queuing: 'bg-white/10 text-white/60',
  generating: 'bg-blue-500/20 text-blue-400',
  success: 'bg-green-500/20 text-green-400',
  fail: 'bg-red-500/20 text-red-400',
  download_failed: 'bg-red-500/20 text-red-400',
};

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h3 className="text-lg font-semibold text-white">Детали задачи</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wide">ID задачи</label>
            <p className="text-sm font-mono text-white/80 break-all mt-1">{task.id}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Промпт</label>
            <p className="text-sm text-white mt-1">{task.prompt}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-white/10 text-white/80">
              {task.aspectRatio}
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-white/80">
              {task.resolution}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(STATUS_COLORS[task.status] || 'bg-white/10 text-white/60')}
            >
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          {task.failMsg && (
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Ошибка</label>
              <p className="text-sm text-red-400 mt-1">{task.failMsg}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Создано</label>
              <p className="text-sm text-white/80">{new Date(task.createdAt).toLocaleString()}</p>
            </div>
            {task.completedAt && (
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Завершено</label>
                <p className="text-sm text-white/80">{new Date(task.completedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
          {task.costTime && (
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Время генерации</label>
              <p className="text-sm text-white/80">{(task.costTime / 1000).toFixed(1)}с</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
