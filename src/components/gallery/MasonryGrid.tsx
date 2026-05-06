'use client';

import { ImageIcon } from 'lucide-react';

interface MasonryGridProps {
  images: {
    id: string;
    prompt: string;
    aspectRatio: string;
    resolution: string;
    createdAt: Date | number;
    costTime: number | null;
    imageUrl: string;
  }[];
  onImageClick: (image: {
    id: string;
    prompt: string;
    aspectRatio: string;
    resolution: string;
    createdAt: Date | number;
    costTime: number | null;
    imageUrl: string;
  }) => void;
}

export function MasonryGrid({ images, onImageClick }: MasonryGridProps) {
  if (images.length === 0) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center">
        <ImageIcon className="w-16 h-16 text-white/10 mb-4" />
        <p className="text-white/30">Изображений пока нет</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {images.map((image) => (
        <div
          key={image.id}
          onClick={() => onImageClick(image)}
          className="break-inside-avoid cursor-pointer group"
        >
          <div className="relative overflow-hidden rounded-xl glass-card-sm p-1 transition-all duration-200 hover:-translate-y-1">
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className="w-full rounded-lg"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end p-3 opacity-0 group-hover:opacity-100">
              <p className="text-white text-xs line-clamp-2">{image.prompt}</p>
            </div>
          </div>
          <div className="mt-2 px-1 flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40">
              {image.aspectRatio}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40">
              {image.resolution}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
