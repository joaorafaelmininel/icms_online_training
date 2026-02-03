'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Training {
  id: string;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  href: string;
  available: boolean;
}

interface TrainingsDropdownProps {
  language: 'en' | 'es';
}

// Lista de treinamentos disponíveis
const trainings: Training[] = [
  {
    id: 'icms-3-0',
    title: {
      en: 'ICMS 3.0 Training',
      es: 'Capacitación ICMS 3.0',
    },
    description: {
      en: 'Coordination and Management System',
      es: 'Sistema de Coordinación y Gestión',
    },
    href: '/courses/icms-3-0',
    available: true,
  },
  // Adicione mais treinamentos aqui no futuro
];

export default function TrainingsDropdown({ language }: TrainingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
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

  // Fechar ao pressionar Escape
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
    <div className="relative" ref={dropdownRef}>
      {/* Botão Trainings - MAIÚSCULO, AZUL INSARAG E MAIOR */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-base font-semibold uppercase text-[#0B4A7C] transition hover:bg-blue-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{language === 'en' ? 'Trainings' : 'Capacitaciones'}</span>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            {/* Header do dropdown */}
            <div className="border-b border-gray-100 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {language === 'en' ? 'Available Trainings' : 'Capacitaciones Disponibles'}
              </p>
            </div>

            {/* Lista de treinamentos */}
            <div className="mt-2 space-y-1">
              {trainings.map((training) => (
                <div key={training.id}>
                  {training.available ? (
                    <Link
                      href={training.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 rounded-lg p-3 transition hover:bg-blue-50"
                    >
                      {/* Ícone */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {training.title[language]}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-600">
                          {training.description[language]}
                        </p>
                      </div>

                      {/* Seta */}
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 rounded-lg p-3 opacity-60">
                      {/* Ícone (disabled) */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-500">
                          {training.title[language]}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {language === 'en' ? 'Coming Soon' : 'Próximamente'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer (opcional) */}
            <div className="mt-2 border-t border-gray-100 pt-2">
              <Link
                href="/courses"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg p-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
              >
                {language === 'en' ? 'View All Courses' : 'Ver Todos los Cursos'}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
