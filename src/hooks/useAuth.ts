import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const ADMIN_KEY = 'pa_is_admin'

export function setAdminFlag(value: boolean) {
  if (value) {
    localStorage.setItem(ADMIN_KEY, '1')
  } else {
    localStorage.removeItem(ADMIN_KEY)
  }
}

interface AuthState {
  user: User | null
  isAdmin: boolean
  loading: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  // Read isAdmin immediately from localStorage — set by Login after a successful role check
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_KEY) === '1')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      // If there's no session, clear the admin flag
      if (!currentUser) {
        setIsAdmin(false)
        setAdminFlag(false)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (!currentUser) {
        setIsAdmin(false)
        setAdminFlag(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, isAdmin, loading }
}
