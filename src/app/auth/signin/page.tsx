'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          seedPhrase: seedPhrase.trim(),
          callbackUrl: '/',
          json: 'true',
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError('Неверная seed-фраза');
        return;
      }

      router.push(data.url || '/');
      router.refresh();
    } catch {
      setError('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Вход</h1>
          <p className="text-sm text-white/50">
            Введите вашу seed-фразу из 12 слов
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            placeholder="Введите seed-фразу..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/50 resize-y"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !seedPhrase.trim()}
            className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          Нет аккаунта?{' '}
          <a href="/auth/signup" className="text-primary-400 hover:underline">
            Создать
          </a>
        </p>
      </div>
    </div>
  );
}