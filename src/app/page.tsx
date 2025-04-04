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
      console.error('Error sending feeling:', error);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen items-center justify-items-center p-8 bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-12">
        <h1 className="neon-text">How do you feel today?</h1>
        <div className="emoji-container">
          <span 
            className="emoji" 
            role="img" 
            aria-label="neutral face"
            onClick={() => handleEmojiClick('Bored')}
          >😐</span>
          <span className="emoji" role="img" aria-label="anxious face" onClick={() => handleEmojiClick('Anxious')}>😰</span>
          <span className="emoji" role="img" aria-label="pleading face" onClick={() => handleEmojiClick('Sad')}>🥺</span>
        </div>
        
        {isLoading && (
          <div className="text-white text-xl animate-pulse">
            Processing your feeling...
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-lg text-center max-w-md">
            {error}
          </div>
        )}
        
        {response && (
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="text-[var(--neon-blue)] text-xl font-semibold">
              {response.promptType}
            </div>
            <div className="text-white text-lg">
              {response.joyBurst}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
