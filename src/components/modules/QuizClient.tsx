// src/components/modules/QuizClient.tsx
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { submitQuiz } from '@/lib/actions/quiz';
import type { QuizClientQuestion, QuizResult, QuestionResult } from '@/lib/types/quiz';
import type { LocalizedText } from '@/lib/types/courses';

type Lang = 'en' | 'es';

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const i18n: Record<Lang, Record<string, string>> = {
  en: {
    backToModule: '← Back to Module',
    quizTitle: 'Module Quiz',
    instructions: 'Instructions',
    instructionsText: 'Answer all questions below. You need {score}% to pass.',
    questionsCount: '{n} questions',
    passingScore: 'Passing score: {score}%',
    attemptsRemaining: '{n} attempts remaining',
    unlimitedAttempts: 'Unlimited attempts',
    noAttemptsLeft: 'No attempts remaining',
    alreadyPassed: 'You have already passed this quiz!',
    bestScoreLabel: 'Best Score',
    startQuiz: 'Start Quiz',
    reviewResults: 'Review Last Results',
    question: 'Question',
    of: 'of',
    selectAnswer: 'Select your answer',
    next: 'Next',
    previous: 'Previous',
    submitQuiz: 'Submit Quiz',
    submitting: 'Submitting...',
    confirmSubmit: 'Are you sure? You cannot change your answers after submitting.',
    unanswered: '{n} question(s) unanswered',
    // Results
    congratulations: 'Congratulations!',
    quizPassed: 'You passed the quiz!',
    quizFailed: 'Not quite there yet',
    tryAgain: 'Review the module content and try again.',
    yourScore: 'Your Score',
    correct: 'correct',
    incorrect: 'incorrect',
    attempt: 'Attempt',
    pointsEarned: '{earned}/{total} points',
    explanation: 'Explanation',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    retakeQuiz: 'Retake Quiz',
    backToCourse: 'Back to Course',
    nextModule: 'Next Module',
    goToFinalExam: 'Go to Final Exam',
    courseCompleteQuiz: 'All modules completed! Proceed to the Final Exam to earn your certificate.',
    previousAttempts: 'Previous Attempts',
    passed: 'Passed',
    failed: 'Failed',
    maxAttemptsReached: 'You have used all available attempts.',
  },
  es: {
    backToModule: '← Volver al Módulo',
    quizTitle: 'Quiz del Módulo',
    instructions: 'Instrucciones',
    instructionsText: 'Responde todas las preguntas a continuación. Necesitas {score}% para aprobar.',
    questionsCount: '{n} preguntas',
    passingScore: 'Puntuación para aprobar: {score}%',
    attemptsRemaining: '{n} intentos restantes',
    unlimitedAttempts: 'Intentos ilimitados',
    noAttemptsLeft: 'No quedan intentos',
    alreadyPassed: '¡Ya aprobaste este quiz!',
    bestScoreLabel: 'Mejor Puntuación',
    startQuiz: 'Comenzar Quiz',
    reviewResults: 'Revisar Últimos Resultados',
    question: 'Pregunta',
    of: 'de',
    selectAnswer: 'Selecciona tu respuesta',
    next: 'Siguiente',
    previous: 'Anterior',
    submitQuiz: 'Enviar Quiz',
    submitting: 'Enviando...',
    confirmSubmit: '¿Estás seguro? No podrás cambiar tus respuestas después de enviar.',
    unanswered: '{n} pregunta(s) sin responder',
    congratulations: '¡Felicidades!',
    quizPassed: '¡Aprobaste el quiz!',
    quizFailed: 'Aún no es suficiente',
    tryAgain: 'Revisa el contenido del módulo e inténtalo de nuevo.',
    yourScore: 'Tu Puntuación',
    correct: 'correcta',
    incorrect: 'incorrecta',
    attempt: 'Intento',
    pointsEarned: '{earned}/{total} puntos',
    explanation: 'Explicación',
    yourAnswer: 'Tu respuesta',
    correctAnswer: 'Respuesta correcta',
    retakeQuiz: 'Reintentar Quiz',
    backToCourse: 'Volver al Curso',
    nextModule: 'Siguiente Módulo',
    goToFinalExam: 'Ir al Examen Final',
    courseCompleteQuiz: '¡Todos los módulos completados! Procede al Examen Final para obtener tu certificado.',
    previousAttempts: 'Intentos Anteriores',
    passed: 'Aprobado',
    failed: 'Reprobado',
    maxAttemptsReached: 'Has utilizado todos los intentos disponibles.',
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

// ═══════════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  course: { id: string; slug: string; title: any };
  module: {
    id: string;
    moduleNumber: number;
    title: any;
    passingScore: number;
    maxAttempts: number | null;
  };
  questions: QuizClientQuestion[];
  alreadyPassed: boolean;
  bestScore: number | null;
  attemptsTaken: number;
  attemptsRemaining: number | null;
  canAttempt: boolean;
  previousAttempts: { attempt_number: number; score: number; passed: boolean; completed_at: string }[];
  isLastModule: boolean;
  language: Lang;
}

type Phase = 'intro' | 'quiz' | 'results';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function QuizClient({
  course,
  module: mod,
  questions,
  alreadyPassed,
  bestScore,
  attemptsTaken,
  attemptsRemaining,
  canAttempt,
  previousAttempts,
  isLastModule,
  language,
}: Props) {
  const t = i18n[language];
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [canRetake, setCanRetake] = useState(canAttempt);
  const topRef = useRef<HTMLDivElement>(null);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;
  const currentQuestion = questions[currentQ];

  // Scroll to top on phase change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase, currentQ]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const selectAnswer = (questionNum: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [String(questionNum)]: optionId }));
  };

  const handleSubmit = () => {
    const unanswered = total - answeredCount;
    if (unanswered > 0) {
      const msg = t.unanswered.replace('{n}', String(unanswered));
      if (!confirm(`${msg}\n\n${t.confirmSubmit}`)) return;
    } else {
      if (!confirm(t.confirmSubmit)) return;
    }

    setError(null);
    startTransition(async () => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const res = await submitQuiz({
        moduleId: mod.id,
        courseId: course.id,
        answers,
        timeSpentSeconds: elapsed,
      });

      if (res.success && res.result) {
        setResult(res.result);
        setPhase('results');
        setCanRetake(
          !res.result.passed &&
          (res.result.attemptsRemaining === null || res.result.attemptsRemaining > 0)
        );
      } else {
        setError(res.error || 'Failed to submit quiz');
      }
    });
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setError(null);
    setPhase('quiz');
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[100dvh] bg-gray-50" ref={topRef}>
      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <a
            href={`/courses/${course.slug}/modules/${mod.moduleNumber}`}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToModule}
          </a>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#0B4A7C]/50">
              {t.quizTitle}
            </p>
            <p className="text-xs font-bold text-gray-900">
              Module {mod.moduleNumber}: {loc(mod.title, language)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* ════════════════════════════════════════════════════════════ */}
        {/* INTRO PHASE                                                */}
        {/* ════════════════════════════════════════════════════════════ */}
        {phase === 'intro' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B4A7C]/10">
              <svg className="h-8 w-8 text-[#0B4A7C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>

            <h1 className="mb-2 text-center text-2xl font-extrabold text-gray-900">
              {t.quizTitle}
            </h1>
            <p className="mb-6 text-center text-sm text-gray-500">
              Module {mod.moduleNumber}: {loc(mod.title, language)}
            </p>

            {/* Already passed banner */}
            {alreadyPassed && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-green-700">{t.alreadyPassed}</span>
                </div>
                {bestScore !== null && (
                  <p className="text-sm text-green-600">
                    {t.bestScoreLabel}: {bestScore}%
                  </p>
                )}
              </div>
            )}

            {/* Instructions card */}
            <div className="mb-6 rounded-lg bg-gray-50 p-5">
              <h2 className="mb-3 text-sm font-bold text-gray-700">{t.instructions}</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{t.instructionsText.replace('{score}', String(mod.passingScore))}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                    <svg className="h-3.5 w-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t.questionsCount.replace('{n}', String(total))}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                    <svg className="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {t.passingScore.replace('{score}', String(mod.passingScore))}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                    <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    {attemptsRemaining !== null
                      ? (attemptsRemaining > 0
                          ? t.attemptsRemaining.replace('{n}', String(attemptsRemaining))
                          : t.noAttemptsLeft)
                      : t.unlimitedAttempts}
                  </span>
                </div>
              </div>
            </div>

            {/* Previous attempts */}
            {previousAttempts.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t.previousAttempts}
                </h3>
                <div className="space-y-1.5">
                  {previousAttempts.map((a) => (
                    <div
                      key={a.attempt_number}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2"
                    >
                      <span className="text-xs text-gray-500">
                        {t.attempt} {a.attempt_number}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700">{a.score}%</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          a.passed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {a.passed ? t.passed : t.failed}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {canAttempt && (
                <button
                  onClick={() => { setPhase('quiz'); setAnswers({}); setCurrentQ(0); }}
                  className="rounded-lg bg-[#FF6B35] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#E55A2B]"
                >
                  {t.startQuiz}
                </button>
              )}
              {!canAttempt && !alreadyPassed && (
                <p className="rounded-lg bg-red-50 px-6 py-3 text-center text-sm font-medium text-red-600">
                  {t.maxAttemptsReached}
                </p>
              )}
              <a
                href={`/courses/${course.slug}`}
                className="rounded-lg border border-gray-200 bg-white px-8 py-3 text-center text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                {t.backToCourse}
              </a>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* QUIZ PHASE                                                 */}
        {/* ════════════════════════════════════════════════════════════ */}
        {phase === 'quiz' && currentQuestion && (
          <div>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                <span>{t.question} {currentQ + 1} {t.of} {total}</span>
                <span>{answeredCount}/{total} answered</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B4A7C] to-[#1a6db5] transition-all duration-500"
                  style={{ width: `${((currentQ + 1) / total) * 100}%` }}
                />
              </div>
              {/* Question dots */}
              <div className="mt-3 flex justify-center gap-1.5">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[String(q.question_number)];
                  const isCurrent = i === currentQ;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQ(i)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        isCurrent
                          ? 'bg-[#0B4A7C] ring-2 ring-[#0B4A7C]/30'
                          : isAnswered
                            ? 'bg-green-400'
                            : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      aria-label={`Question ${i + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Question card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-[#0B4A7C]/50">
                {t.question} {currentQuestion.question_number}
              </div>
              <h2 className="mb-6 text-lg font-bold text-gray-900 sm:text-xl">
                {loc(currentQuestion.question_text, language)}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[String(currentQuestion.question_number)] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectAnswer(currentQuestion.question_number, opt.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition sm:px-5 ${
                        isSelected
                          ? 'border-[#0B4A7C] bg-[#0B4A7C]/5'
                          : 'border-gray-150 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        isSelected
                          ? 'bg-[#0B4A7C] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {opt.id.toUpperCase()}
                      </span>
                      <span className={`text-sm sm:text-base ${
                        isSelected ? 'font-medium text-gray-900' : 'text-gray-600'
                      }`}>
                        {loc(opt.text, language)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-30"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t.previous}
                </button>

                {currentQ < total - 1 ? (
                  <button
                    onClick={() => setCurrentQ(currentQ + 1)}
                    className="flex items-center gap-1 rounded-lg bg-[#0B4A7C] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#083457]"
                  >
                    {t.next}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-[#FF6B35] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#E55A2B] disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t.submitting}
                      </>
                    ) : (
                      t.submitQuiz
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* RESULTS PHASE                                              */}
        {/* ════════════════════════════════════════════════════════════ */}
        {phase === 'results' && result && (
          <div>
            {/* Score card */}
            <div className={`mb-8 overflow-hidden rounded-xl border-2 ${
              result.passed
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                : 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50'
            }`}>
              <div className="p-6 text-center sm:p-8">
                {/* Icon */}
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  result.passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.passed ? (
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <h2 className={`text-2xl font-extrabold ${
                  result.passed ? 'text-green-800' : 'text-red-700'
                }`}>
                  {result.passed ? t.congratulations : t.quizFailed}
                </h2>
                <p className={`mt-1 text-sm ${
                  result.passed ? 'text-green-600' : 'text-red-500'
                }`}>
                  {result.passed
                    ? (isLastModule ? t.courseCompleteQuiz : t.quizPassed)
                    : t.tryAgain
                  }
                </p>

                {/* Score circle */}
                <div className="mt-6 inline-flex flex-col items-center">
                  <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${
                    result.passed ? 'border-green-300 bg-white' : 'border-red-300 bg-white'
                  }`}>
                    <span className={`text-3xl font-extrabold ${
                      result.passed ? 'text-green-700' : 'text-red-600'
                    }`}>
                      {result.score}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {result.correctAnswers}/{result.totalQuestions} {t.correct}
                  </p>
                </div>
              </div>
            </div>

            {/* Question-by-question results */}
            <div className="mb-8 space-y-4">
              {result.results.map((qr, idx) => {
                const question = questions[idx];
                return (
                  <QuestionResultCard
                    key={idx}
                    qr={qr}
                    question={question}
                    language={language}
                    t={t}
                  />
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {canRetake && (
                <button
                  onClick={handleRetake}
                  className="rounded-lg bg-[#FF6B35] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#E55A2B]"
                >
                  {t.retakeQuiz}
                </button>
              )}
              {result.passed && !isLastModule && (
                <a
                  href={`/courses/${course.slug}/modules/${mod.moduleNumber + 1}`}
                  className="rounded-lg bg-[#0B4A7C] px-8 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#083457]"
                >
                  {t.nextModule} →
                </a>
              )}
              {result.passed && isLastModule && (
                <a
                  href={`/courses/${course.slug}/final-exam`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#0B4A7C] px-8 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#083457]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {t.goToFinalExam}
                </a>
              )}
              <a
                href={`/courses/${course.slug}`}
                className="rounded-lg border border-gray-200 bg-white px-8 py-3 text-center text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                {t.backToCourse}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION RESULT CARD
// ═══════════════════════════════════════════════════════════════════════════════
function QuestionResultCard({
  qr,
  question,
  language,
  t,
}: {
  qr: QuestionResult;
  question: QuizClientQuestion;
  language: Lang;
  t: Record<string, string>;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border ${
      qr.isCorrect ? 'border-green-200' : 'border-red-200'
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-3 ${
        qr.isCorrect ? 'bg-green-50' : 'bg-red-50'
      }`}>
        {qr.isCorrect ? (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className={`text-xs font-bold ${qr.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
          {t.question} {qr.questionNumber} — {qr.isCorrect ? t.correct : t.incorrect}
        </span>
      </div>

      {/* Body */}
      <div className="bg-white p-5">
        <p className="mb-4 text-sm font-bold text-gray-900">
          {loc(question.question_text, language)}
        </p>

        {/* Options with correct/incorrect indicators */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = qr.selectedAnswer === opt.id;
            const isCorrect = qr.correctAnswer === opt.id;

            let styles = 'border-gray-100 bg-gray-50 text-gray-500';
            if (isCorrect) styles = 'border-green-200 bg-green-50 text-green-800';
            if (isSelected && !qr.isCorrect && !isCorrect) styles = 'border-red-200 bg-red-50 text-red-700';

            return (
              <div
                key={opt.id}
                className={`flex items-start gap-3 rounded-lg border px-4 py-2.5 text-sm ${styles}`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isCorrect
                    ? 'bg-green-500 text-white'
                    : isSelected && !isCorrect
                      ? 'bg-red-400 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {opt.id.toUpperCase()}
                </span>
                <div className="flex-1">
                  <span>{loc(opt.text, language)}</span>
                  {isCorrect && (
                    <span className="ml-2 text-[10px] font-bold uppercase text-green-600">
                      ✓ {t.correctAnswer}
                    </span>
                  )}
                  {isSelected && !isCorrect && (
                    <span className="ml-2 text-[10px] font-bold uppercase text-red-500">
                      ✗ {t.yourAnswer}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {qr.explanation && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">
              {t.explanation}
            </p>
            <p className="text-sm text-blue-800">
              {loc(qr.explanation, language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
