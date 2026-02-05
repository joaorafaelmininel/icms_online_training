"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function SignUpForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const f = new FormData(e.currentTarget);

    await supabase.auth.signUp({
      email: f.get("email") as string,
      password: f.get("password") as string,
      options: {
        data: {
          username: f.get("username"),
          title: f.get("title"),
          first_name: f.get("first_name"),
          middle_name: f.get("middle_name"),
          last_name: f.get("last_name"),
          country: f.get("country"),
          preferred_language: f.get("preferred_language"),
          terms_accepted: true,
          privacy_accepted: true,
        },
      },
    });

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">
        Create your account
      </h2>

      {/* Credentials */}
      <input name="email" required type="email" placeholder="Email" className="input" />
      <input name="password" required type="password" placeholder="Password" className="input" />

      {/* Personal info */}
      <select name="title" required className="input">
        <option value="">Title</option>
        <option value="mr">Mr</option>
        <option value="mrs">Mrs</option>
        <option value="ms">Ms</option>
      </select>

      <input name="first_name" required placeholder="First name" className="input" />
      <input name="middle_name" placeholder="Middle name (optional)" className="input" />
      <input name="last_name" required placeholder="Last name" className="input" />
      <input name="country" required placeholder="Country" className="input" />

      <select name="preferred_language" className="input">
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>

      {/* Username */}
      <input
        name="username"
        required
        placeholder="Username (lowercase)"
        pattern="^[a-z0-9_]{3,30}$"
        className="input"
      />

      {/* Legal */}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" required /> I accept the Terms and Privacy Policy
      </label>

      <button
        disabled={loading}
        className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
