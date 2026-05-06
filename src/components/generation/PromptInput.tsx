'use client';

import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
        Промпт
      </label>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
          className="w-full bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-primary-400/50 focus:ring-primary-400/20 resize-y rounded-xl pr-10"
          placeholder="Опиши изображение, которое хочешь создать..."
          maxLength={20000}
        />
        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
            title="Очистить"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-white/40 text-right">
        {value.length} / 20,000
      </p>
    </div>
  );
}
