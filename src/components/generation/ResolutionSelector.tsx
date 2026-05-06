'use client';

import { Resolution, AspectRatio } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OPTIONS: { value: Resolution; label: string }[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

interface ResolutionSelectorProps {
  value: Resolution;
  onChange: (value: Resolution) => void;
  aspectRatio: AspectRatio;
  disabled?: boolean;
}

export function ResolutionSelector({
  value,
  onChange,
  aspectRatio,
  disabled,
}: ResolutionSelectorProps) {
  const is4KDisabled = aspectRatio === '1:1' || aspectRatio === 'auto';

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
        Разрешение
      </label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as Resolution)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-white/[0.06] border-white/10 text-white rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10">
          {OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.value === '4K' && is4KDisabled}
              className="text-white/80 focus:bg-white/10 focus:text-white disabled:opacity-30"
            >
              {opt.label}
              {opt.value === '4K' && is4KDisabled && ' (недоступно)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {is4KDisabled && (
        <p className="text-xs text-white/30">
          4K недоступно при соотношении {aspectRatio === 'auto' ? 'авто' : '1:1'}
        </p>
      )}
    </div>
  );
}
