import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './client'

export type AuthError = { message: string }

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ data: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { data: null, error: { message: error.message } }
  return { data: data.session, error: null }
}

export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<{ data: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })
  if (error) return { data: null, error: { message: error.message } }
  return { data: data.user, error: null }
}

export async function resetPassword(email: string): Promise<AuthError | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  return error ? { message: error.message } : null
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
