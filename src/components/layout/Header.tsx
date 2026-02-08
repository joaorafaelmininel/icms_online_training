// src/components/layout/Header.tsx
// Main header component with INSARAG logo, trainings dropdown (right-aligned), and auth

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LanguageSwitcher from "./LanguageSwitcher";
import TrainingsDropdown from "./TrainingsDropdown";
import { getCurrentLanguage } from "@/lib/i18n/language";
import { auth } from "@/lib/i18n/translations";
import { t } from "@/lib/i18n/language";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get preferred language
  let preferredLanguage: 'en' | 'es' = 'en';
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('id', user.id)
      .single();
    
    preferredLanguage = profile?.preferred_language || 'en';
  } else {
    preferredLanguage = await getCurrentLanguage();
  }

  return (
    <header className="w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
        {/* Logo - Links to INSARAG.org */}
        <a 
          href="https://www.insarag.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition hover:opacity-80"
          title="Visit INSARAG Official Website"
        >
          <Image
            src="/insarag-logo-blue.svg"
            alt="INSARAG - International Search and Rescue Advisory Group"
            width={210}
            height={52}
            priority
            className="h-[68px] w-auto"
          />
        </a>

        {/* Center/Right - Trainings Dropdown (pushed right) */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <TrainingsDropdown language={preferredLanguage} />
        </div>

        {/* Right side - Language & Auth */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher 
            currentLanguage={preferredLanguage}
            userId={user?.id}
          />
          
          {/* Auth buttons or User menu */}
          {user ? (
            <UserMenuButton userId={user.id} language={preferredLanguage} />
          ) : (
            <Link
              href="/auth?tab=signin&redirectTo=/dashboard"
              className="rounded-lg bg-[#0B4A7C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083457]"
            >
              {t(auth.signInSignUp, preferredLanguage)}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// User menu button
async function UserMenuButton({ 
  userId, 
  language 
}: { 
  userId: string; 
  language: 'en' | 'es';
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, first_name')
    .eq('id', userId)
    .single();

  const displayName = profile?.first_name || profile?.username || 'User';

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{displayName}</span>
      </Link>
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          {t(auth.logout, language)}
        </button>
      </form>
    </div>
  );
}
