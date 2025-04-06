'use client';
import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter } from 'next/navigation';

interface WebhookResponse {
  promptType: string;
  joyBurst: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default function Home() {
  const router = useRouter();
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { translations: t, languageCode, isLoading: isLoadingLanguage } = useLanguage();
  const [clickCount, setClickCount] = useState(0);

  const handleEmojiClick = async (mood: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setResponse(null);
      setClickCount(0); // Reset counter when initial button is clicked
      
      const response = await fetch('/api/send-feeling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood, lang: languageCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.details || errorData.error || t.errors.failedToSend);
      }

      setResponse(data as WebhookResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.errors.default;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnotherClick = async () => {
    if (clickCount >= 2) {
      router.push('/contact');
      return;
    }

    setIsLoading(true);
    setError(null);
    setClickCount(prev => prev + 1);

    try {
      const response = await fetch('/api/send-feeling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: 'Bored', lang: languageCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.details || errorData.error || t.errors.failedToSend);
      }

      setResponse(data as WebhookResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.errors.default;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {isLoadingLanguage ? (
          <div className="loading-animation">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        ) : (
          <>
            <h1 className="title">{t.title}</h1>
            
            <h2 className="text-[var(--candy-yellow)] text-xl text-center">
              {t.subtitle}
            </h2>
            
            {!response && (
              <button 
                className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] 
                        text-white font-semibold py-4 px-8 rounded-full shadow-lg 
                        hover:scale-105 transition-transform duration-200 ease-in-out
                        text-lg"
                onClick={() => handleEmojiClick('Bored')}
              >
                {t.mainButton}
              </button>
            )}
            
            {isLoading && (
              <div className="loading-animation">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            )}
            
            {error && (
              <div className="text-[var(--candy-pink)] text-lg text-center p-4 bg-white/5 rounded-lg">
                {error}
              </div>
            )}
            
            {response && (
              <div className="response-container">
                <div className="text-[var(--candy-yellow)] text-xl font-semibold mb-4">
                  {response.promptType}
                </div>
                <div className="text-white text-lg leading-relaxed mb-6">
                  {response.joyBurst}
                </div>
                <button 
                  className="bg-gradient-to-r from-[var(--candy-purple)] to-[var(--candy-blue)] 
                            text-white font-semibold py-3 px-6 rounded-full shadow-lg 
                            hover:scale-105 transition-transform duration-200 ease-in-out
                            text-base"
                  onClick={handleAnotherClick}
                >
                  {t.anotherButton}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
