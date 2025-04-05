'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export default function Contact() {
  const { translations: t, languageCode } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('Contact webhook URL is not configured');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          lang: languageCode // This will be 'FR' or 'ENG'
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setStatus('success');
      setEmail(''); // Clear the form on success
    } catch (error) {
      console.error('Error submitting email:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <h1 className="title">{t.contact.title}</h1>
        
        <h2 className="text-[var(--candy-yellow)] text-xl text-center">
          {t.contact.subtitle}
        </h2>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.contact.emailPlaceholder}
              required
              className="w-full px-6 py-4 rounded-full bg-white/10 text-white placeholder-white/50 
                         border-2 border-transparent focus:border-[var(--candy-purple)] outline-none
                         transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)]
                     text-white font-semibold py-4 px-8 rounded-full shadow-lg 
                     hover:scale-105 transition-all duration-200 ease-in-out
                     disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === 'loading' ? '...' : t.contact.submitButton}
          </button>
        </form>

        {status === 'success' && (
          <div className="text-[var(--candy-yellow)] text-lg text-center animate-fade-in">
            {t.contact.success}
          </div>
        )}

        {status === 'error' && (
          <div className="text-[var(--candy-pink)] text-lg text-center animate-fade-in">
            {t.contact.error}
          </div>
        )}
      </div>
    </div>
  );
}
