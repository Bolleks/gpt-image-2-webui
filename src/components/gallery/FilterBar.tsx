'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  resolution: string;
  onResolutionChange: (value: string) => void;
}

export function FilterBar({
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
}: FilterBarProps) {
  return (
    <div className="flex gap-3">
      <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
        <SelectTrigger className="w-[160px] bg-white/[0.06] border-white/10 text-white rounded-xl">
          <SelectValue placeholder="Соотношение" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10">
          <SelectItem value="all" className="text-white/80 focus:bg-white/10 focus:text-white">Все</SelectItem>
          <SelectItem value="1:1" className="text-white/80 focus:bg-white/10 focus:text-white">1:1</SelectItem>
          <SelectItem value="9:16" className="text-white/80 focus:bg-white/10 focus:text-white">9:16</SelectItem>
          <SelectItem value="16:9" className="text-white/80 focus:bg-white/10 focus:text-white">16:9</SelectItem>
          <SelectItem value="4:3" className="text-white/80 focus:bg-white/10 focus:text-white">4:3</SelectItem>
          <SelectItem value="3:4" className="text-white/80 focus:bg-white/10 focus:text-white">3:4</SelectItem>
        </SelectContent>
      </Select>
      <Select value={resolution} onValueChange={onResolutionChange}>
        <SelectTrigger className="w-[140px] bg-white/[0.06] border-white/10 text-white rounded-xl">
          <SelectValue placeholder="Разрешение" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10">
          <SelectItem value="all" className="text-white/80 focus:bg-white/10 focus:text-white">Все</SelectItem>
          <SelectItem value="1K" className="text-white/80 focus:bg-white/10 focus:text-white">1K</SelectItem>
          <SelectItem value="2K" className="text-white/80 focus:bg-white/10 focus:text-white">2K</SelectItem>
          <SelectItem value="4K" className="text-white/80 focus:bg-white/10 focus:text-white">4K</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
