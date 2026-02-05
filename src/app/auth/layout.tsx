export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0B4A7C] via-[#0E5C99] to-[#083457] flex items-center justify-center px-4">
      {children}
    </div>
  );
}
