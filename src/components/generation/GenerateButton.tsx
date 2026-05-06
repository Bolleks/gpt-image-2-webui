'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  text?: string;
}

export function GenerateButton({ onClick, loading, disabled, text }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-6 gradient-bg text-white font-semibold rounded-xl glow-primary hover:opacity-90 disabled:opacity-50 disabled:bg-white/10 disabled:shadow-none transition-all active:scale-[0.98]"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Генерация...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          {text || 'Сгенерировать изображение'}
        </>
      )}
    </Button>
  );
}
