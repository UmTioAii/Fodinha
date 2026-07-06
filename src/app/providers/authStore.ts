import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/supabase/client'

export type AuthRole = 'GUEST' | 'AUTHENTICATED'

interface AuthState {
  role: AuthRole
  user: User | null
  session: Session | null
  loading: boolean
  setSession: (session: Session | null) => void
  enterAsGuest: () => void
  signOutAndReset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'GUEST',
  user: null,
  session: null,
  loading: true,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      role: session ? 'AUTHENTICATED' : 'GUEST',
      loading: false,
    }),
  enterAsGuest: () =>
    set({ role: 'GUEST', user: null, session: null, loading: false }),
  signOutAndReset: () => set({ role: 'GUEST', user: null, session: null }),
}))

export async function bootstrapAuth(): Promise<void> {
  useAuthStore.setState({ loading: true })
  const { data } = await supabase.auth.getSession()
  useAuthStore.getState().setSession(data.session)
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session)
  })
}
