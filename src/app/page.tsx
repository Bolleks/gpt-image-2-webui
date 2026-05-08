'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PromptInput } from '@/components/generation/PromptInput';
import { AspectRatioSelector } from '@/components/generation/AspectRatioSelector';
import { ResolutionSelector } from '@/components/generation/ResolutionSelector';
import { GenerateButton } from '@/components/generation/GenerateButton';
import { PreviewArea } from '@/components/generation/PreviewArea';
import { StatusBar } from '@/components/generation/StatusBar';
import { ImageUploadZone, UploadedFile } from '@/components/generation/ImageUploadZone';
import { useTaskPolling } from '@/hooks/useTaskPolling';
import { AspectRatio, Resolution } from '@/lib/types';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

function GenerationPageInner() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('auto');
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputUrls, setInputUrls] = useState<string[]>([]);
  const [uploadFiles, setUploadFiles] = useState<UploadedFile[]>([]);
  const [uploadZoneVisible, setUploadZoneVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { task, startPolling } = useTaskPolling();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (task?.status === 'success' || task?.status === 'fail' || task?.status === 'download_failed') {
      setIsGenerating(false);
    }
  }, [task?.status]);

  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    const urlAspectRatio = searchParams.get('aspectRatio') as AspectRatio | null;
    const urlResolution = searchParams.get('resolution') as Resolution | null;
    if (urlPrompt) setPrompt(urlPrompt);
    if (urlAspectRatio) setAspectRatio(urlAspectRatio);
    if (urlResolution) setResolution(urlResolution);
  }, [searchParams]);

  useEffect(() => {
    return () => {
      uploadFiles.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          resolution,
          inputUrls: inputUrls.length > 0 ? inputUrls : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Ошибка генерации');
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      startPolling(data.taskId);
    } catch {
      toast.error('Не удалось запустить генерацию');
      setIsGenerating(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Ошибка загрузки');
        return;
      }

      const data = await response.json();
      setInputUrls((prev) => [...prev, ...data.urls]);
      setUploadFiles((prev) => [
        ...prev,
        ...files.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    } catch {
      toast.error('Ошибка загрузки, попробуйте снова');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(uploadFiles[index].previewUrl);
    setInputUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-[560px] mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
          Создай изображение
        </h1>
        <p className="text-sm text-white/60">
          Опиши что ты хочешь увидеть, и AI создаст это за секунды
        </p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          disabled={isGenerating}
        />

        {!uploadZoneVisible && inputUrls.length === 0 && (
          <button
            onClick={() => setUploadZoneVisible(true)}
            disabled={isGenerating}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-400/80 disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            Добавить референсные изображения
          </button>
        )}

        {uploadZoneVisible && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
              Референсные изображения
            </label>
            <ImageUploadZone
              files={uploadFiles}
              onUpload={handleUpload}
              onRemove={handleRemoveFile}
              disabled={isGenerating}
              uploading={uploading}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AspectRatioSelector
          value={aspectRatio}
          onChange={(ar) => {
            setAspectRatio(ar);
            if (ar === '1:1' || ar === 'auto') {
              setResolution('1K');
            }
          }}
          disabled={isGenerating}
        />
        <ResolutionSelector
          value={resolution}
          onChange={setResolution}
          aspectRatio={aspectRatio}
          disabled={isGenerating}
        />
      </div>

      <GenerateButton
        onClick={handleGenerate}
        loading={isGenerating}
        disabled={!prompt.trim() || uploading}
        text={
          inputUrls.length > 0
            ? `Генерировать с ${inputUrls.length} изображением`
            : undefined
        }
      />

      <StatusBar status={task?.status ?? null} failMsg={task?.failMsg} />

      <PreviewArea
        imageUrl={task?.imageUrl ?? null}
        status={task?.status ?? null}
      />
    </div>
  );
}

export default function GenerationPage() {
  return (
    <Suspense fallback={null}>
      <GenerationPageInner />
    </Suspense>
  );
}