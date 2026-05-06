'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PromptCard } from '@/components/prompts/PromptCard';
import { PromptModal } from '@/components/prompts/PromptModal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export default function PromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      const url = filterCategory
        ? `/api/prompts?category=${encodeURIComponent(filterCategory)}`
        : '/api/prompts';
      const res = await fetch(url);
      if (res.ok) {
        setPrompts(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const allCategories = [
    ...new Set(prompts.map((p) => p.category).filter(Boolean)),
  ];

  const handleSave = async (data: {
    title: string;
    content: string;
    category: string;
  }) => {
    try {
      const isEdit = !!editingPrompt;
      const res = await fetch('/api/prompts', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit ? { id: editingPrompt.id, ...data } : data
        ),
      });
      if (res.ok) {
        setModalOpen(false);
        setEditingPrompt(null);
        fetchPrompts();
        toast.success(isEdit ? 'Промпт обновлён' : 'Промпт добавлен');
      }
    } catch {
      toast.error('Не удалось сохранить промпт');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchPrompts();
        toast.success('Промпт удалён');
      }
    } catch {
      toast.error('Не удалось удалить промпт');
    }
  };

  const handleEdit = (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      setEditingPrompt(prompt);
      setModalOpen(true);
    }
  };

  const handleApply = (content: string) => {
    router.push(`/?prompt=${encodeURIComponent(content)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
          Библиотека промптов
        </h1>
        <Button
          onClick={() => {
            setEditingPrompt(null);
            setModalOpen(true);
          }}
          className="gradient-bg text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      {allCategories.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wide">
            Фильтр:
          </label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px] bg-white/[0.06] border-white/10 text-white rounded-xl">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="all" className="text-white/80 focus:bg-white/10 focus:text-white">
                Все категории
              </SelectItem>
              {allCategories.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="text-white/80 focus:bg-white/10 focus:text-white"
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/30 text-lg">Промптов пока нет</p>
          <p className="text-white/20 text-sm mt-1">
            Нажмите «Добавить», чтобы сохранить первый промпт
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              content={prompt.content}
              category={prompt.category}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      <PromptModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPrompt(null);
        }}
        onSave={handleSave}
        initialData={
          editingPrompt
            ? {
                title: editingPrompt.title,
                content: editingPrompt.content,
                category: editingPrompt.category,
              }
            : undefined
        }
        existingCategories={allCategories}
      />
    </div>
  );
}
