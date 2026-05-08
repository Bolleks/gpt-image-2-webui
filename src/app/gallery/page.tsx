'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MasonryGrid } from '@/components/gallery/MasonryGrid';
import { FilterBar } from '@/components/gallery/FilterBar';
import { SearchInput } from '@/components/gallery/SearchInput';
import { ImageModal } from '@/components/gallery/ImageModal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface GalleryImage {
  id: string;
  prompt: string;
  aspectRatio: string;
  resolution: string;
  createdAt: Date | number;
  costTime: number | null;
  imageUrl: string;
}

const PAGE_SIZE = 12;

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [search, setSearch] = useState('');
  const [filterAspectRatio, setFilterAspectRatio] = useState('');
  const [filterResolution, setFilterResolution] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const router = useRouter();

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks?page=all');
      if (response.ok) {
        const data = await response.json();
        const successful = data.tasks
          .filter((t: { status: string; localPath: string }) => t.status === 'success' && t.localPath)
          .map((t: { id: string; prompt: string; aspectRatio: string; resolution: string; createdAt: Date; costTime: number | null }) => ({
            ...t,
            imageUrl: `/api/images/${encodeURIComponent(t.id)}`,
          }));
        setImages(successful);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleRetry = (
    prompt: string,
    aspectRatio: string,
    resolution: string
  ) => {
    const params = new URLSearchParams({ prompt, aspectRatio, resolution });
    router.push(`/?${params.toString()}`);
  };

  const handleDownload = async (id: string) => {
    const a = document.createElement('a');
    a.href = `/api/download/${encodeURIComponent(id)}`;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setSelectedImage(null);
        toast.success('Изображение удалено');
      }
    } catch {
      toast.error('Не удалось удалить');
    }
  };

  useEffect(() => { setPage(1); }, [search, filterAspectRatio, filterResolution]);

  const filtered = images.filter((img) => {
    if (search && !img.prompt.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterAspectRatio && img.aspectRatio !== filterAspectRatio) return false;
    if (filterResolution && img.resolution !== filterResolution) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
        Галерея
      </h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <FilterBar
          aspectRatio={filterAspectRatio}
          onAspectRatioChange={setFilterAspectRatio}
          resolution={filterResolution}
          onResolutionChange={setFilterResolution}
        />
      </div>

      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <MasonryGrid images={paged} onImageClick={setSelectedImage} />
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="glass-card-sm px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                ←
              </button>
              <span className="text-white/50 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="glass-card-sm px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onRetry={handleRetry}
      />
    </div>
  );
}
