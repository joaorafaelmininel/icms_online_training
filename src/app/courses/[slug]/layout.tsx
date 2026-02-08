// src/app/courses/[slug]/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Minimal layout for /courses/[slug]/*
 * - Auth guard only (redirects to /auth if not logged in)
 * - No header/footer here — the Course Page wraps itself, 
 *   and the Module Viewer is full-screen with its own top bar
 */
export default async function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  return <>{children}</>;
}
