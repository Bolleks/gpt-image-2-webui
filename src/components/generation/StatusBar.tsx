'use client';

import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { icon: typeof Loader2; color: string; bg: string; text: string }> = {
  waiting: { icon: Clock, color: 'text-white/60', bg: 'bg-white/10', text: 'Ожидание...' },
  queuing: { icon: Clock, color: 'text-white/60', bg: 'bg-white/10', text: 'В очереди...' },
  generating: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', text: 'Генерация...' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', text: 'Готово!' },
  fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', text: 'Ошибка' },
  download_failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', text: 'Ошибка загрузки' },
};

interface StatusBarProps {
  status: TaskStatus | null;
  failMsg?: string | null;
}

export function StatusBar({ status, failMsg }: StatusBarProps) {
  if (!status) return null;

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm',
      config.bg, config.color
    )}>
      <Icon className={cn('w-4 h-4', status === 'generating' && 'animate-spin')} />
      <span>{config.text}</span>
      {failMsg && status !== 'success' && (
        <span className="text-red-400 ml-2 text-xs">{failMsg}</span>
      )}
    </div>
  );
}
