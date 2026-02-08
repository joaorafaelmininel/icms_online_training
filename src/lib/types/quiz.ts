// src/lib/types/quiz.ts

import type { LocalizedText } from './courses';

// ─── Quiz Question ──────────────────────────────────────────────────────────
export interface QuizOption {
  id: string;           // "a", "b", "c", "d"
  text: LocalizedText;  // {"en": "...", "es": "..."}
}

export interface QuizQuestion {
  id: string;
  module_id: string;
  course_id: string;
  question_number: number;
  question_text: LocalizedText;
  question_type: 'multiple_choice' | 'true_false';
  options: QuizOption[];
  correct_answer: string;   // only used server-side
  explanation: LocalizedText | null;
  points: number;
}

// ─── Quiz Attempt ───────────────────────────────────────────────────────────
export interface QuizAttempt {
  id: string;
  user_id: string;
  module_id: string;
  course_id: string;
  attempt_number: number;
  answers: Record<string, string>;  // {"1": "a", "2": "c", ...}
  score: number;
  total_points: number;
  earned_points: number;
  passed: boolean;
  completed_at: string;
  time_spent_seconds: number;
}

// ─── Quiz Result (returned after submission) ────────────────────────────────
export interface QuizResult {
  passed: boolean;
  score: number;            // percentage 0-100
  earnedPoints: number;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  attemptNumber: number;
  attemptsRemaining: number | null;  // null = unlimited
  results: QuestionResult[];
}

export interface QuestionResult {
  questionNumber: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: LocalizedText | null;
}

// ─── Props for client ───────────────────────────────────────────────────────
export interface QuizClientQuestion {
  id: string;
  question_number: number;
  question_text: LocalizedText;
  question_type: 'multiple_choice' | 'true_false';
  options: QuizOption[];
  points: number;
}
