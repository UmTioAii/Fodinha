import type { ThemeMode, TableColor, BackgroundStyle, CardBackStyle, CardFaceStyle } from '@/shared/constants/cards'

export interface UserSettings {
  themeMode: ThemeMode
  tableColor: TableColor
  backgroundStyle: BackgroundStyle
  cardBackStyle: CardBackStyle
  cardFaceStyle: CardFaceStyle
}

export const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'DARK',
  tableColor: 'GREEN_CLASSIC',
  backgroundStyle: 'DARK_TABLE',
  cardBackStyle: 'FODINHA_DEFAULT',
  cardFaceStyle: 'CLASSIC',
}

const STORAGE_KEY = 'fodinha:settings'

// Convidados usam localStorage. Logados usam Supabase (Fase 09).
export function loadLocalSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<UserSettings>) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveLocalSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}
