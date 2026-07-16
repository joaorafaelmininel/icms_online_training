// src/app/courses/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentLanguage } from '@/lib/i18n/language'
import CoursePageClient from '@/components/courses/CoursePageClient'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Footer from '@/components/layout/Footer'
import type {
  Course,
  CourseModule,
  CourseEnrollment,
  UserModuleProgress,
} from '@/lib/types/courses'

interface Props {
  params: Promise<{ slug: string }>
}

type CourseTitle = string | { en?: string; es?: string } | null

type CourseRow = {
  id: string
  slug: string
  title: CourseTitle
}

type ProfileRow = {
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  const courseResult = await supabase
    .from('courses')
    .select('title')
    .eq('slug', slug)
    .single()

  const course = courseResult.data as { title: CourseTitle } | null

  if (!course) {
    return { title: 'Course Not Found' }
  }

  const title =
    typeof course.title === 'string'
      ? course.title
      : course.title?.en || 'Course'

  return { title: `${title} — ICMS Learning Platform` }
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()
  const language = (await getCurrentLanguage()) as 'en' | 'es'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth?redirectTo=/courses/${slug}`)
  }

  const courseResult = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  const course = courseResult.data as CourseRow | Course | null

  if (!course) {
    notFound()
  }

  const modulesResult = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', course.id)
    .order('module_number', { ascending: true })

  const modules = (modulesResult.data || []) as CourseModule[]

  const enrollmentResult = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  const enrollment = enrollmentResult.data as CourseEnrollment | null

  let moduleProgress: UserModuleProgress[] = []

  if (enrollment) {
    const progressResult = await supabase
      .from('user_module_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course.id)

    moduleProgress = (progressResult.data || []) as UserModuleProgress[]
  }

  const profileResult = await supabase
    .from('profiles')
    .select('first_name, last_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as ProfileRow | null

  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user.email?.split('@')[0] || 'User'

  const userEmail = profile?.email || user.email || ''

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
          modules={modules}
          enrollment={enrollment}
          moduleProgress={moduleProgress}
          language={language}
          courseSlug={slug}
        />
      </main>
      <Footer />
    </div>
  )
}