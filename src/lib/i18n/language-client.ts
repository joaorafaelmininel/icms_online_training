// src/lib/i18n/language-client.ts
// Client-side language utilities
// Use these in Client Components

import type { Language } from '@/lib/types/database';

/**
 * Set language cookie (client-side)
 */
export function setLanguageCookie(language: Language): void {
  if (typeof document === 'undefined') return;
  
  // Cookie expires in 1 year
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `user_language=${language}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Get language from cookie (client-side)
 */
export function getLanguageFromCookie(): Language {
  if (typeof document === 'undefined') return 'en';
  
  const match = document.cookie.match(/user_language=(\w+)/);
  const value = match?.[1];
  
  return (value === 'en' || value === 'es') ? value : 'en';
}

/**
 * Validate language string
 */
export function isValidLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'es';
}
