import { useState, useEffect } from 'react';
import { en } from '../translations/en';
import { fr } from '../translations/fr';

export type Translations = typeof en;

export function useLanguage() {
  const [languageState, setLanguageState] = useState({
    translations: en,
    languageCode: 'ENG',
    isLoading: true
  });

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    const isFrench = browserLang.startsWith('fr');
    
    setLanguageState({
      translations: isFrench ? fr : en,
      languageCode: isFrench ? 'FR' : 'ENG',
      isLoading: false
    });
  }, []);

  return languageState;
}
