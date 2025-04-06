'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/utils/analytics';

type FormStep = 'series' | 'themes' | 'email';
type SeriesAnswer = 'yes' | 'maybe' | 'no';
type ThemeAnswer = 'creativity' | 'outdoor' | 'social' | 'routine' | 'brain' | 'curious';

interface FormData {
  email: string;
  seriesAnswer: SeriesAnswer | null;
  selectedThemes: ThemeAnswer[];
  lang: string;
  timestamp: string;
}

export default function Contact() {
  const { translations: t, languageCode } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('series');
  const [seriesAnswer, setSeriesAnswer] = useState<SeriesAnswer | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<ThemeAnswer[]>([]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSeriesAnswer = (answer: SeriesAnswer) => {
    trackEvent('series_interest', {
      event_category: 'user_preference',
      event_label: answer,
    });
    setSeriesAnswer(answer);
    setCurrentStep('themes');
    trackEvent('form_step_change', {
      event_category: 'engagement',
      event_label: `Step series to themes`,
    });
  };

  const handleThemeToggle = (theme: ThemeAnswer) => {
    trackEvent('theme_selection', {
      event_category: 'user_preference',
      event_label: theme,
    });
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleThemesSubmit = () => {
    if (selectedThemes.length > 0) {
      setCurrentStep('email');
      trackEvent('form_step_change', {
        event_category: 'engagement',
        event_label: `Step themes to email`,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'themes') {
      setCurrentStep('series');
      trackEvent('form_step_change', {
        event_category: 'engagement',
        event_label: `Step themes to series`,
      });
    } else if (currentStep === 'email') {
      setCurrentStep('themes');
      trackEvent('form_step_change', {
        event_category: 'engagement',
        event_label: `Step email to themes`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    trackEvent('form_submission', {
      event_category: 'form',
      event_label: 'contact_form',
    });

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('Contact webhook URL is not configured');
      }

      const formData: FormData = {
        email,
        seriesAnswer,
        selectedThemes,
        lang: languageCode,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStatus('success');
      trackEvent('form_success', {
        event_category: 'form',
        event_label: 'contact_form',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      trackEvent('form_error', {
        event_category: 'form',
        event_label: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-transparent bg-clip-text">
          {t.contact.title}
        </h1>

        {currentStep !== 'series' && (
          <button
            onClick={handleBack}
            className="self-start text-white/60 hover:text-white transition-colors"
          >
            {t.contact.backButton}
          </button>
        )}

        {currentStep === 'series' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-[var(--candy-yellow)] text-xl">
                {t.contact.seriesQuestion.title}
              </h2>
              <p className="text-white/80 whitespace-pre-line">
                {t.contact.seriesQuestion.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {(['yes', 'maybe', 'no'] as SeriesAnswer[]).map((answer) => (
                <button
                  key={answer}
                  onClick={() => handleSeriesAnswer(answer)}
                  className="w-full px-6 py-4 rounded-full bg-white/10 text-white
                           hover:bg-white/20 transition-colors text-left"
                >
                  {t.contact.seriesQuestion.options[answer]}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'themes' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-[var(--candy-yellow)] text-xl">
                {t.contact.themesQuestion.title}
              </h2>
              <p className="text-white/80">
                {t.contact.themesQuestion.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {Object.keys(t.contact.themesQuestion.options).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeToggle(theme as ThemeAnswer)}
                  className={`w-full px-6 py-4 rounded-full text-left transition-colors
                    ${selectedThemes.includes(theme as ThemeAnswer)
                      ? 'bg-[var(--candy-purple)] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {t.contact.themesQuestion.options[theme as keyof typeof t.contact.themesQuestion.options]}
                </button>
              ))}
            </div>

            <button
              onClick={handleThemesSubmit}
              disabled={selectedThemes.length === 0}
              className="w-full bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)]
                       text-white font-semibold py-4 px-8 rounded-full shadow-lg 
                       hover:scale-105 transition-all duration-200 ease-in-out
                       disabled:opacity-50 disabled:hover:scale-100"
            >
              {t.contact.themesQuestion.nextButton}
            </button>
          </div>
        )}

        {currentStep === 'email' && (
          <div className="w-full space-y-6">
            {status !== 'success' && (
              <div className="text-center space-y-2">
                <h2 className="text-[var(--candy-yellow)] text-xl">
                  {t.contact.emailQuestion.title}
                </h2>
                <p className="text-white/80">
                  {t.contact.emailQuestion.subtitle}
                </p>
              </div>
            )}

            {status !== 'success' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.contact.emailQuestion.placeholder}
                  required
                  className="w-full px-6 py-4 rounded-full bg-white/10 text-white 
                           placeholder-white/50 border-2 border-transparent 
                           focus:border-[var(--candy-purple)] outline-none
                           transition-colors"
                />

                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="w-full bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)]
                           text-white font-semibold py-4 px-8 rounded-full shadow-lg 
                           hover:scale-105 transition-all duration-200 ease-in-out
                           disabled:opacity-50 disabled:hover:scale-100"
                >
                  {status === 'loading' ? '...' : t.contact.emailQuestion.submitButton}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center animate-fade-in">
                <p className="text-[var(--candy-yellow)] text-lg whitespace-pre-line">
                  {t.contact.emailQuestion.success}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)]
                           text-white font-semibold py-4 px-8 rounded-full shadow-lg 
                           hover:scale-105 transition-all duration-200 ease-in-out"
                >
                  {t.contact.emailQuestion.backToHome}
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-[var(--candy-pink)] text-lg text-center animate-fade-in">
                {t.contact.emailQuestion.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
