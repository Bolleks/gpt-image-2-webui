'use client';

import { useState, useEffect } from 'react';
import { ApiKeyInput } from '@/components/settings/ApiKeyInput';
import { useCredits } from '@/hooks/useCredits';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [webhookHmacKey, setWebhookHmacKey] = useState('');
  const [storagePath, setStoragePath] = useState('/data/images');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);
  const { credits } = useCredits();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.apiKey) setApiKey(data.apiKey);
        if (data.webhookHmacKey) setWebhookHmacKey(data.webhookHmacKey);
        setStoragePath(data.storagePath ?? '/data/images');
      })
      .catch(() => {});

    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) setUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          webhookHmacKey,
          storagePath,
        }),
      });
      if (response.ok) {
        setSaved(true);
        toast.success('Настройки сохранены');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      toast.error('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, credits: data.credits };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Connection failed' };
    }
  };

  const handleDeleteKey = async () => {
    try {
      const response = await fetch('/api/settings', { method: 'DELETE' });
      if (response.ok) {
        toast.success('API ключ удалён');
        return { success: true };
      }
      return { success: false, error: 'Не удалось удалить ключ' };
    } catch {
      return { success: false, error: 'Connection failed' };
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success('ID скопирован');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
        Настройки
      </h1>

      {userId && (
        <div className="glass-card-sm p-4 flex items-center gap-3">
          <div>
            <p className="text-xs text-white/40">Ваш ID (для поддержки)</p>
            <p className="font-mono text-sm text-white/70">{userId}</p>
          </div>
          <button
            onClick={copyUserId}
            className="ml-auto p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
          </button>
        </div>
      )}

      <div className="glass-card p-6 space-y-6">
        <ApiKeyInput
          value={apiKey}
          onChange={setApiKey}
          onTest={handleTest}
          onDelete={handleDeleteKey}
        />

        <div className="space-y-2">
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
            Webhook HMAC Key (опционально)
          </label>
          <Input
            type="password"
            value={webhookHmacKey}
            onChange={(e) => setWebhookHmacKey(e.target.value)}
            className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 rounded-xl"
            placeholder="Оставьте пустым для отключения проверки"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
            Путь хранения
          </label>
          <Input
            type="text"
            value={storagePath}
            onChange={(e) => setStoragePath(e.target.value)}
            className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 rounded-xl"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-white/60">
              Кредиты: <span className="font-semibold text-white">{credits ?? '...'}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-green-400">Сохранено!</span>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gradient-bg text-white rounded-xl"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}