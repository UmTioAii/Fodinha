import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/providers/authStore'
import { signOut } from '@/supabase/auth'

export function MenuScreen() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const signOutAndReset = useAuthStore((s) => s.signOutAndReset)

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      signOutAndReset()
      navigate('/login')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold">Fodinha</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Preveja suas vazas. Sobreviva às rodadas. Vença a mesa.
        </p>
      </section>

      <div className="grid gap-4">
        <MenuButton to="/jogar" label="Jogar" hint="Partida local contra IA" />
        <MenuButton
          to="/multiplayer"
          label="Multiplayer"
          hint={role === 'GUEST' ? 'Requer conta' : 'Partidas online'}
          disabled={false}
        />
        <MenuButton to="/configuracoes" label="Configurações" hint="Preferências" />
        <MenuButton to="/ranking" label="Ranking" hint="Multiplayer e Carreira" />
      </div>

      {role === 'AUTHENTICATED' && (
        <button
          onClick={handleSignOut}
          className="text-sm text-[var(--color-text-muted)] underline"
        >
          Sair
        </button>
      )}

      {role === 'GUEST' && (
        <div className="text-center text-sm">
          <Link to="/login" className="text-[var(--color-accent)]">Entrar</Link>
          {' · '}
          <Link to="/cadastro" className="text-[var(--color-accent)]">Criar conta</Link>
        </div>
      )}
    </div>
  )
}

function MenuButton({
  to,
  label,
  hint,
  disabled = false,
}: {
  to: string
  label: string
  hint: string
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <div className="opacity-50 px-5 py-4 rounded-xl border border-white/10 bg-[var(--color-surface)]">
        <div className="text-lg font-semibold">{label}</div>
        <div className="text-xs text-[var(--color-text-muted)]">{hint}</div>
      </div>
    )
  }
  return (
    <Link
      to={to}
      className="block px-5 py-4 rounded-xl border border-white/10 bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="text-lg font-semibold">{label}</div>
      <div className="text-xs text-[var(--color-text-muted)]">{hint}</div>
    </Link>
  )
}
