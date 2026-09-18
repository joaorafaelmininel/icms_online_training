// src/components/layout/Header.tsx
// Main header component with INSARAG logo, trainings dropdown (right-aligned), and auth

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LanguageSwitcher from "./LanguageSwitcher";
import TrainingsDropdown from "./TrainingsDropdown";
import MobileHeaderMenu from "./MobileHeaderMenu";
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
    <header className="relative w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:gap-8 lg:px-6 lg:py-4">
        {/* Logo - Links to INSARAG.org */}
        <a
          href="https://www.insarag.org"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 transition hover:opacity-80"
          title="Visit INSARAG Official Website"
        >
          <Image
            src="/insarag-logo-blue.svg"
            alt="INSARAG - International Search and Rescue Advisory Group"
            width={310}
            height={152}
            priority
            className="h-12 w-auto lg:h-[100px]"
          />
        </a>

        {/* Center/Right - Trainings Dropdown + Manuals link (pushed right)
            — desktop only, folded into MobileHeaderMenu below `lg` */}
        <div className="hidden flex-1 items-center justify-end gap-2 lg:flex">
          <TrainingsDropdown language={preferredLanguage} />
          <Link
            href="/#icms-manuals"
            className="rounded-lg px-4 py-2 text-base font-semibold uppercase text-[#0B4A7C] transition hover:bg-blue-50"
          >
            {preferredLanguage === 'en' ? 'ICMS3.0 Manuals' : 'Manuales ICMS3.0'}
          </Link>
        </div>

        {/* Right side - Language & Auth — desktop only below `lg` */}
        <div className="hidden items-center gap-4 lg:flex">
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

        {/* Mobile: compact auth + hamburger for Trainings/Language */}
        <div className="flex flex-1 items-center justify-end gap-2 lg:hidden">
          {user ? (
            <UserMenuButton userId={user.id} language={preferredLanguage} compact />
          ) : (
            <Link
              href="/auth?tab=signin&redirectTo=/dashboard"
              className="rounded-lg bg-[#0B4A7C] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#083457]"
            >
              {t(auth.signIn, preferredLanguage)}
            </Link>
          )}
          <MobileHeaderMenu
            language={preferredLanguage}
            userId={user?.id}
            isLoggedIn={!!user}
            logoutLabel={t(auth.logout, preferredLanguage)}
          />
        </div>
      </div>
    </header>
  );
}

// User menu button. `compact` drops the display name and the standalone
// logout button (kept full-size for the mobile header row) — on mobile,
// logout is reached from the profile page instead.
async function UserMenuButton({
  userId,
  language,
  compact = false,
}: {
  userId: string;
  language: 'en' | 'es';
  compact?: boolean;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, first_name')
    .eq('id', userId)
    .single();

  const displayName = profile?.first_name || profile?.username || 'User';

  if (compact) {
    return (
      <Link
        href="/profile"
        className="flex items-center rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
        aria-label={displayName}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </Link>
    );
  }

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
