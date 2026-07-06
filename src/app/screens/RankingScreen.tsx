import { Link } from 'react-router-dom'

export function RankingScreen() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-black/60">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold">Ranking</h1>
      </div>
      <p className="text-[var(--color-text-muted)] text-sm">
        Placeholder da Fase 00. Abas Multiplayer e Carreira chegam na Fase 09.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <section className="p-4 rounded-md bg-[var(--color-surface)] border border-white/10">
          <h2 className="font-semibold mb-2">Multiplayer</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Sem dados ainda.</p>
        </section>
        <section className="p-4 rounded-md bg-[var(--color-surface)] border border-white/10">
          <h2 className="font-semibold mb-2">Carreira</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Sem dados ainda.</p>
        </section>
      </div>
    </div>
  )
}
