import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {children}
      </div>
    </div>
  );
}
