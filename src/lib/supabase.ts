import { createClient } from '@supabase/supabase-js'

// ─── Admin Supabase — auth + contact_submissions ──────────────────────────
const adminUrl = import.meta.env.VITE_SUPABASE_URL as string
const adminKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!adminUrl || !adminKey) {
  throw new Error('Missing admin Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(adminUrl, adminKey)

// ─── Portfolio Supabase — portfolio_content read/write ─────────────────────
const portfolioUrl = import.meta.env.VITE_PORTFOLIO_SUPABASE_URL as string
const portfolioKey = import.meta.env.VITE_PORTFOLIO_SUPABASE_ANON_KEY as string

if (!portfolioUrl || !portfolioKey) {
  throw new Error('Missing portfolio Supabase env vars. Check VITE_PORTFOLIO_SUPABASE_URL and VITE_PORTFOLIO_SUPABASE_ANON_KEY in .env')
}

export const portfolioSupabase = createClient(portfolioUrl, portfolioKey)
