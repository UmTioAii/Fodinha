import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePveGameStore } from '@/pve/gameStore'
import { pickRandomBots, PERSONALITIES } from '@/ai'
import type { DeckMode } from '@/game-engine/types'
import type { Difficulty, BotIdentity } from '@/shared/constants/cards'

export function GameSetupScreen() {
  const navigate = useNavigate()
  const startGame = usePveGameStore((s) => s.startGame)

  const [playerName, setPlayerName] = useState('Jogador')
  const [deckMode, setDeckMode] = useState<DeckMode>('CLEAN')
  const [playerCount, setPlayerCount] = useState(4)
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM')
  const [selectedBots, setSelectedBots] = useState<BotIdentity[]>([])

  // Randomize bots when player count changes
  useEffect(() => {
    const botsNeeded = playerCount - 1
    setSelectedBots(pickRandomBots(botsNeeded))
  }, [playerCount])

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    startGame({
      playerName: playerName || 'Jogador',
      deckMode,
      playerCount,
      botDifficulty: difficulty,
      botIdentities: selectedBots,
    })
    navigate('/jogo')
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-accent)] mb-2">Nova Partida (PVE)</h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            Jogue contra a Inteligência Artificial.
          </p>
        </header>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Esquerda: Configurações */}
            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium mb-1">Seu Nome</span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  placeholder="Jogador"
                  maxLength={12}
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-1">Baralho</span>
                <select
                  value={deckMode}
                  onChange={(e) => setDeckMode(e.target.value as DeckMode)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                >
                  <option value="CLEAN">Limpo (24 cartas - Q J K A 2 3)</option>
                  <option value="DIRTY">Sujo (40 cartas - 4 até 3)</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-1">
                  Jogadores ({playerCount})
                </span>
                <input
                  type="range"
                  min="2"
                  max={deckMode === 'CLEAN' ? "4" : "8"}
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2</span>
                  <span>{deckMode === 'CLEAN' ? '4 máx' : '8 máx'}</span>
                </div>
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-1">Dificuldade</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                >
                  <option value="EASY">Fácil (cometem mais erros)</option>
                  <option value="MEDIUM">Médio (jogam com lógica padrão)</option>
                  <option value="HARD">Difícil (precisos e impiedosos)</option>
                </select>
              </label>
            </div>

            {/* Direita: Bots Sorteados */}
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center justify-between">
                <span>Adversários</span>
                <button
                  type="button"
                  onClick={() => setSelectedBots(pickRandomBots(playerCount - 1))}
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  Sortear Novamente
                </button>
              </h2>
              <div className="space-y-2">
                {selectedBots.map((id) => {
                  const p = PERSONALITIES[id]
                  return (
                    <div key={id} className="flex flex-col p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="font-semibold text-amber-200 text-sm">{p.displayName}</span>
                      <span className="text-[10px] text-gray-400 italic mt-0.5 leading-tight">{p.description}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-[var(--color-accent)] text-black font-bold text-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 active:scale-95"
          >
            Iniciar Partida
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2 text-sm text-[var(--color-text-muted)] hover:text-white"
          >
            Voltar ao Menu
          </button>
        </form>
      </div>
    </div>
  )
}
