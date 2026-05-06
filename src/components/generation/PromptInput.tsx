'use client';

import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
        Промпт
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        className="w-full bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-primary-400/50 focus:ring-primary-400/20 resize-none rounded-xl"
        placeholder="Опиши изображение, которое хочешь создать..."
        maxLength={20000}
      />
      <p className="text-xs text-white/40 text-right">
        {value.length} / 20,000
      </p>
    </div>
  );
}
