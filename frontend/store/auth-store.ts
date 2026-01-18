/**
 * Authentication store using Zustand
 */
import { create } from 'zustand'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  login: () => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  session: null,
  isLoading: true,

  setUser: user => set({ user }),

  setSession: session => set({ session, user: session?.user || null }),

  login: async () => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Invalid API key: Supabase環境変数が未設定です。.env.local に NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定して dev サーバを再起動してください。'
      )
    }
    // Google OAuth login
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      throw error
    }

    set({ user: null, session: null })
  },

  initialize: async () => {
    set({ isLoading: true })

    if (!isSupabaseConfigured) {
      // Demo mode / unconfigured auth
      set({ session: null, user: null, isLoading: false })
      return
    }

    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({ session, user: session?.user || null, isLoading: false })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user || null })
      })
    } catch {
      set({ session: null, user: null, isLoading: false })
    }
  },
}))
