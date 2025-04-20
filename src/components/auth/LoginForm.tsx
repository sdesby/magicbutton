'use client';

import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const { translations: t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    setError(null);

    if (!email) {
      setError(t.auth.errors.emailRequired);
      return false;
    }

    if (!password) {
      setError(t.auth.errors.passwordRequired);
      return false;
    }

    return true;
  };

  // Add a type guard for objects with a message property
  function hasMessageProperty(obj: unknown): obj is { message: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'message' in obj &&
      typeof (obj as { message?: unknown }).message === 'string'
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else if (hasMessageProperty(error)) {
          setError(error.message);
        } else {
          setError(t.auth.errors.signInFailed);
        }
      } else {
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      }
    } catch (err) {
      setError(t.auth.errors.signInFailed);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="title mb-6">{t.auth.login.title}</h1>

      {error && (
        <div className="text-[var(--candy-pink)] text-lg text-center p-4 bg-white/5 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-white mb-1">
            {t.auth.login.email}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--candy-yellow)]"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-white mb-1">
            {t.auth.login.password}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--candy-yellow)]"
            disabled={isLoading}
          />
        </div>

        <div className="text-right">
          <a
            href="/auth/forgot-password"
            className="text-[var(--candy-yellow)] hover:underline text-sm"
          >
            {t.auth.login.forgotPassword}
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-lg"
        >
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
            </div>
          ) : (
            t.auth.login.submit
          )}
        </button>

        <div className="text-center text-white mt-4">
          <p>
            {t.auth.login.noAccount}{' '}
            <a
              href="/auth/register"
              className="text-[var(--candy-yellow)] hover:underline"
            >
              {t.auth.login.signUp}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
