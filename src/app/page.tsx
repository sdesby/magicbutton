'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

interface WebhookResponse {
  promptType: string;
  joyBurst: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default function Home() {
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const { translations: t, languageCode, isLoading: isLoadingLanguage } = useLanguage();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !isLoadingAuth) {
      router.push('/dashboard');
    }
  }, [user, isLoadingAuth, router]);

  const handleChallengeClick = async (challenge: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setResponse(null);
      setSelectedChallenge(challenge);
      
      const response = await fetch('/api/send-feeling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challenge, lang: languageCode }),
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

  const handleMoreClick = () => {
    if (selectedChallenge === 'create') {
      router.push('/creativity-home');
    } else {
      router.push('/contact');
    }
  };

  // Optionally, you can show a loading state if desired
  if (isLoadingAuth || user) {
    return <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="animate-pulse">
        <p className="text-white">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* Auth Navigation */}
        <div className="absolute top-4 right-4 flex gap-4">
          {!isLoadingAuth && !user ? (
            <>
              <Link 
                href="/auth/login" 
                className="text-white hover:text-[var(--candy-yellow)] transition-colors"
              >
                {t.navLinks.signIn}
              </Link>
              <Link 
                href="/auth/register" 
                className="text-white hover:text-[var(--candy-yellow)] transition-colors"
              >
                {t.navLinks.signUp}
              </Link>
            </>
          ) : !isLoadingAuth && user ? (
            <Link 
              href="/dashboard" 
              className="text-[var(--candy-yellow)] hover:underline transition-colors"
            >
              {t.navLinks.dashboard}
            </Link>
          ) : null}
        </div>

        {isLoadingLanguage ? (
          <div className="loading-animation">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        ) : (
          <>
            <h1 className="title">{t.title}</h1>
            
            {/* Subtitle is only shown if there is no response */}
            {!response && (
              <h2 className="text-[var(--candy-yellow)] text-xl text-center">
                {t.subtitle}
              </h2>
            )}
            
            {!response && (
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-lg w-full"
                  onClick={() => handleChallengeClick('create')}
                >
                  {t.mainButtons.create}
                </button>
                <button
                  className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-lg w-full"
                  onClick={() => handleChallengeClick('move')}
                >
                  {t.mainButtons.move}
                </button>
                <button
                  className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-lg w-full"
                  onClick={() => handleChallengeClick('feel')}
                >
                  {t.mainButtons.feel}
                </button>
                <button
                  className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-lg w-full"
                  onClick={() => handleChallengeClick('think')}
                >
                  {t.mainButtons.think}
                </button>
              </div>
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
              <div className="response-container flex flex-col items-center">
                <div className="text-[var(--candy-yellow)] text-xl font-semibold mb-4">
                  {response.promptType}
                </div>
                <div className="text-white text-lg leading-relaxed mb-6">
                  {response.joyBurst}
                </div>
                <button
                  className="bg-gradient-to-r from-[var(--candy-purple)] to-[var(--candy-blue)] text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-base mx-auto"
                  onClick={handleMoreClick}
                >
                  {t.moreButton}
                </button>
              </div>
            )}
          </>
        )}
        
        {/* About link in footer */}
        <div className="mt-8 text-center text-white/70">
          <Link href="/about" className="hover:text-white transition-colors">
            {t.navLinks.about}
          </Link>
        </div>
      </div>
    </div>
  );
}
