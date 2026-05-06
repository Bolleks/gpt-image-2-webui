'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Play } from 'lucide-react';

interface PromptCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onApply: (content: string) => void;
}

export function PromptCard({
  id,
  title,
  content,
  category,
  onEdit,
  onDelete,
  onApply,
}: PromptCardProps) {
  const truncated =
    content.length > 120 ? content.slice(0, 120) + '...' : content;

  return (
    <div className="glass-card-sm p-4 flex flex-col gap-3 glass-card-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white truncate">{title}</h3>
        {category && (
          <Badge variant="secondary" className="shrink-0 bg-violet-500/20 text-violet-300">
            {category}
          </Badge>
        )}
      </div>

      <p className="text-sm text-white/50 flex-1 line-clamp-3">{truncated}</p>

      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <Button
          onClick={() => onApply(content)}
          size="sm"
          className="flex-1 gradient-bg text-white rounded-xl"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Применить
        </Button>
        <Button
          onClick={() => onEdit(id)}
          size="sm"
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/20 rounded-xl"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          onClick={() => onDelete(id)}
          size="sm"
          variant="destructive"
          className="rounded-xl"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
