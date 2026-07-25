// ─── Contact Submissions ───────────────────────────────────────────────────

export interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}

// ─── Profile Section (mirrors portfolio portfolio_content section='profile') ─

export interface SocialLink {
  label: string
  href: string
}

export interface ProfileSection {
  name: string
  role: string
  tagline: string
  location: string
  coords: string
  email: string
  socials: SocialLink[]
}

// ─── Portfolio Content Row ─────────────────────────────────────────────────

export interface PortfolioContentRow {
  id: string
  section: string
  data: unknown
  updated_at: string
  created_at: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────

export type AppRole = 'admin' | 'editor' | 'user'
