// src/components/layout/LanguageSwitcher.tsx
// Language switcher component - EN/ES toggle

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { setLanguageCookie } from "@/lib/i18n/language-client";
import type { Language } from "@/lib/types/database";

interface LanguageSwitcherProps {
  currentLanguage: Language;
  userId?: string; // If user is logged in
}

export default function LanguageSwitcher({ 
  currentLanguage, 
  userId 
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<Language>(currentLanguage);

  async function handleLanguageChange(newLang: Language) {
    if (newLang === language) return; // Already selected
    
    setLanguage(newLang);

    if (userId) {
      // User is logged in → update in database
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ preferred_language: newLang })
        .eq('id', userId);
    }
    
    // Always set cookie (for faster loading)
    setLanguageCookie(newLang);

    // Refresh page to apply language
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* English Button */}
      <button
        type="button"
        onClick={() => handleLanguageChange('en')}
        disabled={isPending}
        className={`rounded-sm ring-1 transition px-2 py-1 ${
          language === 'en'
            ? 'ring-blue-600 bg-blue-50'
            : 'ring-black/10 hover:ring-black/20'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="English"
        aria-label="Switch to English"
      >
        <Image 
          src="/flag-gb.svg" 
          alt="EN" 
          width={22} 
          height={16}
          className={isPending ? 'opacity-50' : ''}
        />
      </button>

      {/* Spanish Button */}
      <button
        type="button"
        onClick={() => handleLanguageChange('es')}
        disabled={isPending}
        className={`rounded-sm ring-1 transition px-2 py-1 ${
          language === 'es'
            ? 'ring-blue-600 bg-blue-50'
            : 'ring-black/10 hover:ring-black/20'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Español"
        aria-label="Cambiar a Español"
      >
        <Image 
          src="/flag-es.svg" 
          alt="ES" 
          width={22} 
          height={16}
          className={isPending ? 'opacity-50' : ''}
        />
      </button>
    </div>
  );
}
