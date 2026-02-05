"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    title: "mr",
    first_name: "",
    last_name: "",
    country: "",
    preferred_language: "en",
    terms: false,
    privacy: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.terms || !form.privacy) {
      setError("You must accept the terms and privacy policy.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          title: form.title,
          first_name: form.first_name,
          last_name: form.last_name,
          country: form.country,
          preferred_language: form.preferred_language,
        },
      },
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
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gradient-to-r from-[#0B4A7C] to-[#083457] px-6 py-4">
          <h1 className="text-lg font-bold text-white">Create Account</h1>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4 p-6">
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="First name" required className="input" onChange={(e)=>update("first_name",e.target.value)} />
            <input placeholder="Last name" required className="input" onChange={(e)=>update("last_name",e.target.value)} />
          </div>

          <input placeholder="Username" required className="input" onChange={(e)=>update("username",e.target.value)} />
          <input type="email" placeholder="Email" required className="input" onChange={(e)=>update("email",e.target.value)} />
          <input type="password" placeholder="Password" required className="input" onChange={(e)=>update("password",e.target.value)} />
          <input placeholder="Country" required className="input" onChange={(e)=>update("country",e.target.value)} />

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" onChange={(e)=>update("terms",e.target.checked)} />
              Accept Terms
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" onChange={(e)=>update("privacy",e.target.checked)} />
              Accept Privacy Policy
            </label>
          </div>

          <button className="w-full rounded-lg bg-[#0B4A7C] py-3 font-semibold text-white">
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-[#0B4A7C]">
              Sign In
            </Link>
          </p>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
        }
      `}</style>
    </div>
  );
}
