'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [step, setStep] = useState<'form' | 'seed'>('form');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        return;
      }

      setSeedPhrase(data.seedPhrase);
      setUserId(data.id);
      setStep('seed');
    } catch {
      setError('Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = async () => {
    setSignInLoading(true);
    try {
      const result = await signIn('credentials', {
        seedPhrase,
        redirect: false,
      });

      if (!result?.error) {
        router.push('/');
        router.refresh();
      }
    } catch {
      // Silently fail
    } finally {
      setSignInLoading(false);
    }
  };

  if (step === 'seed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold gradient-text">Ваша seed-фраза</h1>
            <p className="text-sm text-red-400 font-medium">
              Сохраните её! Она не будет показана снова.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              {seedPhrase.split(' ').map((word, i) => (
                <span
                  key={i}
                  className="bg-white/10 rounded-lg px-2.5 py-1 text-sm text-white/80"
                >
                  <span className="text-white/30 text-xs mr-1">{i + 1}.</span>
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-white/30 mb-1">Ваш ID</p>
            <p className="font-mono text-primary-400 tracking-wider">{userId}</p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full glass-card-sm py-2.5 text-sm hover:bg-white/10 transition-colors"
          >
            {copied ? 'Скопировано!' : 'Копировать seed-фразу'}
          </button>

          <button
            onClick={handleContinue}
            disabled={signInLoading}
            className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {signInLoading ? 'Вход...' : 'Я сохранил — продолжить'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Регистрация</h1>
          <p className="text-sm text-white/50">
            Будет сгенерирована уникальная seed-фраза из 12 слов. Она понадобится для входа.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-amber-400">
            Seed-фраза — это ваш пароль. Если вы её потеряете, восстановить доступ будет невозможно. Сохраните её в безопасном месте.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Создание...' : 'Создать аккаунт'}
        </button>

        <p className="text-center text-sm text-white/40">
          Уже есть аккаунт?{' '}
          <a href="/auth/signin" className="text-primary-400 hover:underline">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}