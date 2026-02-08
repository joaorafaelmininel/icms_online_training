// src/components/dashboard/DashboardClient.tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { enrollInCourse } from '@/lib/actions/enrollment';
import { getLocalized } from '@/lib/types/courses';
import type { EnrolledCourseData, AvailableCourseData } from '@/lib/types/courses';

interface DashboardClientProps {
  firstName: string;
  language: 'en' | 'es';
  enrolledCourses: EnrolledCourseData[];
  availableCourses: AvailableCourseData[];
}

const t = {
  en: {
    welcomeBack: 'Welcome back,',
    welcomeSubtitle: 'Continue your training journey with INSARAG.',
    myEnrolledCourses: 'My Enrolled Courses',
    availableCourses: 'Available Courses',
    continueLearning: 'Continue Learning',
    viewCourse: 'View Course',
    enrollNow: 'Enroll Now',
    enrolling: 'Enrolling...',
    enrolled: 'Enrolled',
    comingSoon: 'Coming Soon',
    notifyMe: 'Notify Me',
    noEnrollments: "You haven't enrolled in any courses yet.",
    browseBelow: 'Browse available courses below to get started.',
    module: 'Module',
    modules: 'modules',
    hours: 'hours',
    minutes: 'min',
    completed: 'Completed',
    inProgress: 'In Progress',
    of: 'of',
    coursesEnrolled: 'Courses Enrolled',
    overallProgress: 'Overall Progress',
    modulesCompleted: 'Modules Completed',
  },
  es: {
    welcomeBack: 'Bienvenido de nuevo,',
    welcomeSubtitle: 'Continúa tu formación con INSARAG.',
    myEnrolledCourses: 'Mis Cursos Matriculados',
    availableCourses: 'Cursos Disponibles',
    continueLearning: 'Continuar Aprendizaje',
    viewCourse: 'Ver Curso',
    enrollNow: 'Inscribirse Ahora',
    enrolling: 'Inscribiendo...',
    enrolled: 'Inscrito',
    comingSoon: 'Próximamente',
    notifyMe: 'Notificarme',
    noEnrollments: 'Aún no te has inscrito en ningún curso.',
    browseBelow: 'Explora los cursos disponibles a continuación para comenzar.',
    module: 'Módulo',
    modules: 'módulos',
    hours: 'horas',
    minutes: 'min',
    completed: 'Completado',
    inProgress: 'En Progreso',
    of: 'de',
    coursesEnrolled: 'Cursos Inscritos',
    overallProgress: 'Progreso General',
    modulesCompleted: 'Módulos Completados',
  },
};

export default function DashboardClient({
  firstName,
  language,
  enrolledCourses,
  availableCourses,
}: DashboardClientProps) {
  const labels = t[language];
  const [isPending, startTransition] = useTransition();
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Quick stats
  const totalEnrolled = enrolledCourses.length;
  const totalModulesCompleted = enrolledCourses.reduce(
    (sum, ec) => sum + ec.completedModules,
    0
  );
  const avgProgress =
    totalEnrolled > 0
      ? Math.round(
          enrolledCourses.reduce(
            (sum, ec) => sum + ec.enrollment.progress_percentage,
            0
          ) / totalEnrolled
        )
      : 0;

  function handleEnroll(courseId: string) {
    setEnrollingCourseId(courseId);
    setEnrollError(null);
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      if (!result.success) {
        setEnrollError(result.error || 'Failed to enroll');
      }
      setEnrollingCourseId(null);
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* ═══════════════════════════════════════════ */}
      {/* WELCOME BANNER                              */}
      {/* ═══════════════════════════════════════════ */}
      <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B4A7C] via-[#0a5e9e] to-[#0B4A7C] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {labels.welcomeBack}{' '}
              <span className="text-blue-200">{firstName}!</span>
            </h1>
            <p className="mt-2 text-blue-100">{labels.welcomeSubtitle}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 sm:gap-6">
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur">
              <p className="text-2xl font-bold">{totalEnrolled}</p>
              <p className="text-xs text-blue-200">{labels.coursesEnrolled}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur">
              <p className="text-2xl font-bold">{avgProgress}%</p>
              <p className="text-xs text-blue-200">{labels.overallProgress}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur">
              <p className="text-2xl font-bold">{totalModulesCompleted}</p>
              <p className="text-xs text-blue-200">{labels.modulesCompleted}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ENROLLED COURSES                             */}
      {/* ═══════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          {labels.myEnrolledCourses}
        </h2>

        {enrolledCourses.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-600">{labels.noEnrollments}</p>
            <p className="mt-1 text-sm text-gray-400">{labels.browseBelow}</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {enrolledCourses.map((ec) => (
              <EnrolledCourseCard key={ec.enrollment.id} data={ec} language={language} labels={labels} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* AVAILABLE COURSES                            */}
      {/* ═══════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          {labels.availableCourses}
        </h2>

        {enrollError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {enrollError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {availableCourses.map((ac) => (
            <AvailableCourseCard
              key={ac.course.id}
              data={ac}
              language={language}
              labels={labels}
              onEnroll={handleEnroll}
              isEnrolling={enrollingCourseId === ac.course.id}
              isPending={isPending}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/* ENROLLED COURSE CARD                                                       */
/* ════════════════════════════════════════════════════════════════════════════ */

function EnrolledCourseCard({
  data,
  language,
  labels,
}: {
  data: EnrolledCourseData;
  language: 'en' | 'es';
  labels: (typeof t)['en'];
}) {
  const { enrollment, course, completedModules, totalModules } = data;
  const title = getLocalized(course.title, language);
  const progressPercent = enrollment.progress_percentage;
  const isCompleted = enrollment.status === 'completed';

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-[#0B4A7C]/30 hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Left color bar */}
        <div
          className={`hidden w-2 sm:block ${
            isCompleted
              ? 'bg-gradient-to-b from-green-400 to-green-600'
              : 'bg-gradient-to-b from-[#0B4A7C] to-[#083457]'
          }`}
        />

        <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Course info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {isCompleted && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  {labels.completed}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>
                {labels.module} {completedModules} {labels.of} {totalModules}
              </span>
              <span>·</span>
              <span>
                {course.duration_hours || '~'} {labels.hours}
              </span>
              <span>·</span>
              <span>{course.languages?.join(' / ').toUpperCase()}</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : 'bg-gradient-to-r from-[#0B4A7C] to-[#0a5e9e]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-700">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B4A7C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#083457] hover:shadow-md"
            >
              {isCompleted ? labels.viewCourse : labels.continueLearning}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/* AVAILABLE COURSE CARD                                                      */
/* ════════════════════════════════════════════════════════════════════════════ */

function AvailableCourseCard({
  data,
  language,
  labels,
  onEnroll,
  isEnrolling,
  isPending,
}: {
  data: AvailableCourseData;
  language: 'en' | 'es';
  labels: (typeof t)['en'];
  onEnroll: (courseId: string) => void;
  isEnrolling: boolean;
  isPending: boolean;
}) {
  const { course, modules, isEnrolled } = data;
  const title = getLocalized(course.title, language);
  const description = getLocalized(course.description, language);
  const isComingSoon = course.status === 'coming_soon';

  // Calcular duração a partir dos módulos
  const totalMinutes = modules.reduce(
    (sum, m) => sum + (m.duration_minutes || 0),
    0
  );
  const durationDisplay =
    course.duration_hours && course.duration_hours > 0
      ? `${course.duration_hours}h`
      : `${totalMinutes} ${labels.minutes}`;

  return (
    <div
      className={`group overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        isComingSoon
          ? 'border-gray-200 opacity-75'
          : 'border-gray-200 hover:border-[#0B4A7C]/30 hover:shadow-md'
      }`}
    >
      {/* Header accent bar */}
      <div
        className={`h-1.5 ${
          isComingSoon
            ? 'bg-gray-300'
            : 'bg-gradient-to-r from-[#0B4A7C] to-[#0a5e9e]'
        }`}
      />

      <div className="p-5">
        {/* Status badge */}
        <div className="mb-3 flex items-center justify-between">
          {isComingSoon ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {labels.comingSoon}
            </span>
          ) : isEnrolled ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              ✓ {labels.enrolled}
            </span>
          ) : (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0B4A7C]">
              {course.languages?.join(' / ').toUpperCase()}
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {durationDisplay}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {course.total_modules} {labels.modules}
          </span>
        </div>

        {/* Action */}
        <div className="mt-5">
          {isComingSoon ? (
            <button
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-400"
            >
              {labels.notifyMe}
            </button>
          ) : isEnrolled ? (
            <Link
              href={`/courses/${course.slug}`}
              className="block w-full rounded-lg bg-[#0B4A7C] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#083457]"
            >
              {labels.continueLearning}
            </Link>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              disabled={isEnrolling || isPending}
              className="w-full rounded-lg bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E55A2B] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEnrolling ? labels.enrolling : labels.enrollNow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
