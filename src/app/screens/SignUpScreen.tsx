import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '@/supabase/auth'

export function SignUpScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await signUp(email, password, username)
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/login')
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-[var(--color-surface)] p-6 rounded-xl border border-white/10"
      >
        <h1 className="text-2xl font-bold">Criar conta</h1>

        <label className="block">
          <span className="text-xs text-[var(--color-text-muted)]">Nome de usuário</span>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md bg-black/40 border border-white/10"
          />
        </label>

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
            minLength={6}
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
          {busy ? 'Criando...' : 'Criar conta'}
        </button>

        <Link to="/login" className="block text-center text-sm text-[var(--color-accent)]">
          Voltar para login
        </Link>
      </form>
    </div>
  )
}
