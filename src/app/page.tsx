'use client';
import { useState } from 'react';

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

  const handleEmojiClick = async (mood: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setResponse(null);
      
      const response = await fetch('/api/send-feeling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.details || errorData.error || 'Failed to send feeling');
      }

      setResponse(data as WebhookResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <h1 className="title">😐 Feeling meh?</h1>
        
        <h2 className="text-[var(--candy-yellow)] text-xl text-center">
          Tap the Magic Button and get a mini mission to shake up your day.
        </h2>
        
        <button 
          className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] 
                    text-white font-semibold py-4 px-8 rounded-full shadow-lg 
                    hover:scale-105 transition-transform duration-200 ease-in-out
                    text-lg"
          onClick={() => handleEmojiClick('Bored')}
        >
          Release me from boredom
        </button>
        
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
              onClick={() => handleEmojiClick('Bored')}
            >
              Give me another!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
