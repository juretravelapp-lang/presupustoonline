import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'operador'
  nombre: string
}

interface AuthState {
  user:         AuthUser | null
  loading:      boolean
  initialized:  boolean
  login:        (email: string, pass: string) => Promise<{ success: boolean; error?: string }>
  logout:       () => Promise<void>
  initialize:   () => void
  bypassLogin:  (role: 'admin' | 'operador') => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:        null,
  loading:     true,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ loading: false })
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  bypassLogin: (role) => {
    set({
      user: {
        id: 'mock-id-' + role,
        email: role === 'admin' ? 'admin@juretravel.com' : 'operador@juretravel.com',
        role,
        nombre: role === 'admin' ? 'Dueño Mock' : 'Operador Mock',
      },
      loading: false,
    })
  },

  initialize: () => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        const email = u.email || ''
        const role = email === 'admin@juretravel.com' ? 'admin' : 'operador'
        const rawName = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0]
        const nombre = rawName.charAt(0).toUpperCase() + rawName.slice(1)

        set({
          user: { id: u.id, email, role, nombre },
          loading: false,
          initialized: true,
        })
      } else {
        set({ user: null, loading: false, initialized: true })
      }
    })

    // Listen to changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        const email = u.email || ''
        const role = email === 'admin@juretravel.com' ? 'admin' : 'operador'
        const rawName = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0]
        const nombre = rawName.charAt(0).toUpperCase() + rawName.slice(1)

        set({
          user: { id: u.id, email, role, nombre },
          loading: false,
        })
      } else {
        set({ user: null, loading: false })
      }
    })
  },
}))
