'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ProfileData = {
  title: 'mr' | 'mrs' | 'ms'
  first_name: string
  middle_name: string
  last_name: string
  username: string
  email: string
  country: string
  organization: string
  organization_country: string
  job_title: string
  usar_role: string
  team_type: string
  years_experience: string
  phone: string
  timezone: string
  preferred_language: 'en' | 'es'
  email_notifications: boolean
  notify_new_courses: boolean
}

export default function ProfileEditClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    title: 'mr',
    first_name: '',
    middle_name: '',
    last_name: '',
    username: '',
    email: '',
    country: '',
    organization: '',
    organization_country: '',
    job_title: '',
    usar_role: '',
    team_type: '',
    years_experience: '',
    phone: '',
    timezone: 'UTC',
    preferred_language: 'en',
    email_notifications: true,
    notify_new_courses: true,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth?tab=signin')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (profile) {
          setProfileData({
            title: profile.title || 'mr',
            first_name: profile.first_name || '',
            middle_name: profile.middle_name || '',
            last_name: profile.last_name || '',
            username: profile.username || '',
            email: profile.email || '',
            country: profile.country || '',
            organization: profile.organization || '',
            organization_country: profile.organization_country || '',
            job_title: profile.job_title || '',
            usar_role: profile.usar_role || '',
            team_type: profile.team_type || '',
            years_experience: profile.years_experience?.toString() || '',
            phone: profile.phone || '',
            timezone: profile.timezone || 'UTC',
            preferred_language: profile.preferred_language || 'en',
            email_notifications: profile.email_notifications ?? true,
            notify_new_courses: profile.notify_new_courses ?? true,
          })
        }
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to load profile.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Prepare update data
      const updateData: any = {
        title: profileData.title,
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        country: profileData.country.trim(),
        preferred_language: profileData.preferred_language,
        email_notifications: profileData.email_notifications,
        notify_new_courses: profileData.notify_new_courses,
      }

      // Add optional fields only if provided
      if (profileData.middle_name.trim()) updateData.middle_name = profileData.middle_name.trim()
      if (profileData.organization.trim()) updateData.organization = profileData.organization.trim()
      if (profileData.organization_country.trim()) updateData.organization_country = profileData.organization_country.trim()
      if (profileData.job_title.trim()) updateData.job_title = profileData.job_title.trim()
      if (profileData.usar_role.trim()) updateData.usar_role = profileData.usar_role.trim()
      if (profileData.team_type) updateData.team_type = profileData.team_type
      if (profileData.years_experience) {
        const years = parseInt(profileData.years_experience)
        if (!isNaN(years) && years >= 0 && years <= 99) {
          updateData.years_experience = years
        }
      }
      if (profileData.phone.trim()) updateData.phone = profileData.phone.trim()
      if (profileData.timezone) updateData.timezone = profileData.timezone

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      })

      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-600 text-sm mt-1">
            Update your personal information and preferences
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value as 'mr' | 'mrs' | 'ms' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mr">Mr.</option>
                  <option value="mrs">Mrs.</option>
                  <option value="ms">M.s</option>
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={profileData.middle_name}
                  onChange={(e) => setProfileData({ ...profileData, middle_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Username (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={profileData.organization}
                  onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Organization Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Country
                </label>
                <input
                  type="text"
                  value={profileData.organization_country}
                  onChange={(e) => setProfileData({ ...profileData, organization_country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={profileData.job_title}
                  onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* USAR Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  USAR Team/Role
                </label>
                <input
                  type="text"
                  value={profileData.usar_role}
                  onChange={(e) => setProfileData({ ...profileData, usar_role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BRA-10"
                />
              </div>

              {/* Team Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Type
                </label>
                <select
                  value={profileData.team_type}
                  onChange={(e) => setProfileData({ ...profileData, team_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select team type</option>
                  <option value="assessment">Assessment</option>
                  <option value="coordination">Coordination</option>
                  <option value="emt">EMT</option>
                  <option value="environmental">Environmental</option>
                  <option value="firefighting">Firefighting</option>
                  <option value="flood">Flood</option>
                  <option value="logistics">Logistics</option>
                  <option value="shelter">Shelter</option>
                  <option value="telecom">Telecom</option>
                  <option value="usar">USAR</option>
                  <option value="wash">WASH</option>
                </select>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={profileData.years_experience}
                  onChange={(e) => setProfileData({ ...profileData, years_experience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-99"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preferred Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Language <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={profileData.preferred_language}
                  onChange={(e) => setProfileData({ ...profileData, preferred_language: e.target.value as 'en' | 'es' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (US)</option>
                  <option value="America/Chicago">Central Time (US)</option>
                  <option value="America/Denver">Mountain Time (US)</option>
                  <option value="America/Los_Angeles">Pacific Time (US)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Australia/Sydney">Sydney</option>
                  <option value="America/Sao_Paulo">São Paulo</option>
                </select>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Notification Preferences</h3>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.email_notifications}
                  onChange={(e) => setProfileData({ ...profileData, email_notifications: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Receive email notifications</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.notify_new_courses}
                  onChange={(e) => setProfileData({ ...profileData, notify_new_courses: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Notify me about new courses</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}