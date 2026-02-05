"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gradient-to-r from-[#0B4A7C] to-[#083457] px-6 py-4">
          <h1 className="text-lg font-bold text-white">Sign In</h1>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4 p-6">
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#0B4A7C] focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#0B4A7C] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-[#0B4A7C] py-3 font-semibold text-white transition hover:bg-[#083457]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-[#0B4A7C]">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
