// src/components/layout/LanguageSwitcher.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Language = 'en' | 'es';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  userId?: string;
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({
  currentLanguage,
  userId,
  variant = 'dark',
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<Language>(currentLanguage);

  async function handleLanguageChange(newLang: Language) {
    if (newLang === language || isPending) return;

    setLanguage(newLang);
    document.cookie = `user_language=${newLang}; path=/; max-age=31536000; SameSite=Lax`;

    if (userId) {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase
          .from('profiles')
          .update({ preferred_language: newLang })
          .eq('id', userId);
      } catch (err) {
        console.error('Failed to update language preference:', err);
      }
    }

    startTransition(() => {
      router.refresh();
    });
  }

  const flags: { lang: Language; flag: string; label: string }[] = [
    { lang: 'en', flag: '/flag-gb.svg', label: 'EN' },
    { lang: 'es', flag: '/flag-es.svg', label: 'ES' },
  ];

  return (
    <div className="flex items-center gap-2">
      {flags.map(({ lang, flag, label }) => {
        const isActive = language === lang;

        const activeClass =
          variant === 'light'
            ? 'border-white/40 bg-white/15 text-white shadow-sm'
            : 'border-[#0B4A7C]/40 bg-[#0B4A7C]/10 text-[#0B4A7C] shadow-sm';

        const inactiveClass =
          variant === 'light'
            ? 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            : 'border-gray-200 bg-transparent text-gray-400 hover:border-gray-300 hover:text-gray-600';

        return (
          <button
            key={lang}
            type="button"
            onClick={() => handleLanguageChange(lang)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
              isActive ? activeClass : inactiveClass
            } ${isPending ? 'pointer-events-none opacity-60' : ''}`}
            title={lang === 'en' ? 'English' : 'Español'}
            aria-label={lang === 'en' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Image
              src={flag}
              alt={label}
              width={20}
              height={14}
              className="rounded-sm"
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
