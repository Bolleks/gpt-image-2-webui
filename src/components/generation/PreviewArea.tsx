'use client';

interface PreviewAreaProps {
  imageUrl: string | null;
  status: string | null;
}

export function PreviewArea({ imageUrl }: PreviewAreaProps) {
  if (!imageUrl) {
    return null;
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
