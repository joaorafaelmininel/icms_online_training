'use client'

import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function EmailVerificationClient() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox.',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send verification email. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#062a47] via-[#0B4A7C] to-[#083457] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/insarag-logo.svg"
          alt="INSARAG"
          width={120}
          height={80}
          className="brightness-0 invert"
        />
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          <p className="text-gray-600 text-sm">
            We&apos;ve sent a verification link to your email address. Please click the link to activate your account.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">What to do next:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Check your email inbox</li>
            <li>Look for an email from ICMS Learning</li>
            <li>Click the verification link in the email</li>
            <li>Sign in to your account</li>
          </ol>
        </div>

        {/* Resend Section */}
        <div className="border-t pt-6">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Didn&apos;t receive the email?
          </p>
          
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Messages */}
            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-md transition-colors"
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </form>
        </div>

        {/* Back to Sign In */}
        <div className="mt-6 text-center">
          <Link
            href="/auth?tab=signin"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-white text-xs">
        <p>
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-200">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-200">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}