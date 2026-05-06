'use client';

import { X, Download, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ImageModalProps {
  image: {
    id: string;
    prompt: string;
    aspectRatio: string;
    resolution: string;
    createdAt: Date | number;
    costTime: number | null;
    imageUrl: string;
  } | null;
  onClose: () => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: (prompt: string, aspectRatio: string, resolution: string) => void;
}

export function ImageModal({
  image,
  onClose,
  onDownload,
  onDelete,
  onRetry,
}: ImageModalProps) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Детали изображения</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <img
            src={image.imageUrl}
            alt="Generated"
            className="w-full rounded-xl"
          />
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Промпт</label>
              <p className="text-sm text-white mt-1">{image.prompt}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-white/10 text-white/80">
                {image.aspectRatio}
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white/80">
                {image.resolution}
              </Badge>
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Создано</label>
              <p className="text-sm text-white/80">{new Date(image.createdAt).toLocaleString()}</p>
            </div>
            {image.costTime && (
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Время генерации</label>
                <p className="text-sm text-white/80">{(image.costTime / 1000).toFixed(1)}с</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onDownload(image.id)}
                className="gradient-bg text-white rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Скачать
              </Button>
              <Button
                onClick={() => onRetry(image.prompt, image.aspectRatio, image.resolution)}
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Повторить
              </Button>
              <Button
                onClick={() => onDelete(image.id)}
                variant="destructive"
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
