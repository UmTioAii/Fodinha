import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '@/supabase/auth'

export function ResetPasswordScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const err = await resetPassword(email)
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-[var(--color-surface)] p-6 rounded-xl border border-white/10"
      >
        <h1 className="text-2xl font-bold">Recuperar senha</h1>

        {sent ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Se o e-mail existir, você receberá um link de recuperação.
          </p>
        ) : (
          <>
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
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 rounded-md bg-[var(--color-accent)] text-black font-semibold disabled:opacity-60"
            >
              {busy ? 'Enviando...' : 'Enviar link'}
            </button>
          </>
        )}

        <Link to="/login" className="block text-center text-sm text-[var(--color-accent)]">
          Voltar para login
        </Link>
      </form>
    </div>
  )
}
