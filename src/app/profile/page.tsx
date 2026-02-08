import { Metadata } from 'next'
import ProfileEditClient from '@/components/profile/ProfileEditClient'

export const metadata: Metadata = {
  title: 'Edit Profile - ICMS Learning',
  description: 'Edit your ICMS Learning account profile',
}

export default function ProfilePage() {
  return <ProfileEditClient />
}