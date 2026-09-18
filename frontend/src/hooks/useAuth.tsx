import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isPortariaEmail } from '../services/portaria'
import { supabase } from '../services/supabase'

type Profile = {
  role: string | null
  approved: boolean
}

type AuthContextValue = {
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isApproved: boolean
  isPortaria: boolean
  role: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function loadProfile(userId: string): Promise<Profile> {
  const withApproved = await supabase.from('profiles').select('role, approved').eq('id', userId).single()
  if (!withApproved.error) {
    return {
      role: withApproved.data?.role ?? null,
      approved: withApproved.data?.approved !== false
    }
  }

  const fallback = await supabase.from('profiles').select('role').eq('id', userId).single()
  return {
    role: fallback.data?.role ?? null,
    approved: true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function applySession(nextSession: Session | null) {
      setSession(nextSession)
      if (!nextSession?.user.id) {
        setProfile(null)
        setLoading(false)
        return
      }

      const nextProfile = await loadProfile(nextSession.user.id)
      if (mounted) {
        setProfile(nextProfile)
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) void applySession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) void applySession(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) throw error
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isPortaria = profile?.role === 'PORTARIA' || isPortariaEmail(session?.user.email)

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      isAuthenticated: !!session,
      isApproved: profile?.approved === true,
      isPortaria,
      role: profile?.role ?? null,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
