// src/components/modules/ModuleViewerClient.tsx
'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { markSlideViewed } from '@/lib/actions/slides';
import SlideRenderer from './SlideRenderer';
import type { Slide, ContentBlock } from '@/lib/types/slides';

type Lang = 'en' | 'es';

interface LocalizedField {
  en: string;
  es: string;
}

interface ModuleData {
  id: string;
  module_number: number;
  title: LocalizedField;
  total_slides: number;
  has_quiz: boolean;
  quiz_required: boolean;
}

interface Props {
  course: { id: string; slug: string; title: LocalizedField };
  module: ModuleData;
  allModules: {
    id: string;
    module_number: number;
    title: LocalizedField;
    total_slides: number;
    has_quiz: boolean;
    quiz_required: boolean;
  }[];
  slides: Slide[];
  completedSlides: number[];
  moduleProgress: { current_slide: number; is_completed: boolean; quiz_passed: boolean } | null;
  enrollmentId: string;
  language: Lang;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const i18n = {
  en: {
    backToCourse: 'Back to Course',
    module: 'Module',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    slideIndex: 'Slide Index',
    slides: 'slides',
    viewed: 'viewed',
    takeQuiz: 'Take Module Quiz',
    nextModule: 'Next Module',
    allViewed: 'All slides viewed!',
    quizReady: 'You have viewed all slides. Complete the quiz to finish this module.',
    noQuizDone: 'Module complete! Proceed to the next module.',
    quizLocked: 'View all slides to unlock the quiz',
    saving: 'Saving...',
    keyboard: '← → Navigate slides  ·  Esc Toggle sidebar',
    courseComplete: 'Course Complete!',
    courseCompleteDesc: 'You have completed all modules. Take the final quiz and head to the Final Exam!',
    courseCompleteQuizDone: 'All modules completed! Go to the Final Exam to earn your certificate.',
    goToFinalExam: 'Go to Final Exam',
    finishCourse: 'Back to Course Overview',
  },
  es: {
    backToCourse: 'Volver al Curso',
    module: 'Módulo',
    of: 'de',
    prev: 'Anterior',
    next: 'Siguiente',
    slideIndex: 'Índice de Diapositivas',
    slides: 'diapositivas',
    viewed: 'vistas',
    takeQuiz: 'Tomar Quiz del Módulo',
    nextModule: 'Siguiente Módulo',
    allViewed: '¡Todas las diapositivas vistas!',
    quizReady: 'Has visto todas las diapositivas. Completa el quiz para finalizar este módulo.',
    noQuizDone: '¡Módulo completo! Continúa al siguiente módulo.',
    quizLocked: 'Ve todas las diapositivas para desbloquear el quiz',
    saving: 'Guardando...',
    keyboard: '← → Navegar diapositivas  ·  Esc Barra lateral',
    courseComplete: '¡Curso Completado!',
    courseCompleteDesc: 'Has completado todos los módulos. ¡Toma el quiz final y dirígete al Examen Final!',
    courseCompleteQuizDone: '¡Todos los módulos completados! Ve al Examen Final para obtener tu certificado.',
    goToFinalExam: 'Ir al Examen Final',
    finishCourse: 'Volver al Curso',
  },
};

function loc(field: LocalizedField | null | undefined, lang: Lang): string {
  if (!field) return '';
  if (typeof field === 'string') {
    try {
      const p = JSON.parse(field);
      return p[lang] || p['en'] || '';
    } catch {
      return field;
    }
  }
  return field[lang] || field['en'] || '';
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ModuleViewerClient({
  course,
  module: mod,
  allModules,
  slides,
  completedSlides: initialCompleted,
  moduleProgress,
  enrollmentId,
  language,
}: Props) {
  const t = i18n[language];
  const [isPending, startTransition] = useTransition();

  // ─── State ──────────────────────────────────────────────────────────────────
  const resumeSlide = moduleProgress?.current_slide || 1;
  const [current, setCurrent] = useState(
    Math.min(Math.max(resumeSlide, 1), slides.length || 1)
  );
  const [completed, setCompleted] = useState<Set<number>>(new Set(initialCompleted));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const slideAreaRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const viewedCount = completed.size;
  const allViewed = viewedCount >= total;
  const pct = total > 0 ? Math.round((viewedCount / total) * 100) : 0;
  const currentSlide = slides.find((s) => s.slide_number === current) || null;
  const nextMod = allModules.find((m) => m.module_number === mod.module_number + 1);
  const isLastModule = !nextMod;
  const quizPassed = moduleProgress?.quiz_passed || false;

  // ─── Auto-mark current slide as viewed ──────────────────────────────────────
  useEffect(() => {
    if (!completed.has(current)) {
      setCompleted((prev) => new Set(prev).add(current));

      startTransition(async () => {
        await markSlideViewed(mod.id, course.id, enrollmentId, current, total);
      });
    }
    // Scroll to top of slide area
    slideAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const goTo = useCallback(
    (n: number) => {
      if (n >= 1 && n <= total) setCurrent(n);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
      if (e.key === 'Escape') setSidebarOpen((p) => !p);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-[100dvh] flex-col bg-gray-50">
      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <header className="z-40 flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:gap-4 sm:px-5 sm:py-2.5">
        {/* Back button */}
        <a
          href={`/courses/${course.slug}`}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 sm:px-3 sm:text-sm"
        >
          <ChevronLeftIcon />
          <span className="hidden sm:inline">{t.backToCourse}</span>
        </a>

        {/* Module title (center) */}
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-[#0B4A7C]/50 sm:text-xs">
            {t.module} {mod.module_number}
          </p>
          <h1 className="truncate text-xs font-bold text-gray-900 sm:text-sm">
            {loc(mod.title, language)}
          </h1>
        </div>

        {/* Right: progress + sidebar toggle */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Progress bar (desktop) */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0B4A7C] to-[#1a6db5] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] font-medium tabular-nums text-gray-400">
              {viewedCount}/{total}
            </span>
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label={t.slideIndex}
          >
            <SidebarIcon />
          </button>
        </div>
      </header>

      {/* ── BODY: SIDEBAR + CONTENT ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
        <aside
          className={`z-30 flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64 translate-x-0 lg:w-72' : 'w-0 -translate-x-full lg:w-0 lg:-translate-x-full'
          } overflow-hidden`}
        >
          <div className="flex h-full w-64 flex-col lg:w-72">
            {/* Sidebar header */}
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                {t.slideIndex}
              </h2>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0B4A7C] to-[#1a6db5] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium tabular-nums text-gray-400">
                  {pct}%
                </span>
              </div>
            </div>

            {/* Slide list */}
            <nav className="flex-1 overflow-y-auto py-1" aria-label="Slides">
              {slides.map((slide) => {
                const isActive = slide.slide_number === current;
                const isViewed = completed.has(slide.slide_number);
                const title = loc(slide.title, language);

                return (
                  <button
                    key={slide.id}
                    onClick={() => goTo(slide.slide_number)}
                    className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'border-r-2 border-[#0B4A7C] bg-[#0B4A7C]/[0.04]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Circle indicator */}
                    {isViewed && !isActive ? (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon className="h-3 w-3 text-green-600" />
                      </span>
                    ) : isActive ? (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B4A7C] shadow-sm">
                        <span className="text-[10px] font-bold text-white">
                          {slide.slide_number}
                        </span>
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200">
                        <span className="text-[10px] font-medium text-gray-400">
                          {slide.slide_number}
                        </span>
                      </span>
                    )}

                    {/* Title */}
                    <span
                      className={`line-clamp-2 text-xs leading-snug ${
                        isActive
                          ? 'font-semibold text-[#0B4A7C]'
                          : isViewed
                            ? 'text-gray-400'
                            : 'text-gray-600 group-hover:text-gray-800'
                      }`}
                    >
                      {title}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Quiz CTA in sidebar */}
            {mod.has_quiz && (
              <div className="border-t border-gray-100 p-3">
                {allViewed ? (
                  <a
                    href={`/courses/${course.slug}/modules/${mod.module_number}/quiz`}
                    onClick={(e) => { if (isPending) e.preventDefault(); }}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#e55a2b] ${isPending ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {isPending ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : (
                      <ClipboardIcon className="h-4 w-4" />
                    )}
                    {isPending ? t.saving || 'Saving...' : t.takeQuiz}
                  </a>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-400">
                    <LockIcon className="h-3.5 w-3.5" />
                    <span>{t.quizLocked}</span>
                  </div>
                )}
              </div>
            )}

            {/* Keyboard hints */}
            <div className="hidden border-t border-gray-50 px-4 py-2 lg:block">
              <p className="text-center text-[10px] text-gray-300">{t.keyboard}</p>
            </div>
          </div>
        </aside>

        {/* ── SLIDE CONTENT AREA ─────────────────────────────────────────────── */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* Scrollable slide content */}
          <div ref={slideAreaRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
              {currentSlide ? (
                <SlideRenderer
                  content={currentSlide.content as ContentBlock[]}
                  layout={currentSlide.layout}
                  language={language}
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-gray-400">
                  No slides available
                </div>
              )}

              {/* ── Completion CTA (on last slide when all viewed) ────────────── */}
              {allViewed && current === total && (
                <div className={`mt-10 rounded-xl border-2 border-dashed p-6 text-center sm:p-8 ${
                  isLastModule && quizPassed
                    ? 'border-[#0B4A7C]/30 bg-[#0B4A7C]/5'
                    : 'border-green-200 bg-green-50/60'
                }`}>
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                    isLastModule && quizPassed ? 'bg-[#0B4A7C]/10' : 'bg-green-100'
                  }`}>
                    {isLastModule && quizPassed ? (
                      <svg className="h-6 w-6 text-[#0B4A7C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    ) : (
                      <CheckIcon className="h-6 w-6 text-green-600" />
                    )}
                  </div>

                  {/* Title & description */}
                  <h3 className={`text-lg font-bold ${
                    isLastModule && quizPassed ? 'text-[#0B4A7C]' : 'text-green-800'
                  }`}>
                    {isLastModule && quizPassed ? t.courseComplete : t.allViewed}
                  </h3>
                  <p className={`mx-auto mt-1 max-w-md text-sm ${
                    isLastModule && quizPassed ? 'text-[#0B4A7C]/70' : 'text-green-600'
                  }`}>
                    {isLastModule
                      ? (quizPassed ? t.courseCompleteQuizDone : t.courseCompleteDesc)
                      : (mod.has_quiz ? t.quizReady : t.noQuizDone)
                    }
                  </p>

                  {/* Action buttons */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    {/* Take Quiz — show if quiz exists and not yet passed */}
                    {mod.has_quiz && !quizPassed && (
                      <a
                        href={`/courses/${course.slug}/modules/${mod.module_number}/quiz`}
                        onClick={(e) => { if (isPending) e.preventDefault(); }}
                        className={`rounded-lg bg-[#FF6B35] px-7 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e55a2b] ${isPending ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        {isPending ? (t.saving || 'Saving progress...') : t.takeQuiz}
                      </a>
                    )}

                    {/* Go to Final Exam — last module + quiz passed */}
                    {isLastModule && quizPassed && (
                      <a
                        href={`/courses/${course.slug}/final-exam`}
                        className="flex items-center gap-2 rounded-lg bg-[#0B4A7C] px-7 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457]"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        {t.goToFinalExam}
                      </a>
                    )}

                    {/* Next Module — not last module, no quiz or quiz passed */}
                    {!isLastModule && nextMod && (!mod.has_quiz || quizPassed) && (
                      <a
                        href={`/courses/${course.slug}/modules/${nextMod.module_number}`}
                        className="rounded-lg bg-[#0B4A7C] px-7 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457]"
                      >
                        {t.nextModule} →
                      </a>
                    )}

                    {/* Back to Course — always available as secondary */}
                    {isLastModule && (
                      <a
                        href={`/courses/${course.slug}`}
                        className="rounded-lg border border-gray-200 bg-white px-7 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50"
                      >
                        {t.finishCourse}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── BOTTOM NAV BAR ───────────────────────────────────────────────── */}
          <nav className="z-20 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2.5 sm:px-6 sm:py-3">
            {/* Previous */}
            <button
              onClick={goPrev}
              disabled={current <= 1}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeftIcon />
              <span className="hidden sm:inline">{t.prev}</span>
            </button>

            {/* Dots (mobile) / Counter (desktop) */}
            <div className="flex items-center gap-1">
              {/* Dot indicators for mobile */}
              <div className="flex items-center gap-[3px] sm:hidden">
                {slides.length <= 16 ? (
                  slides.map((s) => (
                    <button
                      key={s.slide_number}
                      onClick={() => goTo(s.slide_number)}
                      className={`h-1.5 rounded-full transition-all ${
                        s.slide_number === current
                          ? 'w-5 bg-[#0B4A7C]'
                          : completed.has(s.slide_number)
                            ? 'w-1.5 bg-green-400'
                            : 'w-1.5 bg-gray-200'
                      }`}
                    />
                  ))
                ) : (
                  <span className="text-xs font-medium tabular-nums text-gray-400">
                    {current} / {total}
                  </span>
                )}
              </div>
              {/* Counter for desktop */}
              <span className="hidden text-sm font-medium tabular-nums text-gray-500 sm:block">
                {current} {t.of} {total}
              </span>
            </div>

            {/* Next */}
            <button
              onClick={goNext}
              disabled={current >= total}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-30"
            >
              <span className="hidden sm:inline">{t.next}</span>
              <ChevronRightIcon />
            </button>
          </nav>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS (inline to avoid dependency)
// ═══════════════════════════════════════════════════════════════════════════════

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6h18M3 10h18M3 14h10M3 18h10" />
    </svg>
  );
}

function ClipboardIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function LockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
