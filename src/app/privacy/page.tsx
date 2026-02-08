import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - ICMS Learning',
  description: 'ICMS Learning Platform Privacy Policy',
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: February 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-blue max-w-none">
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how the ICMS Learning Platform (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects your personal information when you use our online training services.
          </p>
          <p>
            We are committed to protecting your privacy and ensuring the security of your personal information in accordance with international data protection standards.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Personal Information</h3>
          <p>When you register for an account, we collect:</p>
          <ul>
            <li><strong>Basic Information:</strong> Title, first name, middle name, last name, username, email address, country</li>
            <li><strong>Professional Information:</strong> Organization, organization country, job title, USAR team/role, team type, years of experience</li>
            <li><strong>Contact Information:</strong> Phone number (optional)</li>
            <li><strong>Preferences:</strong> Preferred language, timezone, notification preferences</li>
          </ul>

          <h3>2.2 Usage Information</h3>
          <p>We automatically collect information about your use of the Platform:</p>
          <ul>
            <li>Course enrollment and progress data</li>
            <li>Quiz and exam scores</li>
            <li>Module completion status</li>
            <li>Time spent on training materials</li>
            <li>Login dates and times</li>
          </ul>

          <h3>2.3 Technical Information</h3>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Operating system</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your personal information for the following purposes:</p>
          <ul>
            <li><strong>Account Management:</strong> Creating and maintaining your user account</li>
            <li><strong>Course Delivery:</strong> Providing access to training materials and tracking your progress</li>
            <li><strong>Certification:</strong> Issuing certificates upon course completion</li>
            <li><strong>Communication:</strong> Sending course-related notifications and updates</li>
            <li><strong>Support:</strong> Responding to your questions and providing technical assistance</li>
            <li><strong>Improvement:</strong> Analyzing Platform usage to improve our services</li>
            <li><strong>Compliance:</strong> Meeting legal and regulatory requirements</li>
          </ul>

          <h2>4. Legal Basis for Processing</h2>
          <p>We process your personal information based on:</p>
          <ul>
            <li><strong>Consent:</strong> You have given explicit consent for processing your data</li>
            <li><strong>Contract:</strong> Processing is necessary to provide the training services you&apos;ve enrolled in</li>
            <li><strong>Legitimate Interest:</strong> Improving our services and ensuring Platform security</li>
            <li><strong>Legal Obligation:</strong> Compliance with applicable laws and regulations</li>
          </ul>

          <h2>5. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information. We may share your information with:</p>
          <ul>
            <li><strong>INSARAG Organizations:</strong> Your progress and certification data may be shared with relevant INSARAG entities</li>
            <li><strong>Service Providers:</strong> Third-party services that help us operate the Platform (e.g., hosting, email services)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <p>Security measures include:</p>
          <ul>
            <li>Encrypted data transmission (HTTPS/SSL)</li>
            <li>Secure password storage using industry-standard hashing</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication systems</li>
            <li>Regular data backups</li>
          </ul>

          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
          </p>
          <ul>
            <li><strong>Account Data:</strong> Retained while your account is active</li>
            <li><strong>Course Progress:</strong> Retained for historical records and certification verification</li>
            <li><strong>Certificates:</strong> Retained indefinitely for verification purposes</li>
          </ul>

          <h2>8. Your Rights</h2>
          <p>You have the following rights regarding your personal information:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data (subject to legal obligations)</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
            <li><strong>Objection:</strong> Object to certain types of data processing</li>
          </ul>

          <h2>9. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience on the Platform:
          </p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for Platform functionality (authentication, security)</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform</li>
          </ul>
          <p>
            You can manage cookie preferences through your browser settings, though disabling certain cookies may limit Platform functionality.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            As an international training platform, your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place for such transfers.
          </p>

          <h2>11. Children&apos;s Privacy</h2>
          <p>
            The Platform is intended for professional use by USAR team members and emergency response personnel. We do not knowingly collect information from individuals under 18 years of age.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            For questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact:
          </p>
          <div className="bg-gray-50 p-4 rounded border">
            <p>
              <strong>ICMS Learning Platform - Data Protection</strong><br />
              Email: privacy@icmslearning.org<br />
              Website: www.icmslearning.org
            </p>
          </div>

          <h2>14. Complaints</h2>
          <p>
            If you believe your privacy rights have been violated, you have the right to lodge a complaint with a supervisory authority in your jurisdiction.
          </p>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600">
              By using the ICMS Learning Platform, you acknowledge that you have read and understood this Privacy Policy.
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