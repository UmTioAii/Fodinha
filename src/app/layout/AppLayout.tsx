import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/app/providers/authStore'

export function AppLayout({ children }: { children: ReactNode }) {
  const role = useAuthStore((s) => s.role)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-full flex flex-col bg-[var(--color-bg)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block w-8 h-10 rounded-md bg-[var(--color-accent)] shadow-inner"
            title="Fodinha"
          />
          <strong className="tracking-wide text-lg">Fodinha</strong>
        </Link>
        <ProfileBadge role={role} name={user?.email ?? 'Convidado'} />
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  )
}

function ProfileBadge({ role, name }: { role: 'GUEST' | 'AUTHENTICATED'; name: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 h-8 rounded-full bg-white/10" aria-hidden />
      <div className="leading-tight text-right">
        <div className="text-[var(--color-text)]">{name}</div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {role === 'AUTHENTICATED' ? 'Logado' : 'Convidado'}
        </div>
      </div>
    </div>
  )
}
