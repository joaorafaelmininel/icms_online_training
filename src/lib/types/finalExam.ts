// src/lib/types/finalExam.ts

export type Lang = 'en' | 'es';

export interface LocalizedText {
  en: string;
  es: string;
}

/** Full question (server-side — includes correct_answer) */
export interface FinalExamQuestion {
  id: string;
  question_number: number;
  question_text: LocalizedText;
  options: { id: string; text: LocalizedText }[];
  correct_answer: string;
  explanation: LocalizedText;
  points: number;
  source_module: number | null;
}

/** Client-safe question (no correct_answer) */
export interface FinalExamClientQuestion {
  id: string;
  question_number: number;
  question_text: LocalizedText;
  options: { id: string; text: LocalizedText }[];
  points: number;
  source_module: number | null;
}

/** Per-question grading result */
export interface FinalExamQuestionResult {
  question_id: string;
  question_number: number;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: LocalizedText;
  points: number;
}

/** Full exam grading result */
export interface FinalExamResult {
  attempt_id: string;
  attempt_number: number;
  score: number;
  total_points: number;
  earned_points: number;
  passed: boolean;
  passing_score: number;
  questions: FinalExamQuestionResult[];
  certificate_unlocked: boolean;
}
