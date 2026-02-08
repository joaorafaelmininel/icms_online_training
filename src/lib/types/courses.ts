// src/lib/types/courses.ts
// ============================================================
// ICMS Learning Platform — Course & Enrollment Types
// Alinhado com o schema consolidado v7.0.0
// ============================================================

export type CourseStatus = 'draft' | 'active' | 'archived' | 'coming_soon';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Tipo para campos JSONB multilingues: {"en": "...", "es": "..."}
export interface LocalizedText {
  en: string;
  es: string;
}

// ─── COURSE (tabela: courses) ───────────────────────────────────────────────
export interface Course {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText | null;
  learning_outcomes: LocalizedText | null;
  requirements: LocalizedText | null;
  duration_hours: number | null;
  total_modules: number;
  difficulty_level: DifficultyLevel;
  category: string;
  languages: string[];
  thumbnail_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  status: CourseStatus;
  certificate_enabled: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ─── MODULE (tabela: course_modules) ────────────────────────────────────────
export interface CourseModule {
  id: string;
  course_id: string;
  module_number: number;
  title: LocalizedText;
  description: LocalizedText | null;
  learning_outcomes: LocalizedText | null;
  duration_minutes: number | null;
  order_index: number;
  total_slides: number;
  has_quiz: boolean;
  quiz_required: boolean;
  quiz_passing_score: number;
  quiz_max_attempts: number | null;
  is_locked: boolean;
  prerequisites: string[] | null;
  created_at: string;
  updated_at: string;
}

// ─── ENROLLMENT (tabela: course_enrollments) ────────────────────────────────
export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  progress_percentage: number;
  current_module_number: number;
  status: EnrollmentStatus;
  time_spent_minutes: number;
  final_exam_unlocked: boolean;
  final_exam_passed: boolean;
  final_exam_best_score: number | null;
  certificate_issued: boolean;
  certificate_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── MODULE PROGRESS (tabela: user_module_progress) ─────────────────────────
export interface UserModuleProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  enrollment_id: string;
  current_slide: number;
  completed_slides: number[];
  total_slides: number;
  is_completed: boolean;
  completed_at: string | null;
  time_spent_minutes: number;
  last_accessed_at: string;
  quiz_passed: boolean;
  quiz_best_score: number | null;
  quiz_attempts_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Derived types para UI ──────────────────────────────────────────────────

export interface EnrolledCourseData {
  enrollment: CourseEnrollment;
  course: Course;
  modules: CourseModule[];
  moduleProgress: UserModuleProgress[];
  completedModules: number;
  totalModules: number;
  nextModuleNumber: number;
}

export interface AvailableCourseData {
  course: Course;
  modules: CourseModule[];
  isEnrolled: boolean;
}

// ─── Helper: Extrair texto localizado de JSONB ──────────────────────────────

export function getLocalized(
  field: LocalizedText | null | undefined,
  language: 'en' | 'es'
): string {
  if (!field) return '';

  // Se vier como string raw (Supabase pode deserializar assim)
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return normalizeLocalizedValue(parsed[language] || parsed['en'] || '');
    } catch {
      return field;
    }
  }

  // Objeto normal: {en: "...", es: "..."}
  const value = field[language] || field['en'] || '';
  return normalizeLocalizedValue(value);
}

/**
 * Normaliza valor que pode ser string ou array de strings.
 * Arrays são convertidos para strings com \n (ex: ["a","b"] → "- a\n- b")
 */
function normalizeLocalizedValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item: string) => `- ${item}`).join('\n');
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value || '');
}
