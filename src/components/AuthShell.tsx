import Image from "next/image";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/insarag-logo.png"
          alt="INSARAG"
          width={64}
          height={64}
          className="mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1 text-center">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
