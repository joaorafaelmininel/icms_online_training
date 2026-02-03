import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentLanguage, t } from "@/lib/i18n/language";
import { dashboard } from "@/lib/i18n/translations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const language = await getCurrentLanguage();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t(dashboard.welcomeBack, language)}!
          </h1>
          <p className="mt-2 text-gray-600">
            {t(dashboard.subtitle, language)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Course Card - Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ICMS 3.0 Training
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Complete training course
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">0% complete</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
                {t(dashboard.startCourse, language)}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>Dashboard content will be expanded in Phase 4</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
