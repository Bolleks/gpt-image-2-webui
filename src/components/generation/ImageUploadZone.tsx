'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

export interface UploadedFile {
  file: File;
  previewUrl: string;
}

interface ImageUploadZoneProps {
  files: UploadedFile[];
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  maxFiles?: number;
  uploading?: boolean;
}

export function ImageUploadZone({
  files,
  onUpload,
  onRemove,
  disabled,
  maxFiles = 3,
  uploading,
}: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (newFiles: File[]): File[] => {
      setError(null);
      const validFiles: File[] = [];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const maxSize = 10 * 1024 * 1024;

      if (files.length + newFiles.length > maxFiles) {
        setError(`Максимум ${maxFiles} изображений`);
        return [];
      }

      for (const file of newFiles) {
        if (!allowedTypes.includes(file.type)) {
          setError('Поддерживаются только PNG, JPG, WEBP');
          return [];
        }
        if (file.size > maxSize) {
          setError('Размер файла не более 10МБ');
          return [];
        }
        validFiles.push(file);
      }

      return validFiles;
    },
    [files.length, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || uploading) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    },
    [disabled, uploading, validateFiles, onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [validateFiles, onUpload]
  );

  return (
    <div className="space-y-3">
      {files.length < maxFiles && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled && !uploading) {
                fileInputRef.current?.click();
              }
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${isDragOver ? 'border-primary-400 bg-primary-400/10' : 'border-white/10 hover:border-white/20'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-white/60">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/60" />
              <span>Загрузка...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-white/30" />
              <p className="text-sm text-white/60">
                Перетащите изображения или <span className="text-primary-400">нажмите для выбора</span>
              </p>
              <p className="text-xs text-white/30">
                PNG, JPG, WEBP • Макс 10МБ • {files.length}/{maxFiles}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                <img
                  src={file.previewUrl}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => onRemove(index)}
                disabled={disabled || uploading}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center rounded-b-xl">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
