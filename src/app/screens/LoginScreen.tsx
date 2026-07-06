import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithPassword } from '@/supabase/auth'
import { useAuthStore } from '@/app/providers/authStore'
import { isSupabaseConfigured } from '@/supabase/client'

export function LoginScreen() {
  const navigate = useNavigate()
  const enterAsGuest = useAuthStore((s) => s.enterAsGuest)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await signInWithPassword(email, password)
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/')
  }

  function handleGuest() {
    enterAsGuest()
    navigate('/')
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-[var(--color-surface)] p-6 rounded-xl border border-white/10"
      >
        <header className="text-center space-y-1">
          <div className="mx-auto w-12 h-16 rounded-md bg-[var(--color-accent)]" aria-hidden />
          <h1 className="text-2xl font-bold">Fodinha</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Entrar na sua conta</p>
        </header>

        {!isSupabaseConfigured && (
          <p className="text-xs text-amber-400/80">
            Supabase ainda não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          </p>
        )}

        <label className="block">
          <span className="text-xs text-[var(--color-text-muted)]">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md bg-black/40 border border-white/10"
          />
        </label>

        <label className="block">
          <span className="text-xs text-[var(--color-text-muted)]">Senha</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md bg-black/40 border border-white/10"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded-md bg-[var(--color-accent)] text-black font-semibold disabled:opacity-60"
        >
          {busy ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="flex justify-between text-sm">
          <Link to="/cadastro" className="text-[var(--color-accent)]">Criar conta</Link>
          <Link to="/recuperar" className="text-[var(--color-text-muted)]">Esqueci minha senha</Link>
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="w-full py-2 rounded-md border border-white/10 text-sm"
        >
          Conectar como Convidado
        </button>
      </form>
    </div>
  )
}
