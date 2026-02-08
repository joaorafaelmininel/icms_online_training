import type { Language, UserRole, AccountStatus, TeamType, Title } from './database'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          title: Title
          first_name: string
          middle_name: string | null
          last_name: string
          email: string
          country: string
          preferred_language: Language
          organization: string | null
          organization_country: string | null
          job_title: string | null
          usar_role: string | null
          team_type: TeamType | null
          years_experience: number | null
          user_role: UserRole
          account_status: AccountStatus
          profile_completed: boolean
          terms_accepted: boolean
          terms_accepted_at: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          title: Title
          first_name: string
          middle_name?: string | null
          last_name: string
          email: string
          country: string
          preferred_language?: Language
          organization?: string | null
          organization_country?: string | null
          job_title?: string | null
          usar_role?: string | null
          team_type?: TeamType | null
          years_experience?: number | null
          user_role?: UserRole
          account_status?: AccountStatus
          profile_completed?: boolean
          terms_accepted?: boolean
          terms_accepted_at?: string | null
        }
        Update: {
          username?: string
          title?: Title
          first_name?: string
          middle_name?: string | null
          last_name?: string
          country?: string
          preferred_language?: Language
          organization?: string | null
          organization_country?: string | null
          job_title?: string | null
          usar_role?: string | null
          team_type?: TeamType | null
          years_experience?: number | null
          user_role?: UserRole
          account_status?: AccountStatus
          profile_completed?: boolean
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          last_login_at?: string | null
        }
      }

      // 👉 depois podemos adicionar courses, enrollments etc.
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
