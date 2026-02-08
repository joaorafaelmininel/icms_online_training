// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentLanguage } from '@/lib/i18n/language';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Footer from '@/components/layout/Footer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const language = await getCurrentLanguage();

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Obter perfil
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
        language={language as 'en' | 'es'}
        userId={user.id}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
