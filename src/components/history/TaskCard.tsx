'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface TaskCardProps {
  task: TaskRow;
  onClick: () => void;
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  waiting: { icon: Clock, color: 'text-white/60', bg: 'bg-white/10', label: 'Ожидание' },
  queuing: { icon: Clock, color: 'text-white/60', bg: 'bg-white/10', label: 'В очереди' },
  generating: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Генерация' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Успешно' },
  fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Ошибка' },
  download_failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Ошибка загрузки' },
};

function timeAgo(date: Date | number): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'только что';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
  return `${Math.floor(seconds / 86400)} дн назад`;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.waiting;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className="glass-card-sm p-4 cursor-pointer glass-card-hover transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{task.prompt}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40">
              {task.aspectRatio}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40">
              {task.resolution}
            </span>
            <span className="text-xs text-white/30">
              {timeAgo(task.createdAt)}
            </span>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            'flex items-center gap-1 shrink-0',
            config.bg, config.color
          )}
        >
          <Icon className={cn('w-3 h-3', task.status === 'generating' && 'animate-spin')} />
          {config.label}
        </Badge>
      </div>
    </div>
  );
}
