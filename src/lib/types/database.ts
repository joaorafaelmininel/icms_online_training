// src/lib/types/database.ts
// ═══════════════════════════════════════════════════════════════════════════════
// Auto-generated Supabase Database types for ICMS Learning Platform
// Based on database schema v7.0.0 + all patches (SQL_1 through SQL_6)
// ═══════════════════════════════════════════════════════════════════════════════

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ─── PROFILES ──────────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string;
          email: string | null;
          username: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: string;
          preferred_language: string;
          title: string | null;
          organization: string | null;
          country: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          preferred_language?: string;
          title?: string | null;
          organization?: string | null;
          country?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          preferred_language?: string;
          title?: string | null;
          organization?: string | null;
          country?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };

      // ─── COURSES ───────────────────────────────────────────────────────────
      courses: {
        Row: {
          id: string;
          slug: string;
          title: Json;
          description: Json | null;
          learning_outcomes: Json | null;
          requirements: Json | null;
          duration_hours: number | null;
          total_modules: number;
          difficulty_level: string;
          category: string;
          languages: string[];
          thumbnail_url: string | null;
          banner_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          status: string;
          certificate_enabled: boolean;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: Json;
          description?: Json | null;
          learning_outcomes?: Json | null;
          requirements?: Json | null;
          duration_hours?: number | null;
          total_modules?: number;
          difficulty_level?: string;
          category?: string;
          languages?: string[];
          thumbnail_url?: string | null;
          banner_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          status?: string;
          certificate_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          slug?: string;
          title?: Json;
          description?: Json | null;
          learning_outcomes?: Json | null;
          requirements?: Json | null;
          duration_hours?: number | null;
          total_modules?: number;
          difficulty_level?: string;
          category?: string;
          languages?: string[];
          thumbnail_url?: string | null;
          banner_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          status?: string;
          certificate_enabled?: boolean;
          updated_at?: string;
          published_at?: string | null;
        };
      };

      // ─── COURSE MODULES ────────────────────────────────────────────────────
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          module_number: number;
          title: Json;
          description: Json | null;
          learning_outcomes: Json | null;
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
        };
        Insert: {
          id?: string;
          course_id: string;
          module_number: number;
          title: Json;
          description?: Json | null;
          learning_outcomes?: Json | null;
          duration_minutes?: number | null;
          order_index?: number;
          total_slides?: number;
          has_quiz?: boolean;
          quiz_required?: boolean;
          quiz_passing_score?: number;
          quiz_max_attempts?: number | null;
          is_locked?: boolean;
          prerequisites?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          course_id?: string;
          module_number?: number;
          title?: Json;
          description?: Json | null;
          learning_outcomes?: Json | null;
          duration_minutes?: number | null;
          order_index?: number;
          total_slides?: number;
          has_quiz?: boolean;
          quiz_required?: boolean;
          quiz_passing_score?: number;
          quiz_max_attempts?: number | null;
          is_locked?: boolean;
          prerequisites?: string[] | null;
          updated_at?: string;
        };
      };

      // ─── COURSE ENROLLMENTS ────────────────────────────────────────────────
      course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          started_at: string | null;
          completed_at: string | null;
          last_accessed_at: string | null;
          progress_percentage: number;
          current_module_number: number;
          status: string;
          time_spent_minutes: number;
          final_exam_unlocked: boolean;
          final_exam_passed: boolean;
          final_exam_best_score: number | null;
          final_exam_attempts: number;
          certificate_issued: boolean;
          certificate_issued_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          last_accessed_at?: string | null;
          progress_percentage?: number;
          current_module_number?: number;
          status?: string;
          time_spent_minutes?: number;
          final_exam_unlocked?: boolean;
          final_exam_passed?: boolean;
          final_exam_best_score?: number | null;
          final_exam_attempts?: number;
          certificate_issued?: boolean;
          certificate_issued_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          course_id?: string;
          started_at?: string | null;
          completed_at?: string | null;
          last_accessed_at?: string | null;
          progress_percentage?: number;
          current_module_number?: number;
          status?: string;
          time_spent_minutes?: number;
          final_exam_unlocked?: boolean;
          final_exam_passed?: boolean;
          final_exam_best_score?: number | null;
          final_exam_attempts?: number;
          certificate_issued?: boolean;
          certificate_issued_at?: string | null;
          updated_at?: string;
        };
      };

      // ─── USER MODULE PROGRESS ──────────────────────────────────────────────
      user_module_progress: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          module_id: string;
          enrollment_id: string;
          current_slide?: number;
          completed_slides?: number[];
          total_slides?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          time_spent_minutes?: number;
          last_accessed_at?: string;
          quiz_passed?: boolean;
          quiz_best_score?: number | null;
          quiz_attempts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          current_slide?: number;
          completed_slides?: number[];
          total_slides?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          time_spent_minutes?: number;
          last_accessed_at?: string;
          quiz_passed?: boolean;
          quiz_best_score?: number | null;
          quiz_attempts_count?: number;
          updated_at?: string;
        };
      };

      // ─── USER SLIDE PROGRESS ───────────────────────────────────────────────
      user_slide_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          slide_number: number;
          is_completed: boolean;
          viewed_at: string;
          time_spent_seconds: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          slide_number: number;
          is_completed?: boolean;
          viewed_at?: string;
          time_spent_seconds?: number;
        };
        Update: {
          is_completed?: boolean;
          viewed_at?: string;
          time_spent_seconds?: number;
        };
      };

      // ─── MODULE SLIDES ─────────────────────────────────────────────────────
      module_slides: {
        Row: {
          id: string;
          module_id: string;
          course_id: string;
          slide_number: number;
          layout: string;
          title: Json;
          content: Json;
          thumbnail_url: string | null;
          notes: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          course_id: string;
          slide_number: number;
          layout?: string;
          title: Json;
          content?: Json;
          thumbnail_url?: string | null;
          notes?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          module_id?: string;
          course_id?: string;
          slide_number?: number;
          layout?: string;
          title?: Json;
          content?: Json;
          thumbnail_url?: string | null;
          notes?: Json | null;
          updated_at?: string;
        };
      };

      // ─── MODULE QUIZ QUESTIONS ─────────────────────────────────────────────
      module_quiz_questions: {
        Row: {
          id: string;
          module_id: string;
          course_id: string;
          question_number: number;
          question_text: Json;
          question_type: string;
          options: Json;
          correct_answer: string;
          explanation: Json | null;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          course_id: string;
          question_number: number;
          question_text: Json;
          question_type?: string;
          options: Json;
          correct_answer: string;
          explanation?: Json | null;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          question_number?: number;
          question_text?: Json;
          question_type?: string;
          options?: Json;
          correct_answer?: string;
          explanation?: Json | null;
          points?: number;
          updated_at?: string;
        };
      };

      // ─── USER QUIZ ATTEMPTS ────────────────────────────────────────────────
      user_quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          course_id: string;
          attempt_number: number;
          answers: Json;
          score: number;
          total_points: number;
          earned_points: number;
          passed: boolean;
          completed_at: string;
          time_spent_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          course_id: string;
          attempt_number?: number;
          answers?: Json;
          score?: number;
          total_points?: number;
          earned_points?: number;
          passed?: boolean;
          completed_at?: string;
          time_spent_seconds?: number;
          created_at?: string;
        };
        Update: {
          answers?: Json;
          score?: number;
          total_points?: number;
          earned_points?: number;
          passed?: boolean;
          completed_at?: string;
          time_spent_seconds?: number;
        };
      };

      // ─── FINAL EXAM QUESTIONS ──────────────────────────────────────────────
      final_exam_questions: {
        Row: {
          id: string;
          course_id: string;
          question_number: number;
          question_text: Json;
          options: Json;
          correct_answer: string;
          explanation: Json | null;
          source_module: number | null;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          question_number: number;
          question_text: Json;
          options: Json;
          correct_answer: string;
          explanation?: Json | null;
          source_module?: number | null;
          points?: number;
          created_at?: string;
        };
        Update: {
          question_number?: number;
          question_text?: Json;
          options?: Json;
          correct_answer?: string;
          explanation?: Json | null;
          source_module?: number | null;
          points?: number;
        };
      };

      // ─── USER FINAL EXAM ATTEMPTS ──────────────────────────────────────────
      user_final_exam_attempts: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrollment_id: string;
          attempt_number: number;
          answers: Json;
          score: number;
          total_points: number;
          earned_points: number;
          passed: boolean;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrollment_id: string;
          attempt_number?: number;
          answers?: Json;
          score?: number;
          total_points?: number;
          earned_points?: number;
          passed?: boolean;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          answers?: Json;
          score?: number;
          total_points?: number;
          earned_points?: number;
          passed?: boolean;
          completed_at?: string;
        };
      };
    };

    Views: {};
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {};
  };
}
