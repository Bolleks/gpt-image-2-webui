'use client';

import { AspectRatio } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: 'auto', label: 'Авто' },
  { value: '1:1', label: '1:1 (Квадрат)' },
  { value: '9:16', label: '9:16 (Портрет)' },
  { value: '16:9', label: '16:9 (Альбом)' },
  { value: '4:3', label: '4:3 (Стандарт)' },
  { value: '3:4', label: '3:4 (Портрет)' },
];

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
  disabled?: boolean;
}

export function AspectRatioSelector({
  value,
  onChange,
  disabled,
}: AspectRatioSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
        Соотношение сторон
      </label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as AspectRatio)}
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
              className="text-white/80 focus:bg-white/10 focus:text-white"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
