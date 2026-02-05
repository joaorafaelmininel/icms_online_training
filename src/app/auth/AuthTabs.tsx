"use client";

import { useRouter } from "next/navigation";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthTabs({ activeTab }: { activeTab: "signin" | "signup" }) {
  const router = useRouter();

  return (
    <>
      <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => router.push("/auth?tab=signin")}
          className={`rounded-md py-2 text-sm font-semibold transition ${
            activeTab === "signin"
              ? "bg-white text-[#0B4A7C] shadow"
              : "text-gray-500"
          }`}
        >
          Sign In
        </button>

        <button
          onClick={() => router.push("/auth?tab=signup")}
          className={`rounded-md py-2 text-sm font-semibold transition ${
            activeTab === "signup"
              ? "bg-white text-[#0B4A7C] shadow"
              : "text-gray-500"
          }`}
        >
          Sign Up
        </button>
      </div>

      {activeTab === "signin" ? <SignInForm /> : <SignUpForm />}
    </>
  );
}
