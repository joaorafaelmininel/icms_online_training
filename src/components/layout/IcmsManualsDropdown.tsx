'use client';

// src/components/layout/IcmsManualsDropdown.tsx
// Header nav item mirroring TrainingsDropdown — a button that opens a panel
// listing the ICMS manuals for direct download, instead of just linking to
// the landing page section.

import { useState, useRef, useEffect } from 'react';
import { icmsManuals } from '@/lib/data/icmsManuals';

interface IcmsManualsDropdownProps {
  language: 'en' | 'es';
  /** Rendered inside the trigger button; omit for the default text label. */
  className?: string;
}

export default function IcmsManualsDropdown({ language, className }: IcmsManualsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className ?? ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-1.5 rounded-lg px-4 py-2 text-base font-semibold uppercase text-[#0B4A7C] transition hover:bg-blue-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{language === 'en' ? 'ICMS3.0 Manuals' : 'Manuales ICMS3.0'}</span>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <div className="border-b border-gray-100 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {language === 'en' ? 'Official Documentation' : 'Documentación Oficial'}
              </p>
            </div>

            <div className="mt-2 space-y-1">
              {icmsManuals.map((manual) => (
                <a
                  key={manual.id}
                  href={manual.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 rounded-lg p-3 transition hover:bg-blue-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{manual.title[language]}</h3>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{manual.description[language]}</p>
                  </div>

                  <svg className="mt-1 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
