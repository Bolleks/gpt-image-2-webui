'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';

interface PreviewAreaProps {
  imageUrl: string | null;
  status: string | null;
}

export function PreviewArea({ imageUrl, status }: PreviewAreaProps) {
  if (status === 'generating' || status === 'waiting' || status === 'queuing') {
    return (
      <div className="glass-card p-4">
        <Skeleton className="w-full aspect-square rounded-xl bg-white/5" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[200px]">
        <ImageIcon className="w-12 h-12 text-white/10 mb-3" />
        <p className="text-sm text-white/20">Здесь появится ваше изображение</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-2 overflow-hidden">
      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
        />
      </a>
    </div>
  );
}
