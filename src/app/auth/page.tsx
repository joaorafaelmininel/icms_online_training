import { getCurrentLanguage, t } from "@/lib/i18n/language";
import { auth } from "@/lib/i18n/translations";

export default async function AuthPage() {
  const language = await getCurrentLanguage();

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {t(auth.signIn, language)}
        </h1>

        <p className="text-center text-gray-600 mb-8">
          {t(auth.welcomeBack, language)}
        </p>

        {/* Auth form will be added in Phase 2 */}
        <div className="text-center text-sm text-gray-500">
          <p>Authentication form coming in Phase 2</p>
          <p className="mt-2">For now, this is a placeholder</p>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 transition"
          >
            {t(auth.backToHome, language)}
          </a>
        </div>
      </div>
    </div>
  );
}
