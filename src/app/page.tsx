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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <h1 className="title">How do you feel today?</h1>
        
        <div className="emoji-container">
          <button 
            className="emoji" 
            role="button"
            aria-label="I'm feeling bored"
            onClick={() => handleEmojiClick('Bored')}
          >😐</button>
          <button 
            className="emoji" 
            role="button"
            aria-label="I'm feeling anxious"
            onClick={() => handleEmojiClick('Anxious')}
          >😰</button>
          <button 
            className="emoji" 
            role="button"
            aria-label="I'm feeling sad"
            onClick={() => handleEmojiClick('Sad')}
          >🥺</button>
        </div>
        
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
            <div className="text-white text-lg leading-relaxed">
              {response.joyBurst}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
