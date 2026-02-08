import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use - ICMS Learning',
  description: 'ICMS Learning Platform Terms of Use',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/insarag-logo.svg"
              alt="INSARAG"
              width={100}
              height={60}
              className="brightness-0"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          <p className="text-gray-600 mt-2">Last updated: February 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-blue max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the ICMS Learning Platform (&quot;Platform&quot;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the Platform.
          </p>

          <h2>2. Use of Platform</h2>
          <p>
            The ICMS Learning Platform is designed to provide online training for INSARAG (International Search and Rescue Advisory Group) professionals on the ICMS 3.0 coordination and management system.
          </p>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and complete information during registration</li>
            <li>Maintain the security of your account credentials</li>
            <li>Not share your account with others</li>
            <li>Use the Platform only for its intended educational purposes</li>
            <li>Not attempt to circumvent any security features</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            To access the Platform, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            All content on the Platform, including but not limited to text, graphics, logos, images, videos, and course materials, is the property of INSARAG or its content suppliers and is protected by international copyright laws.
          </p>
          <p>
            You may not reproduce, distribute, or create derivative works from Platform content without explicit permission.
          </p>

          <h2>5. Course Enrollment and Completion</h2>
          <p>
            Upon enrollment in a course, you gain access to the course materials for the duration specified in the course details. Course completion requirements include:
          </p>
          <ul>
            <li>Viewing all required training modules</li>
            <li>Completing all quizzes with passing scores</li>
            <li>Passing the final examination</li>
          </ul>
          <p>
            Certificates will be issued upon successful completion of all requirements.
          </p>

          <h2>6. Acceptable Use Policy</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any portion of the Platform</li>
            <li>Interfere with or disrupt the Platform or servers</li>
            <li>Upload or transmit viruses or malicious code</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Impersonate any person or entity</li>
          </ul>

          <h2>7. Privacy and Data Protection</h2>
          <p>
            Your use of the Platform is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding your personal information.
          </p>

          <h2>8. Disclaimers</h2>
          <p>
            The Platform and all content are provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, INSARAG and the Platform operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of the Platform after changes constitutes acceptance of the modified terms.
          </p>

          <h2>11. Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to the Platform immediately, without prior notice, for any breach of these Terms of Use.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with international standards for humanitarian training programs.
          </p>

          <h2>13. Contact Information</h2>
          <p>
            For questions about these Terms of Use, please contact:
          </p>
          <p className="bg-gray-50 p-4 rounded border">
            ICMS Learning Platform Support<br />
            Email: support@icmslearning.org<br />
            Website: www.icmslearning.org
          </p>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600">
              By using the ICMS Learning Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}