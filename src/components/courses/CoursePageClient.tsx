// src/components/courses/CoursePageClient.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { enrollInCourse } from '@/lib/actions/enrollment';
import type {
  Course,
  CourseModule,
  CourseEnrollment,
  UserModuleProgress,
} from '@/lib/types/courses';
import { getLocalized } from '@/lib/types/courses';

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════
type Lang = 'en' | 'es';

const i18n: Record<Lang, Record<string, string>> = {
  en: {
    backToDashboard: '← Back to Dashboard',
    modules: 'modules',
    hours: 'hours',
    difficulty: 'Difficulty',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    certificate: 'Certificate',
    certificateYes: 'Included',
    certificateNo: 'Not available',
    enrollNow: 'Enroll Now — Start Learning',
    enrolling: 'Enrolling...',
    continueLearning: 'Continue Learning',
    courseCompleted: 'Course Completed!',
    enrolled: 'Enrolled',
    inProgress: 'In Progress',
    completed: 'Completed',
    progress: 'Progress',
    about: 'About This Course',
    learningOutcomes: 'Learning Outcomes',
    requirements: 'Requirements',
    courseContent: 'Course Content',
    moduleLabel: 'Module',
    slides: 'slides',
    min: 'min',
    quiz: 'Quiz',
    quizRequired: 'Required',
    quizOptional: 'Optional',
    locked: 'Locked',
    lockedHint: 'Complete the previous module to unlock',
    current: 'Current',
    start: 'Start',
    resume: 'Resume',
    review: 'Review',
    completedLabel: 'Completed',
    finalExam: 'Final Exam',
    finalExamDesc: 'Complete all modules to unlock the final exam',
    finalExamReady: 'You\'re ready! Take the final exam to earn your certificate.',
    finalExamPassed: 'Passed!',
    takeExam: 'Take Final Exam',
    score: 'Score',
    notEnrolledTitle: 'Ready to start learning?',
    notEnrolledDesc: 'Enroll in this course to access all modules, quizzes, and earn your certificate upon completion.',
    viewCertificate: 'View Certificate',
    overallProgress: 'Overall Progress',
    modulesCompleted: 'modules completed',
  },
  es: {
    backToDashboard: '← Volver al Panel',
    modules: 'módulos',
    hours: 'horas',
    difficulty: 'Dificultad',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    certificate: 'Certificado',
    certificateYes: 'Incluido',
    certificateNo: 'No disponible',
    enrollNow: 'Inscribirse — Comenzar a Aprender',
    enrolling: 'Inscribiendo...',
    continueLearning: 'Continuar Aprendiendo',
    courseCompleted: '¡Curso Completado!',
    enrolled: 'Inscrito',
    inProgress: 'En Progreso',
    completed: 'Completado',
    progress: 'Progreso',
    about: 'Sobre Este Curso',
    learningOutcomes: 'Objetivos de Aprendizaje',
    requirements: 'Requisitos',
    courseContent: 'Contenido del Curso',
    moduleLabel: 'Módulo',
    slides: 'diapositivas',
    min: 'min',
    quiz: 'Quiz',
    quizRequired: 'Obligatorio',
    quizOptional: 'Opcional',
    locked: 'Bloqueado',
    lockedHint: 'Completa el módulo anterior para desbloquear',
    current: 'Actual',
    start: 'Comenzar',
    resume: 'Continuar',
    review: 'Revisar',
    completedLabel: 'Completado',
    finalExam: 'Examen Final',
    finalExamDesc: 'Completa todos los módulos para desbloquear el examen final',
    finalExamReady: '¡Estás listo! Realiza el examen final para obtener tu certificado.',
    finalExamPassed: '¡Aprobado!',
    takeExam: 'Tomar Examen Final',
    score: 'Puntuación',
    notEnrolledTitle: '¿Listo para empezar?',
    notEnrolledDesc: 'Inscríbete en este curso para acceder a todos los módulos, quizzes y obtener tu certificado al completarlo.',
    viewCertificate: 'Ver Certificado',
    overallProgress: 'Progreso General',
    modulesCompleted: 'módulos completados',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  course: Course;
  modules: CourseModule[];
  enrollment: CourseEnrollment | null;
  moduleProgress: UserModuleProgress[];
  language: Lang;
  courseSlug: string;
}

type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface ModuleWithStatus extends CourseModule {
  status: ModuleStatus;
  progress: UserModuleProgress | null;
  slidesDone: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CoursePageClient({
  course,
  modules,
  enrollment,
  moduleProgress,
  language,
  courseSlug,
}: Props) {
  const t = i18n[language];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';

  // ─── Compute module statuses ──────────────────────────────────────────────
  const modulesWithStatus: ModuleWithStatus[] = modules.map((mod, idx) => {
    const progress = moduleProgress.find((mp) => mp.module_id === mod.id) || null;

    let status: ModuleStatus = 'locked';

    if (!isEnrolled) {
      // Not enrolled — all locked (just show structure)
      status = 'locked';
    } else if (progress?.is_completed && (progress?.quiz_passed || !mod.quiz_required)) {
      // Completed: slides done + quiz passed (or no quiz required)
      status = 'completed';
    } else if (progress) {
      status = 'in_progress';
    } else if (idx === 0) {
      // First module is always available
      status = 'available';
    } else {
      // Check if previous module is completed
      const prevMod = modules[idx - 1];
      const prevProgress = moduleProgress.find((mp) => mp.module_id === prevMod.id);
      const prevCompleted = prevProgress?.is_completed && (prevProgress?.quiz_passed || !prevMod.quiz_required);
      if (prevCompleted) {
        status = 'available';
      }
    }

    const slidesDone = progress?.completed_slides?.length || 0;

    return { ...mod, status, progress, slidesDone };
  });

  const completedCount = modulesWithStatus.filter((m) => m.status === 'completed').length;
  const currentModule = modulesWithStatus.find(
    (m) => m.status === 'in_progress' || m.status === 'available'
  );
  const progressPct = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  // ─── Enroll handler ───────────────────────────────────────────────────────
  const handleEnroll = () => {
    setEnrollError(null);
    startTransition(async () => {
      const result = await enrollInCourse(course.id);
      if (result.success) {
        router.refresh();
      } else {
        setEnrollError(result.error || 'Failed to enroll');
      }
    });
  };

  // ─── Difficulty label ─────────────────────────────────────────────────────
  const difficultyLabel =
    course.difficulty_level === 'beginner' ? t.beginner :
    course.difficulty_level === 'intermediate' ? t.intermediate : t.advanced;

  const difficultyColor =
    course.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
    course.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#062a47] via-[#0B4A7C] to-[#083457]">
        {/* Background hero image */}
        <Image
          src="/usar-team-hero.png"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
          quality={85}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(11,74,124,0.85), rgba(8,52,87,0.65), rgba(6,42,71,0.85))',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center text-sm font-medium text-blue-200 transition hover:text-white"
          >
            {t.backToDashboard}
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Course info */}
            <div className="lg:col-span-2">
              {/* Status badge */}
              {isEnrolled && (
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-green-400/20 text-green-300'
                      : 'bg-blue-400/20 text-blue-300'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      isCompleted ? 'bg-green-400' : 'bg-blue-400 animate-pulse'
                    }`} />
                    {isCompleted ? t.completed : t.inProgress}
                  </span>
                </div>
              )}

              <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                {getLocalized(course.title, language)}
              </h1>

              {course.description && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-100/80">
                  {getLocalized(course.description, language)}
                </p>
              )}

              {/* Stats pills */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white">
                  <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  {modules.length} {t.modules}
                </span>
                {course.duration_hours && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white">
                    <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {course.duration_hours} {t.hours}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ${difficultyColor}`}>
                  {difficultyLabel}
                </span>
                {course.certificate_enabled && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/20 px-3.5 py-1.5 text-sm font-medium text-orange-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    {t.certificate}: {t.certificateYes}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Progress card or Enroll CTA */}
            <div className="flex items-end lg:justify-end">
              {isEnrolled ? (
                <div className="w-full rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:max-w-xs">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                    {t.overallProgress}
                  </p>
                  <div className="mb-1 flex items-end justify-between">
                    <span className="text-3xl font-extrabold text-white">{progressPct}%</span>
                    <span className="text-sm text-blue-200">
                      {completedCount}/{modules.length} {t.modulesCompleted}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  {currentModule && !isCompleted && (
                    <Link
                      href={`/courses/${courseSlug}/modules/${currentModule.module_number}`}
                      className="mt-4 block w-full rounded-lg bg-[#FF6B35] py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-[#E55A2B] hover:shadow-xl"
                    >
                      {t.continueLearning}
                    </Link>
                  )}
                  {isCompleted && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-300">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-bold">{t.courseCompleted}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:max-w-xs">
                  <p className="mb-2 text-sm font-semibold text-white">{t.notEnrolledTitle}</p>
                  <p className="mb-4 text-xs leading-relaxed text-blue-200/70">{t.notEnrolledDesc}</p>
                  {enrollError && (
                    <p className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-200">{enrollError}</p>
                  )}
                  <button
                    onClick={handleEnroll}
                    disabled={isPending}
                    className="w-full rounded-lg bg-[#FF6B35] py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#E55A2B] hover:shadow-xl disabled:opacity-60"
                  >
                    {isPending ? t.enrolling : t.enrollNow}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-3">

          {/* ── LEFT: About + Outcomes ────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-1">
            {/* About */}
            {course.description && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">{t.about}</h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  {getLocalized(course.description, language)}
                </p>
              </div>
            )}

            {/* Learning Outcomes */}
            {course.learning_outcomes && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">{t.learningOutcomes}</h2>
                <div className="space-y-2">
                  {getLocalized(course.learning_outcomes, language)
                    .split('\n')
                    .filter(Boolean)
                    .map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">{item.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">{t.requirements}</h2>
                <div className="space-y-2">
                  {getLocalized(course.requirements, language)
                    .split('\n')
                    .filter(Boolean)
                    .map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">{item.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Modules Timeline ───────────────────────────────────── */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              {t.courseContent}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({modules.length} {t.modules})
              </span>
            </h2>

            {/* Module list */}
            <div className="space-y-3">
              {modulesWithStatus.map((mod, idx) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  index={idx}
                  total={modules.length}
                  language={language}
                  courseSlug={courseSlug}
                  isEnrolled={isEnrolled}
                  t={t}
                />
              ))}

              {/* ── FINAL EXAM CARD ─────────────────────────────────────── */}
              <FinalExamCard
                enrollment={enrollment}
                allModulesComplete={completedCount === modules.length && modules.length > 0}
                language={language}
                courseSlug={courseSlug}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CARD
// ═══════════════════════════════════════════════════════════════════════════════
function ModuleCard({
  mod,
  index,
  total,
  language,
  courseSlug,
  isEnrolled,
  t,
}: {
  mod: ModuleWithStatus;
  index: number;
  total: number;
  language: Lang;
  courseSlug: string;
  isEnrolled: boolean;
  t: Record<string, string>;
}) {
  const isLocked = mod.status === 'locked';
  const isCompleted = mod.status === 'completed';
  const isCurrent = mod.status === 'in_progress' || mod.status === 'available';

  // Progress percentage for this module
  const slidePct =
    mod.progress && mod.total_slides > 0
      ? Math.round((mod.slidesDone / mod.total_slides) * 100)
      : 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all ${
        isCompleted
          ? 'border-green-200 bg-green-50/50'
          : isCurrent
            ? 'border-[#0B4A7C]/30 bg-white shadow-md ring-1 ring-[#0B4A7C]/10'
            : isLocked
              ? 'border-gray-200 bg-gray-50/80'
              : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        {/* Module number circle */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition ${
            isCompleted
              ? 'bg-green-500 text-white'
              : isCurrent
                ? 'bg-[#0B4A7C] text-white shadow-md'
                : isLocked
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isCompleted ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : isLocked ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            mod.module_number
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Status badge */}
              {isCurrent && isEnrolled && (
                <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-[#0B4A7C]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0B4A7C]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0B4A7C]" />
                  {t.current}
                </span>
              )}
              {isLocked && !isEnrolled && (
                <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t.locked}
                </span>
              )}
              {isLocked && isEnrolled && (
                <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  {t.locked}
                </span>
              )}

              {/* Title */}
              <h3 className={`text-sm font-bold sm:text-base ${
                isLocked ? 'text-gray-400' : 'text-gray-900'
              }`}>
                <span className="text-gray-400">{t.moduleLabel} {mod.module_number}:</span>{' '}
                {getLocalized(mod.title, language)}
              </h3>

              {/* Description */}
              {mod.description && (
                <p className={`mt-1 line-clamp-2 text-xs leading-relaxed sm:text-sm ${
                  isLocked ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {getLocalized(mod.description, language)}
                </p>
              )}

              {/* Meta row */}
              <div className={`mt-2.5 flex flex-wrap items-center gap-3 text-xs ${
                isLocked ? 'text-gray-300' : 'text-gray-400'
              }`}>
                {mod.total_slides > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    {mod.total_slides} {t.slides}
                  </span>
                )}
                {mod.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {mod.duration_minutes} {t.min}
                  </span>
                )}
                {mod.has_quiz && (
                  <span className={`flex items-center gap-1 font-medium ${
                    isLocked ? '' : mod.quiz_required ? 'text-orange-500' : 'text-blue-500'
                  }`}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    {t.quiz} ({mod.quiz_required ? t.quizRequired : t.quizOptional})
                    {mod.progress?.quiz_passed && (
                      <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </span>
                )}
              </div>

              {/* Progress bar (enrolled + in progress) */}
              {isCurrent && isEnrolled && mod.total_slides > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{mod.slidesDone}/{mod.total_slides} {t.slides}</span>
                    <span>{slidePct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#0B4A7C] transition-all duration-500"
                      style={{ width: `${slidePct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            {isEnrolled && !isLocked && (
              <Link
                href={`/courses/${courseSlug}/modules/${mod.module_number}`}
                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition sm:text-sm ${
                  isCompleted
                    ? 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                    : isCurrent
                      ? 'bg-[#FF6B35] text-white shadow-sm hover:bg-[#E55A2B]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isCompleted
                  ? t.review
                  : mod.progress
                    ? t.resume
                    : t.start}
              </Link>
            )}
          </div>

          {/* Locked hint */}
          {isLocked && isEnrolled && (
            <p className="mt-2 text-[11px] italic text-gray-300">
              {t.lockedHint}
            </p>
          )}
        </div>
      </div>

      {/* Current module left accent */}
      {isCurrent && isEnrolled && (
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#0B4A7C]" />
      )}

      {/* Completed module left accent */}
      {isCompleted && (
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-green-500" />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL EXAM CARD
// ═══════════════════════════════════════════════════════════════════════════════
function FinalExamCard({
  enrollment,
  allModulesComplete,
  language,
  courseSlug,
  t,
}: {
  enrollment: CourseEnrollment | null;
  allModulesComplete: boolean;
  language: Lang;
  courseSlug: string;
  t: Record<string, string>;
}) {
  if (!enrollment) return null;

  const unlocked = enrollment.final_exam_unlocked || allModulesComplete;
  const passed = enrollment.final_exam_passed;

  return (
    <div className={`mt-4 overflow-hidden rounded-xl border-2 border-dashed ${
      passed
        ? 'border-green-300 bg-green-50/50'
        : unlocked
          ? 'border-[#FF6B35]/40 bg-orange-50/30'
          : 'border-gray-200 bg-gray-50/50'
    }`}>
      <div className="flex items-center gap-4 p-5">
        {/* Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          passed
            ? 'bg-green-500 text-white'
            : unlocked
              ? 'bg-[#FF6B35] text-white'
              : 'bg-gray-200 text-gray-400'
        }`}>
          {passed ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`text-base font-bold ${
            passed ? 'text-green-700' : unlocked ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {t.finalExam}
            {passed && (
              <span className="ml-2 text-sm font-normal text-green-600">
                — {t.finalExamPassed} ({t.score}: {enrollment.final_exam_best_score}%)
              </span>
            )}
          </h3>
          <p className={`mt-0.5 text-sm ${
            unlocked ? 'text-gray-500' : 'text-gray-300'
          }`}>
            {passed ? t.courseCompleted : unlocked ? t.finalExamReady : t.finalExamDesc}
          </p>
        </div>

        {/* Action */}
        {unlocked && !passed && (
          <Link
            href={`/courses/${courseSlug}/final-exam`}
            className="shrink-0 rounded-lg bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#E55A2B] hover:shadow-md"
          >
            {t.takeExam}
          </Link>
        )}
        {passed && (
          <Link
            href={`/courses/${courseSlug}/certificate`}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-[#0B4A7C] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {t.viewCertificate}
          </Link>
        )}
      </div>
    </div>
  );
}
