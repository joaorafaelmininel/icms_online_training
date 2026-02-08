// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getCurrentLanguage } from '@/lib/i18n/language';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type {
  Course,
  CourseModule,
  CourseEnrollment,
  UserModuleProgress,
  EnrolledCourseData,
  AvailableCourseData,
} from '@/lib/types/courses';

export const metadata = {
  title: 'Dashboard — ICMS Learning Platform',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const language = (await getCurrentLanguage()) as 'en' | 'es';

  // Obter utilizador
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  // Obter perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, title')
    .eq('id', user.id)
    .single();

  const firstName =
    profile?.first_name || user.email?.split('@')[0] || 'User';

  // Obter todos os cursos ativos/coming_soon
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .in('status', ['active', 'coming_soon'])
    .order('created_at', { ascending: true });

  // Obter todos os módulos (ordenados)
  const { data: allModules } = await supabase
    .from('course_modules')
    .select('*')
    .order('module_number', { ascending: true });

  // Obter matrículas do utilizador
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id);

  // Obter progresso dos módulos do utilizador
  const { data: allProgress } = await supabase
    .from('user_module_progress')
    .select('*')
    .eq('user_id', user.id);

  // Construir dados dos cursos matriculados
  const enrolledCourseIds = new Set(
    (enrollments || []).map((e: CourseEnrollment) => e.course_id)
  );

  const enrolledCourses: EnrolledCourseData[] = (enrollments || [])
    .filter(
      (e: CourseEnrollment) =>
        e.status === 'enrolled' ||
        e.status === 'in_progress' ||
        e.status === 'completed'
    )
    .map((enrollment: CourseEnrollment) => {
      const course = (courses || []).find(
        (c: Course) => c.id === enrollment.course_id
      );
      if (!course) return null;

      const modules = (allModules || []).filter(
        (m: CourseModule) => m.course_id === enrollment.course_id
      );
      const moduleIds = new Set(modules.map((m: CourseModule) => m.id));
      const moduleProgress = (allProgress || []).filter(
        (mp: UserModuleProgress) => moduleIds.has(mp.module_id)
      );
      const completedModules = moduleProgress.filter(
        (mp: UserModuleProgress) => {
          const mod = modules.find((m: CourseModule) => m.id === mp.module_id);
          return mp.is_completed === true && (mp.quiz_passed === true || !mod?.quiz_required);
        }
      ).length;

      return {
        enrollment,
        course,
        modules,
        moduleProgress,
        completedModules,
        totalModules: modules.length,
        nextModuleNumber: completedModules + 1,
      };
    })
    .filter(Boolean) as EnrolledCourseData[];

  // Construir dados dos cursos disponíveis
  const availableCourses: AvailableCourseData[] = (courses || []).map(
    (course: Course) => {
      const modules = (allModules || []).filter(
        (m: CourseModule) => m.course_id === course.id
      );
      return {
        course,
        modules,
        isEnrolled: enrolledCourseIds.has(course.id),
      };
    }
  );

  return (
    <DashboardClient
      firstName={firstName}
      language={language}
      enrolledCourses={enrolledCourses}
      availableCourses={availableCourses}
    />
  );
}
