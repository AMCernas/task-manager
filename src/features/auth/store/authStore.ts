import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const initialState = {
  user: null,
  session: null,
  loading: true,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ 
      session, 
      user: session?.user ?? null, 
      loading: false 
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        session, 
        user: session?.user ?? null 
      })
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error as Error | null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))

export const getAuthUserId = () => useAuthStore.getState()?.user?.id ?? null
