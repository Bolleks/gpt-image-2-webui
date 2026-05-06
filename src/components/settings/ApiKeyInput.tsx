'use client';

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  onTest: () => Promise<{ success: boolean; credits?: number; error?: string }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
}

export function ApiKeyInput({ value, onChange, onTest, onDelete }: ApiKeyInputProps) {
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTest();
    setTesting(false);
    setTestResult({
      success: result.success,
      message: result.success
        ? `Подключение успешно! Кредиты: ${result.credits}`
        : result.error || 'Ошибка подключения',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Удалить API ключ?')) return;
    setDeleting(true);
    const result = await onDelete();
    setDeleting(false);
    if (result.success) {
      onChange('');
      setTestResult(null);
    }
  };

  const masked = value ? '*'.repeat(Math.min(value.length, 32)) : '';

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
        API Key
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? 'text' : 'password'}
            value={show ? value : masked}
            onChange={(e) => onChange(e.target.value)}
            className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 rounded-xl pr-10"
            placeholder="Введите ваш KIE API ключ"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/60 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Button
          onClick={handleTest}
          disabled={testing || !value}
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/20 rounded-xl"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Тест'
          )}
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleting || !value}
          variant="secondary"
          className="bg-white/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
      {testResult && (
        <div className={`flex items-center gap-2 text-sm ${
          testResult.success ? 'text-green-400' : 'text-red-400'
        }`}>
          {testResult.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {testResult.message}
        </div>
      )}
    </div>
  );
}
