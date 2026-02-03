// src/lib/i18n/language.ts
// Internationalization helpers for EN/ES support
// ESTE ARQUIVO É SERVER-SIDE ONLY

import { cookies } from 'next/headers';
import type { Language, BilingualText } from '@/lib/types/database';

/**
 * Get current language from cookie (server-side ONLY)
 * Use this in Server Components
 */
export async function getCurrentLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('user_language');
  
  if (langCookie?.value === 'es') return 'es';
  if (langCookie?.value === 'en') return 'en';
  
  return 'en'; // Default fallback
}

/**
 * Translate a bilingual object to current language
 * Falls back to English if translation missing
 */
export function t(
  translations: BilingualText | null | undefined,
  language: Language
): string {
  if (!translations) return '';
  return translations[language] || translations.en || '';
}

/**
 * Translate a field from database JSONB
 * Handles null/undefined safely
 */
export function translateField<T>(
  field: { en: T; es: T } | null | undefined,
  language: Language
): T | null {
  if (!field) return null;
  return field[language] || field.en;
}

/**
 * Get opposite language (for toggle)
 */
export function getOppositeLanguage(language: Language): Language {
  return language === 'en' ? 'es' : 'en';
}

/**
 * Format language name
 */
export function getLanguageName(language: Language): string {
  return language === 'en' ? 'English' : 'Español';
}

/**
 * Get language flag emoji
 */
export function getLanguageFlag(language: Language): string {
  return language === 'en' ? '🇬🇧' : '🇪🇸';
}

/**
 * Validate language string
 */
export function isValidLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'es';
}
