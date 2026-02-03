import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b4f83] via-[#0b3a63] to-[#072c4a]">
      <header className="w-full bg-white/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link href="/">
            <div className="text-white text-2xl font-bold">INSARAG</div>
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
