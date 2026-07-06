import { Link } from 'react-router-dom'

export function SettingsScreen() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-black/60">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      <p className="text-[var(--color-text-muted)] text-sm">
        Placeholder da Fase 00. Tema, mesa, baralho e áudio chegam nas próximas fases.
      </p>
      <div className="grid gap-2 text-sm">
        {['Tema: DARK', 'Mesa: verde clássico', 'Fundo: escuro', 'Baralho: Fodinha padrão'].map((s) => (
          <div
            key={s}
            className="px-4 py-3 rounded-md bg-[var(--color-surface)] border border-white/10"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}
