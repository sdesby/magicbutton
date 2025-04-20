'use client';

import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
  domainPreference?: string;
}

export default function RegisterForm({ domainPreference }: RegisterFormProps) {
  const { translations: t } = useLanguage();
  const { signUp } = useAuth();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(domainPreference);
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate'>('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = () => {
    setError(null);

    if (!firstName) {
      setError(t.auth.errors.firstNameRequired);
      return false;
    }

    if (!lastName) {
      setError(t.auth.errors.lastNameRequired);
      return false;
    }

    if (!email) {
      setError(t.auth.errors.emailRequired);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.auth.errors.emailInvalid);
      return false;
    }

    if (!password) {
      setError(t.auth.errors.passwordRequired);
      return false;
    }

    if (password.length < 6) {
      setError(t.auth.errors.passwordLength);
      return false;
    }

    if (password !== confirmPassword) {
      setError(t.auth.errors.passwordsDoNotMatch);
      return false;
    }

    if (!selectedDomain) {
      setError(t.auth.errors.domainRequired || 'Please select a domain.');
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
      const { error } = await signUp(email, password, firstName, lastName, selectedDomain, selectedLevel);

      if (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else if (hasMessageProperty(error)) {
          setError(error.message);
        } else {
          setError(t.auth.errors.signUpFailed);
        }
      } else {
        setSuccessMessage(t.auth.success.signUpSuccess);
        // Redirect to dashboard or confirmation page after successful signup
        setTimeout(() => {
          router.push('/auth/confirmation');
        }, 2000);
      }
    } catch (err) {
      setError(t.auth.errors.signUpFailed);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="title mb-2">{t.auth.register.title}</h1>
      <p className="text-[var(--candy-yellow)] text-xl text-center mb-6">
        {t.auth.register.subtitle}
      </p>

      {error && (
        <div className="text-[var(--candy-pink)] text-lg text-center p-4 bg-white/5 rounded-lg mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="text-[var(--candy-yellow)] text-lg text-center p-4 bg-white/5 rounded-lg mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-white mb-1">
            {t.auth.register.firstName}
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--candy-yellow)]"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-white mb-1">
            {t.auth.register.lastName}
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--candy-yellow)]"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-white mb-1">
            {t.auth.register.email}
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
            {t.auth.register.password}
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

        <div>
          <label htmlFor="confirmPassword" className="block text-white mb-1">
            {t.auth.register.confirmPassword}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--candy-yellow)]"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-white mb-2">
            Level
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSelectedLevel('Beginner')}
              className={`flex-1 p-3 rounded-lg text-center font-semibold ${selectedLevel === 'Beginner' ? 'bg-[var(--candy-yellow)] text-[var(--dark-bg)] border-2 border-[var(--candy-yellow)]' : 'bg-white/10 text-white hover:bg-white/15'}`}
              disabled={isLoading}
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('Intermediate')}
              className={`flex-1 p-3 rounded-lg text-center font-semibold ${selectedLevel === 'Intermediate' ? 'bg-[var(--candy-yellow)] text-[var(--dark-bg)] border-2 border-[var(--candy-yellow)]' : 'bg-white/10 text-white hover:bg-white/15'}`}
              disabled={isLoading}
            >
              Intermediate
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">
            {t.auth.register.selectDomain}
          </label>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setSelectedDomain('Drawing')}
              className={`p-3 rounded-lg text-left ${
                selectedDomain === 'Drawing'
                  ? 'bg-[var(--candy-pink)]/30 border border-[var(--candy-pink)]'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
              disabled={isLoading}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎨</span>
                <span className="text-white">{t.creativity.domains.drawing}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomain('Writing')}
              className={`p-3 rounded-lg text-left ${
                selectedDomain === 'Writing'
                  ? 'bg-[var(--candy-pink)]/30 border border-[var(--candy-pink)]'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
              disabled={isLoading}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">✍️</span>
                <span className="text-white">{t.creativity.domains.writing}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomain('Photography')}
              className={`p-3 rounded-lg text-left ${
                selectedDomain === 'Photography'
                  ? 'bg-[var(--candy-pink)]/30 border border-[var(--candy-pink)]'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
              disabled={isLoading}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">📸</span>
                <span className="text-white">{t.creativity.domains.photography}</span>
              </div>
            </button>
          </div>
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
            t.auth.register.submit
          )}
        </button>

        <div className="text-center text-white mt-4">
          <p>
            {t.auth.register.alreadyHaveAccount}{' '}
            <a
              href="/auth/login"
              className="text-[var(--candy-yellow)] hover:underline"
            >
              {t.auth.register.signIn}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
