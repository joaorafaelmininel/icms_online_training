// src/lib/types/database.ts
// Database types for ICMS 3.0 Platform - Schema v6.0.0

export type Language = 'en' | 'es';

export type BilingualText = {
  en: string;
  es: string;
};

// ==========================================
// COURSES
// ==========================================

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  slug: string;
  title: BilingualText;
  short_description: BilingualText;
  long_description?: BilingualText;
  duration_hours: number;
  level?: CourseLevel;
  total_modules: number;
  passing_score: number; // 70
  certificate_template_url?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// MODULES
// ==========================================

export interface CourseModule {
  id: string;
  course_id: string;
  module_number: number;
  title: BilingualText;
  description?: BilingualText;
  order_index: number;
  total_slides: number;
  estimated_duration_minutes: number;
  has_quiz: boolean;
  quiz_required: boolean;
  quiz_passing_score: number; // 70
  quiz_max_attempts?: number; // null = unlimited
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// ENROLLMENTS
// ==========================================

export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  progress_percentage: number; // 0-100
  current_module_number: number;
  status: EnrollmentStatus;
  final_exam_unlocked: boolean;
  final_exam_passed: boolean;
  certificate_issued: boolean;
  updated_at: string;
}

// ==========================================
// MODULE PROGRESS
// ==========================================

export interface UserModuleProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  enrollment_id: string;
  current_slide: number;
  completed_slides: number[]; // Array de slide numbers
  slides_completion_percentage: number; // 0-100
  is_completed: boolean;
  quiz_unlocked: boolean;
  quiz_passed: boolean;
  quiz_best_score?: number; // 0-100
  quiz_attempts_count: number;
  can_proceed_to_next: boolean;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

// ==========================================
// QUIZ
// ==========================================

export type QuestionType = 'multiple_choice' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: string;
  course_id: string;
  module_id?: string; // null = final exam question
  question_text: BilingualText;
  question_type: QuestionType;
  options: {
    en: QuizOption[];
    es: QuizOption[];
  };
  correct_answer: string; // option id
  explanation?: BilingualText;
  difficulty?: Difficulty;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  enrollment_id: string;
  attempt_number: number;
  score: number; // 0-100
  total_questions: number; // sempre 5 para quiz de módulo
  correct_answers: number; // 0-5
  passing_score: number; // sempre 70
  passed: boolean;
  answers: Record<string, string>; // { question_id: selected_option_id }
  time_spent_seconds?: number;
  started_at: string;
  completed_at: string;
}

// ==========================================
// FINAL EXAM
// ==========================================

export interface FinalExam {
  id: string;
  course_id: string;
  total_questions: number; // 10
  questions_from_bank: number; // 50
  passing_score: number; // 70
  max_attempts?: number; // null = unlimited
  time_limit_minutes?: number; // null = no limit
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinalExamAttempt {
  id: string;
  user_id: string;
  course_id: string;
  exam_id: string;
  enrollment_id: string;
  attempt_number: number;
  score: number; // 0-100
  total_questions: number; // 10
  correct_answers: number; // 0-10
  passing_score: number; // 70
  passed: boolean;
  selected_questions: string[]; // Array de question IDs
  answers: Record<string, string>; // { question_id: selected_option_id }
  time_spent_seconds?: number;
  started_at: string;
  completed_at: string;
}

// ==========================================
// CERTIFICATES
// ==========================================

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_number: string; // ICMS30-2026-000001
  issued_at: string;
  final_exam_score: number;
  pdf_url?: string;
  qr_code_url?: string;
  verification_code: string;
  is_valid: boolean;
  revoked_at?: string;
  created_at: string;
}

// ==========================================
// PROFILES
// ==========================================

export type Title = 'mr' | 'mrs' | 'ms';
export type UserRole = 'student' | 'instructor' | 'admin';
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'deleted';
export type TeamType = 
  | 'assessment' 
  | 'coordination' 
  | 'emt' 
  | 'environmental' 
  | 'firefighting' 
  | 'flood' 
  | 'logistics' 
  | 'shelter' 
  | 'telecom' 
  | 'usar' 
  | 'wash';

export interface Profile {
  id: string;
  username: string; // OBRIGATÓRIO, único, 3-30 chars
  title: Title; // OBRIGATÓRIO
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  country: string;
  preferred_language: Language;
  organization?: string;
  organization_country?: string;
  job_title?: string;
  usar_role?: string;
  team_type?: TeamType;
  years_experience?: number;
  user_role: UserRole;
  account_status: AccountStatus;
  profile_completed: boolean;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// HELPER TYPES
// ==========================================

// Para loaders de páginas
export interface TrainingModuleCard {
  id: string;
  module_number: number;
  title: BilingualText;
  description?: BilingualText;
  total_slides: number;
  estimated_duration_minutes: number;
  has_quiz: boolean;
  quiz_required: boolean;
  order_index: number;
}

export interface TrainingDashboardData {
  course: Course;
  modules: TrainingModuleCard[];
  enrollment?: CourseEnrollment;
  progress?: {
    completed_modules: number;
    total_modules: number;
    percentage: number;
  };
}

// Para quiz runner
export interface QuizSessionQuestion {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: QuizOption[];
  explanation?: string;
}

export interface QuizResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  questions: Array<{
    question_id: string;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation?: string;
  }>;
}

// Para enrollment
export interface EnrollmentWithCourse extends CourseEnrollment {
  course: Course;
}

// Para certificates
export interface CertificateWithDetails extends Certificate {
  course: Course;
  user: {
    full_name: string;
    email: string;
  };
}
