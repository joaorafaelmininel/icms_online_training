'use client';

// src/components/layout/MobileHeaderMenu.tsx
// Hamburger toggle for the header's secondary controls (Trainings dropdown,
// language switcher) below the `lg` breakpoint, where they no longer fit
// alongside the logo and sign-in button on a phone-width screen.

import { useState } from 'react';
import TrainingsDropdown from './TrainingsDropdown';
import IcmsManualsDropdown from './IcmsManualsDropdown';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileHeaderMenuProps {
  language: 'en' | 'es';
  userId?: string;
  isLoggedIn?: boolean;
  logoutLabel?: string;
}

export default function MobileHeaderMenu({ language, userId, isLoggedIn, logoutLabel }: MobileHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-lg p-2 text-[#0B4A7C] transition hover:bg-blue-50"
        aria-expanded={isOpen}
        aria-label={language === 'en' ? 'Open menu' : 'Abrir menú'}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-gray-100 bg-white px-4 py-4 shadow-lg">
          <div className="flex flex-col gap-3">
            <TrainingsDropdown language={language} />
            <IcmsManualsDropdown language={language} />
            <LanguageSwitcher currentLanguage={language} userId={userId} />
            {isLoggedIn && (
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {logoutLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
