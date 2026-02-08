// src/app/courses/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentLanguage } from '@/lib/i18n/language';
import CoursePageClient from '@/components/courses/CoursePageClient';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Footer from '@/components/layout/Footer';
import type {
  Course,
  CourseModule,
  CourseEnrollment,
  UserModuleProgress,
} from '@/lib/types/courses';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('slug', slug)
    .single();

  if (!course) return { title: 'Course Not Found' };

  const title =
    typeof course.title === 'string'
      ? course.title
      : (course.title as any)?.en || 'Course';

  return { title: `${title} — ICMS Learning Platform` };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const language = (await getCurrentLanguage()) as 'en' | 'es';

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth?redirectTo=/courses/${slug}`);

  // Fetch course by slug
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!course) notFound();

  // Fetch modules ordered
  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', course.id)
    .order('module_number', { ascending: true });

  // Fetch enrollment
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  // Fetch module progress
  let moduleProgress: UserModuleProgress[] = [];
  if (enrollment) {
    const { data } = await supabase
      .from('user_module_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course.id);
    moduleProgress = (data || []) as UserModuleProgress[];
  }

  // Fetch profile for header
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, avatar_url')
    .eq('id', user.id)
    .single();

  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user.email?.split('@')[0] || 'User';
  const userEmail = profile?.email || user.email || '';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        userAvatar={profile?.avatar_url}
        language={language}
        userId={user.id}
      />
      <main className="flex-1">
        <CoursePageClient
          course={course as Course}
          modules={(modules || []) as CourseModule[]}
          enrollment={enrollment as CourseEnrollment | null}
          moduleProgress={moduleProgress}
          language={language}
          courseSlug={slug}
        />
      </main>
      <Footer />
    </div>
  );
}
