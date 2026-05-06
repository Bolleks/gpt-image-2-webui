'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; category: string }) => void;
  initialData?: { title: string; content: string; category: string };
  existingCategories: string[];
}

export function PromptModal({
  open,
  onClose,
  onSave,
  initialData,
  existingCategories,
}: PromptModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? '');
      setContent(initialData?.content ?? '');
      setCategory(initialData?.category ?? '');
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title, content, category });
  };

  const uniqueCategories = [...new Set(existingCategories.filter(Boolean))];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass-card shadow-2xl shadow-black/50 w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-4">
          {initialData ? 'Редактировать промпт' : 'Добавить промпт'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
              Название
            </label>
            <Input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 rounded-xl"
              placeholder="Название промпта"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
              Промпт
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 resize-none rounded-xl"
              placeholder="Текст промпта..."
              maxLength={20000}
              required
            />
            <p className="text-xs text-white/40 text-right">
              {content.length} / 20,000
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
              Категория
            </label>
            <Input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="category-suggestions"
              className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 rounded-xl"
              placeholder="Например: портрет, пейзаж"
            />
            <datalist id="category-suggestions">
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="bg-white/10 text-white hover:bg-white/20 rounded-xl"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="gradient-bg text-white rounded-xl"
            >
              {initialData ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
