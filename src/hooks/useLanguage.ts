// src/hooks/useLanguage.ts
// Client-side hook for language management

"use client";

import { useState, useEffect } from 'react';
import { getLanguageFromCookie } from '@/lib/i18n/language-client';
import type { Language, BilingualText } from '@/lib/types/database';

/**
 * Hook to get current language in client components
 * Reads from cookie on mount
 */
export function useLanguage(): Language {
  const [language, setLanguage] = useState<Language>('en');
  
  useEffect(() => {
    // Get language from cookie
    const lang = getLanguageFromCookie();
    setLanguage(lang);
    
    // Listen for language changes (from other tabs/windows)
    const handleStorageChange = () => {
      const newLang = getLanguageFromCookie();
      setLanguage(newLang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return language;
}

/**
 * Hook to get translation function in client components
 * Returns a function that can translate bilingual objects
 */
export function useTranslation() {
  const language = useLanguage();
  
  const t = (translations: BilingualText | null | undefined): string => {
    if (!translations) return '';
    return translations[language] || translations.en || '';
  };
  
  return { language, t };
}
