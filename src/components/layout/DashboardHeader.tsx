// src/components/layout/DashboardHeader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import LanguageSwitcher from './LanguageSwitcher';

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  language: 'en' | 'es';
  userId?: string;
}

const translations = {
  en: {
    dashboard: 'My Courses',
    myCourses: 'My Courses',
    profile: 'Profile',
    certificates: 'Certificates',
    settings: 'Settings',
    signOut: 'Sign Out',
  },
  es: {
    dashboard: 'Mis Cursos',
    myCourses: 'Mis Cursos',
    profile: 'Perfil',
    certificates: 'Certificados',
    settings: 'Configuración',
    signOut: 'Cerrar Sesión',
  },
};

export default function DashboardHeader({
  userName,
  userEmail,
  userAvatar,
  language,
  userId,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = translations[language];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3">
          <Image
            src="/insarag-logo-blue.svg"
            alt="INSARAG"
            width={260}
            height={65}
            priority
            className="h-[72px] w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#0B4A7C]">
            {t.dashboard}
          </Link>
          <Link href="/certificates" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#0B4A7C]">
            {t.certificates}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* ── Language Switcher (functional!) ─────────────────────────── */}
          <div className="hidden sm:flex">
            <LanguageSwitcher
              currentLanguage={language}
              userId={userId}
              variant="dark"
            />
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-full p-1 transition hover:bg-gray-100"
            >
              {userAvatar ? (
                <Image src={userAvatar} alt={userName} width={36} height={36} className="rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B4A7C] text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="hidden text-sm font-medium text-gray-700 md:block">{userName}</span>
              <svg className={`hidden h-4 w-4 text-gray-500 transition md:block ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                <div className="border-b border-gray-100 px-4 pb-3 pt-1">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="truncate text-xs text-gray-500">{userEmail}</p>
                </div>

                {/* Mobile language switcher inside dropdown */}
                <div className="border-b border-gray-100 px-4 py-3 sm:hidden">
                  <LanguageSwitcher currentLanguage={language} userId={userId} variant="dark" />
                </div>

                <div className="py-1">
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    {t.dashboard}
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {t.profile}
                  </Link>
                  <Link href="/certificates" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    {t.certificates}
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {t.signOut}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileNavOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <Link href="/dashboard" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{t.dashboard}</Link>
          <Link href="/certificates" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{t.certificates}</Link>
          <Link href="/profile" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{t.profile}</Link>
        </nav>
      )}
    </header>
  );
}
