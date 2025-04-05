import { useState, useEffect } from 'react';
import { en } from '../translations/en';
import { fr } from '../translations/fr';

export type LanguageCode = 'ENG' | 'FR';

interface LanguageHook {
  translations: typeof en;
  languageCode: LanguageCode;
  isLoading: boolean;
}

export function useLanguage(): LanguageHook {
  const [translations, setTranslations] = useState(en);
  const [languageCode, setLanguageCode] = useState<LanguageCode>('ENG');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userLanguage = navigator.language.toLowerCase();
      if (userLanguage.startsWith('fr')) {
        setTranslations(fr);
        setLanguageCode('FR');
      }
    } catch {
      // If navigator.language is not available, fallback to English
      console.warn('Could not detect browser language, falling back to English');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { translations, languageCode, isLoading };
}
