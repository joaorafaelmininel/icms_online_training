// src/components/courses/FinalExamClient.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { submitFinalExam } from '@/lib/actions/finalExam';
import type {
  FinalExamClientQuestion,
  FinalExamResult,
  Lang,
  LocalizedText,
} from '@/lib/types/finalExam';

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const i18n = {
  en: {
    title: 'Final Exam',
    subtitle: 'ICMS 3.0 Certification Exam',
    description:
      'This exam covers all 10 modules of the ICMS 3.0 training course. You must score at least {score}% to pass and earn your certificate.',
    questions: 'Questions',
    passingLabel: 'Passing',
    attemptsLabel: 'Remaining',
    startExam: 'Start Final Exam',
    alreadyPassedTitle: '✅ Exam Already Passed!',
    alreadyPassedDesc:
      'You have already passed the final exam. Your certificate is ready for download.',
    bestScore: 'Best score',
    downloadCertificate: 'Download Certificate',
    backToCourse: 'Back to Course',
    question: 'Question',
    of: 'of',
    fromModule: 'Module {n}',
    prev: 'Previous',
    next: 'Next',
    submitExam: 'Submit Exam',
    submitting: 'Grading...',
    confirmTitle: 'Submit Final Exam?',
    confirmMsg:
      'Are you sure? Your answers are final and cannot be changed after submission.',
    confirmUnanswered: '{n} question(s) still unanswered.',
    cancel: 'Cancel',
    confirm: 'Submit',
    congratulations: '🎓 Congratulations!',
    examPassed:
      'You passed the ICMS 3.0 Final Exam and earned your certificate!',
    examFailed: 'Not Quite There Yet',
    tryAgain: 'Review the modules and try again. You can do it!',
    score: 'Score',
    points: '{e}/{t} points',
    explanation: 'Explanation',
    retakeExam: 'Retake Exam',
    maxReached: 'You have used all available attempts.',
    previousAttempts: 'Previous Attempts',
    passed: 'Passed',
    failed: 'Failed',
    examRules: 'Exam Rules',
    rule1: 'All questions are multiple choice with one correct answer.',
    rule2: 'Questions cover material from all 10 training modules.',
    rule3: 'You can navigate between questions before submitting.',
    rule4: 'Your answers are final once you submit the exam.',
    attemptsUsed: '{u} of {m} attempts used',
    noAttempts: 'No attempts remaining',
  },
  es: {
    title: 'Examen Final',
    subtitle: 'Examen de Certificación ICMS 3.0',
    description:
      'Este examen cubre los 10 módulos del curso ICMS 3.0. Debes obtener al menos {score}% para aprobar y obtener tu certificado.',
    questions: 'Preguntas',
    passingLabel: 'Mínimo',
    attemptsLabel: 'Restantes',
    startExam: 'Iniciar Examen Final',
    alreadyPassedTitle: '✅ ¡Examen Aprobado!',
    alreadyPassedDesc:
      'Ya has aprobado el examen final. Tu certificado está listo para descargar.',
    bestScore: 'Mejor puntuación',
    downloadCertificate: 'Descargar Certificado',
    backToCourse: 'Volver al Curso',
    question: 'Pregunta',
    of: 'de',
    fromModule: 'Módulo {n}',
    prev: 'Anterior',
    next: 'Siguiente',
    submitExam: 'Enviar Examen',
    submitting: 'Calificando...',
    confirmTitle: '¿Enviar Examen Final?',
    confirmMsg:
      '¿Estás seguro? Tus respuestas son definitivas y no podrás cambiarlas.',
    confirmUnanswered: '{n} pregunta(s) sin responder.',
    cancel: 'Cancelar',
    confirm: 'Enviar',
    congratulations: '🎓 ¡Felicitaciones!',
    examPassed:
      '¡Aprobaste el Examen Final de ICMS 3.0 y obtuviste tu certificado!',
    examFailed: 'Casi lo Logras',
    tryAgain: 'Revisa los módulos e inténtalo de nuevo. ¡Tú puedes!',
    score: 'Puntuación',
    points: '{e}/{t} puntos',
    explanation: 'Explicación',
    retakeExam: 'Reintentar Examen',
    maxReached: 'Has utilizado todos los intentos disponibles.',
    previousAttempts: 'Intentos Anteriores',
    passed: 'Aprobado',
    failed: 'Reprobado',
    examRules: 'Reglas del Examen',
    rule1: 'Todas las preguntas son de opción múltiple con una respuesta correcta.',
    rule2: 'Las preguntas cubren material de los 10 módulos de capacitación.',
    rule3: 'Puedes navegar entre preguntas antes de enviar.',
    rule4: 'Tus respuestas son definitivas una vez que envíes el examen.',
    attemptsUsed: '{u} de {m} intentos usados',
    noAttempts: 'No quedan intentos',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function loc(text: LocalizedText | null | undefined, lang: Lang): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return (text as any)[lang] || (text as any).en || '';
}

const LETTERS = ['A', 'B', 'C', 'D'];
const PASSING = 70;

// ═══════════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  course: { id: string; slug: string; title: any };
  enrollmentId: string;
  questions: FinalExamClientQuestion[];
  alreadyPassed: boolean;
  bestScore: number | null;
  attemptsTaken: number;
  attemptsRemaining: number;
  maxAttempts: number;
  canAttempt: boolean;
  certificateIssued: boolean;
  previousAttempts: {
    attempt_number: number;
    score: number;
    passed: boolean;
    completed_at: string;
  }[];
  language: Lang;
}

type Phase = 'intro' | 'exam' | 'results';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function FinalExamClient({
  course,
  enrollmentId,
  questions,
  alreadyPassed,
  bestScore,
  attemptsTaken,
  attemptsRemaining: initRemaining,
  maxAttempts,
  canAttempt: initCanAttempt,
  certificateIssued,
  previousAttempts,
  language,
}: Props) {
  const t = i18n[language];
  const totalQ = questions.length;

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<FinalExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canAttempt, setCanAttempt] = useState(initCanAttempt);
  const [remaining, setRemaining] = useState(initRemaining);
  const scrollRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;

  // Scroll top on phase/question change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase, currentQ]);

  // Keyboard nav
  useEffect(() => {
    if (phase !== 'exam') return;
    const handle = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
      if (e.key === 'ArrowRight') setCurrentQ((p) => Math.min(totalQ - 1, p + 1));
      if (e.key === 'ArrowLeft') setCurrentQ((p) => Math.max(0, p - 1));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase, totalQ]);

  const selectAnswer = useCallback((qId: string, optId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError(null);

    try {
      const res = await submitFinalExam(course.id, enrollmentId, answers);
      if (res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      if (res.result) {
        setResult(res.result);
        if (!res.result.passed) {
          setRemaining((p) => Math.max(0, p - 1));
          if (remaining <= 1) setCanAttempt(false);
        } else {
          setCanAttempt(false);
        }
        setPhase('results');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }, [answers, course.id, enrollmentId, remaining]);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setResult(null);
    setCurrentQ(0);
    setError(null);
    setPhase('intro');
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // INTRO
  // ═════════════════════════════════════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B4A7C]/10">
              <svg className="h-8 w-8 text-[#0B4A7C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{t.title}</h1>
            <p className="mt-1 text-sm font-semibold text-[#0B4A7C]">{t.subtitle}</p>
          </div>

          {/* Already passed */}
          {alreadyPassed && (
            <div className="mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center">
              <h3 className="text-lg font-bold text-green-800">{t.alreadyPassedTitle}</h3>
              <p className="mt-1 text-sm text-green-600">{t.alreadyPassedDesc}</p>
              {bestScore !== null && (
                <p className="mt-2 text-sm font-bold text-green-700">{t.bestScore}: {bestScore}%</p>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/courses/${course.slug}/certificate`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B4A7C] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  {t.downloadCertificate}
                </Link>
                <Link
                  href={`/courses/${course.slug}`}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  {t.backToCourse}
                </Link>
              </div>
            </div>
          )}

          {/* Exam info card */}
          {!alreadyPassed && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm leading-relaxed text-gray-600">
                {t.description.replace('{score}', String(PASSING))}
              </p>

              {/* Stats grid */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-black text-gray-900">{totalQ}</p>
                  <p className="text-[11px] font-medium text-gray-400">{t.questions}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-black text-[#0B4A7C]">{PASSING}%</p>
                  <p className="text-[11px] font-medium text-gray-400">{t.passingLabel}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className={`text-2xl font-black ${remaining > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {remaining}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400">{t.attemptsLabel}</p>
                </div>
              </div>

              {/* Rules */}
              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-blue-800">
                  {t.examRules}
                </h4>
                <ul className="space-y-1 text-xs leading-relaxed text-blue-700">
                  {[t.rule1, t.rule2, t.rule3, t.rule4].map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 text-blue-400">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attempts info */}
              {attemptsTaken > 0 && (
                <p className="mt-4 text-center text-xs text-gray-400">
                  {t.attemptsUsed.replace('{u}', String(attemptsTaken)).replace('{m}', String(maxAttempts))}
                </p>
              )}

              {/* Start */}
              <div className="mt-6 text-center">
                {canAttempt ? (
                  <button
                    onClick={() => setPhase('exam')}
                    className="rounded-lg bg-[#0B4A7C] px-10 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457] hover:shadow-md"
                  >
                    {t.startExam}
                  </button>
                ) : (
                  <p className="text-sm font-medium text-red-600">{t.maxReached}</p>
                )}
              </div>
            </div>
          )}

          {/* Previous attempts */}
          {previousAttempts.length > 0 && !alreadyPassed && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-gray-700">{t.previousAttempts}</h3>
              <div className="space-y-2">
                {previousAttempts.map((a) => (
                  <div key={a.attempt_number} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                    <span className="text-sm text-gray-600">#{a.attempt_number} — {a.score}%</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {a.passed ? t.passed : t.failed}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div className="mt-6 text-center">
            <Link href={`/courses/${course.slug}`} className="text-sm text-gray-400 transition hover:text-gray-600">
              ← {t.backToCourse}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // EXAM
  // ═════════════════════════════════════════════════════════════════════════
  if (phase === 'exam') {
    const q = questions[currentQ];
    const unanswered = totalQ - answeredCount;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div ref={scrollRef} className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-400">{t.title}</h2>
            <span className="rounded-full bg-[#0B4A7C]/10 px-3 py-1 text-xs font-bold text-[#0B4A7C]">
              {t.question} {currentQ + 1} {t.of} {totalQ}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#0B4A7C] transition-all duration-300"
              style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Question dots */}
          <div className="mb-6 flex flex-wrap justify-center gap-1.5">
            {questions.map((qq, i) => {
              const answered = !!answers[qq.id];
              const current = i === currentQ;
              return (
                <button
                  key={qq.id}
                  onClick={() => setCurrentQ(i)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    current
                      ? 'bg-[#0B4A7C] text-white shadow-md ring-2 ring-[#0B4A7C]/30'
                      : answered
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Question card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {q.source_module && (
              <span className="mb-3 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
                {t.fromModule.replace('{n}', String(q.source_module))}
              </span>
            )}
            <h3 className="text-lg font-bold leading-snug text-gray-900">
              {loc(q.question_text, language)}
            </h3>

            <div className="mt-5 space-y-2.5">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(q.id, opt.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all ${
                      selected
                        ? 'border-[#0B4A7C] bg-[#0B4A7C]/5 text-[#0B4A7C] shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      selected ? 'bg-[#0B4A7C] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {LETTERS[oi]}
                    </span>
                    <span className={selected ? 'font-medium' : ''}>
                      {loc(opt.text, language)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
              disabled={currentQ === 0}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
            >
              ← {t.prev}
            </button>

            {currentQ < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQ((p) => p + 1)}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                {t.next} →
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="rounded-lg bg-[#0B4A7C] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457] disabled:opacity-50"
              >
                {submitting ? t.submitting : t.submitExam}
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Confirm modal */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">{t.confirmTitle}</h3>
                <p className="mt-2 text-sm text-gray-600">{t.confirmMsg}</p>
                {unanswered > 0 && (
                  <p className="mt-2 text-sm font-semibold text-amber-600">
                    ⚠️ {t.confirmUnanswered.replace('{n}', String(unanswered))}
                  </p>
                )}
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-[#0B4A7C] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#083457] disabled:opacity-50"
                  >
                    {submitting ? t.submitting : t.confirm}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RESULTS
  // ═════════════════════════════════════════════════════════════════════════
  if (phase === 'results' && result) {
    const canRetake = !result.passed && canAttempt;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div ref={scrollRef} className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {/* ── Score hero ──────────────────────────────────────────────── */}
          <div className={`rounded-2xl p-8 text-center ${
            result.passed
              ? 'bg-gradient-to-b from-green-50 to-green-100/50'
              : 'bg-gradient-to-b from-red-50 to-red-100/40'
          }`}>
            {/* Circular score */}
            <div className="relative mx-auto mb-4 h-28 w-28">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={result.passed ? '#16a34a' : '#dc2626'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 327} 327`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-black ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
                  {result.score}%
                </span>
              </div>
            </div>

            {/* Badge icon */}
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
              result.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.passed ? (
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            <h2 className={`text-2xl font-extrabold ${result.passed ? 'text-green-800' : 'text-red-700'}`}>
              {result.passed ? t.congratulations : t.examFailed}
            </h2>
            <p className={`mt-1 text-sm ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
              {result.passed ? t.examPassed : t.tryAgain}
            </p>

            {/* Points pill */}
            <div className={`mt-4 inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${
              result.passed ? 'border-green-300 bg-white text-green-700' : 'border-red-300 bg-white text-red-600'
            }`}>
              {t.points.replace('{e}', String(result.earned_points)).replace('{t}', String(result.total_points))}
            </div>
          </div>

          {/* ── Certificate CTA ─────────────────────────────────────────── */}
          {result.passed && result.certificate_unlocked && (
            <div className="mt-6 rounded-xl border-2 border-[#0B4A7C]/20 bg-gradient-to-b from-[#0B4A7C]/5 to-white p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B4A7C]/10">
                <svg className="h-7 w-7 text-[#0B4A7C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0B4A7C]">
                🎓 {t.title} — {t.passed}!
              </h3>
              <p className="mt-1 text-sm text-[#0B4A7C]/70">
                {t.examPassed}
              </p>
              <Link
                href={`/courses/${course.slug}/certificate`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B4A7C] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457] hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {t.downloadCertificate}
              </Link>
            </div>
          )}

          {/* ── Question-by-question breakdown ──────────────────────────── */}
          <div className="mt-6 space-y-4">
            {result.questions.map((rq) => {
              const origQ = questions.find((q) => q.id === rq.question_id);
              if (!origQ) return null;

              return (
                <div
                  key={rq.question_id}
                  className={`rounded-xl border-2 p-5 ${
                    rq.is_correct
                      ? 'border-green-200 bg-green-50/40'
                      : 'border-red-200 bg-red-50/40'
                  }`}
                >
                  {/* Header */}
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">
                      {t.question} {rq.question_number}
                      {origQ.source_module && (
                        <span className="ml-2 text-gray-400">
                          ({t.fromModule.replace('{n}', String(origQ.source_module))})
                        </span>
                      )}
                    </span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      rq.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {rq.is_correct ? '✓' : '✗'}
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="text-sm font-semibold text-gray-800">
                    {loc(origQ.question_text, language)}
                  </p>

                  {/* Options review */}
                  <div className="mt-3 space-y-1.5">
                    {origQ.options.map((opt, oi) => {
                      const isSelected = rq.selected_answer === opt.id;
                      const isCorrect = rq.correct_answer === opt.id;

                      let cls = 'border-gray-100 bg-white text-gray-500';
                      if (isCorrect) cls = 'border-green-300 bg-green-50 text-green-800 font-medium';
                      if (isSelected && !isCorrect) cls = 'border-red-300 bg-red-50 text-red-700';

                      return (
                        <div key={opt.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${cls}`}>
                          <span className="font-bold">{LETTERS[oi]}</span>
                          <span className="flex-1">{loc(opt.text, language)}</span>
                          {isCorrect && <span className="text-green-600">✓</span>}
                          {isSelected && !isCorrect && <span className="text-red-500">✗</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation (only for wrong answers) */}
                  {!rq.is_correct && rq.explanation && (
                    <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                      <span className="font-bold">{t.explanation}:</span>{' '}
                      {loc(rq.explanation, language)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {canRetake && (
              <button
                onClick={handleRetake}
                className="rounded-lg bg-[#FF6B35] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#E55A2B]"
              >
                {t.retakeExam}
              </button>
            )}
            {!canRetake && !result.passed && (
              <p className="text-center text-sm font-medium text-red-500">{t.maxReached}</p>
            )}
            <Link
              href={`/courses/${course.slug}`}
              className="rounded-lg border border-gray-200 bg-white px-8 py-3 text-center text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              {t.backToCourse}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
