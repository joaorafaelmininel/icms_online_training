"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function SignInForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">
        Sign in to your account
      </h2>

      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-lg border px-4 py-2"
      />

      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        className="w-full rounded-lg border px-4 py-2"
      />

      <button
        disabled={loading}
        className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
