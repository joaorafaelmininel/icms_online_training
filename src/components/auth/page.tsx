import AuthTabs from "./AuthTabs";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab === "signup" ? "signup" : "signin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B4A7C] to-[#083457] flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              INSARAG Online Training
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ICMS 3.0 Learning Platform
            </p>
          </div>

          <AuthTabs activeTab={tab} />
        </div>
      </div>
    </div>
  );
}
