import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PersonalityMode = 'programmer' | 'general'

export type HistoryEntry = { role: 'user' | 'assistant'; content: string }

export type HistoryItem = {
  id: string
  timestamp: number
  question: string
  answer: string
  model: string
}

interface AppState {
  // ── persisted ──────────────────────────────────────────────
  aiModel: string
  personalityMode: PersonalityMode
  crueltyLevel: number
  conversationMemory: boolean
  pomodorosCompleted: number
  totalEurekas: number
  tamagotchiMode: boolean
  duckHappiness: number
  lastInteraction: number
  isTopPosition: boolean
  lastPosition: string
  gamesEnabled: boolean
  gamesInterval: number
  responseLanguage: string
  historyLog: HistoryItem[]
  maxHistoryItems: number
  aiProvider: string
  customUrl: string

  // ── session-only (not persisted) ───────────────────────────
  conversationHistory: HistoryEntry[]
  conversationSummary: string

  // ── actions ────────────────────────────────────────────────
  setAiModel: (model: string) => void
  setPersonalityMode: (mode: PersonalityMode) => void
  setCrueltyLevel: (level: number) => void
  toggleConversationMemory: () => void
  setConversationHistory: (h: HistoryEntry[]) => void
  setConversationSummary: (s: string) => void
  clearConversationData: () => void
  incrementEurekas: () => void
  incrementPomodoros: () => void
  toggleTamagotchi: () => void
  setDuckHappiness: (h: number) => void
  setLastInteraction: (t: number) => void
  setIsTopPosition: (v: boolean) => void
  setLastPosition: (pos: string) => void
  toggleGamesEnabled: () => void
  setGamesInterval: (minutes: number) => void
  setResponseLanguage: (lang: string) => void
  addToHistory: (question: string, answer: string, model: string) => void
  deleteHistoryItem: (id: string) => void
  clearHistory: () => void
  setAiProvider: (provider: string) => void
  setCustomUrl: (url: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      aiModel:             'lm-studio-local',
      personalityMode:     'programmer',
      crueltyLevel:        50,
      conversationMemory:  false,
      pomodorosCompleted:  0,
      totalEurekas:        0,
      tamagotchiMode:      false,
      duckHappiness:       75,
      lastInteraction:     Date.now(),
      isTopPosition:       false,
      lastPosition:        'bottom-right',
      gamesEnabled:        true,
      gamesInterval:       25,
      responseLanguage:    'es',
      historyLog:          [],
      maxHistoryItems:     50,
      aiProvider:          'lmstudio',
      customUrl:           '',
      conversationHistory: [],
      conversationSummary: '',

      setAiModel:            (model)   => set({ aiModel: model }),
      setPersonalityMode:    (mode)    => set({ personalityMode: mode }),
      setCrueltyLevel:       (level)   => set({ crueltyLevel: level }),
      toggleConversationMemory:         () => set((s) => ({ conversationMemory: !s.conversationMemory })),
      setConversationHistory:(h)       => set({ conversationHistory: h }),
      setConversationSummary:(s)       => set({ conversationSummary: s }),
      clearConversationData:            () => set({ conversationHistory: [], conversationSummary: '' }),
      incrementEurekas:  () => set((s) => ({ totalEurekas:        s.totalEurekas        + 1 })),
      incrementPomodoros:() => set((s) => ({ pomodorosCompleted:  s.pomodorosCompleted  + 1 })),
      toggleTamagotchi:  () => set((s) => ({ tamagotchiMode:      !s.tamagotchiMode })),
      setDuckHappiness:  (h)           => set({ duckHappiness: h }),
      setLastInteraction:(t)           => set({ lastInteraction: t }),
      setIsTopPosition:  (v)           => set({ isTopPosition: v }),
      setLastPosition:   (pos)         => set({ lastPosition: pos }),
      toggleGamesEnabled:  () => set((s) => ({ gamesEnabled: !s.gamesEnabled })),
      setGamesInterval:    (minutes) => set({ gamesInterval: minutes }),
      setResponseLanguage: (lang)    => set({ responseLanguage: lang }),
      addToHistory: (question, answer, model) => set((s) => ({
        historyLog: [
          { id: Date.now().toString(), timestamp: Date.now(), question, answer, model },
          ...s.historyLog,
        ].slice(0, s.maxHistoryItems),
      })),
      deleteHistoryItem: (id) => set((s) => ({
        historyLog: s.historyLog.filter((item) => item.id !== id),
      })),
      clearHistory:    () => set({ historyLog: [] }),
      setAiProvider:   (provider) => set({ aiProvider: provider }),
      setCustomUrl:    (url)      => set({ customUrl: url }),
    }),
    {
      name: 'debugduck-storage',
      // Only persist preferences — history/summary are session-only.
      partialize: (s) => ({
        aiModel:            s.aiModel,
        personalityMode:    s.personalityMode,
        crueltyLevel:       s.crueltyLevel,
        conversationMemory: s.conversationMemory,
        pomodorosCompleted: s.pomodorosCompleted,
        totalEurekas:       s.totalEurekas,
        tamagotchiMode:     s.tamagotchiMode,
        duckHappiness:      s.duckHappiness,
        lastInteraction:    s.lastInteraction,
        isTopPosition:      s.isTopPosition,
        lastPosition:       s.lastPosition,
        gamesEnabled:       s.gamesEnabled,
        gamesInterval:      s.gamesInterval,
        responseLanguage:   s.responseLanguage,
        historyLog:         s.historyLog,
        maxHistoryItems:    s.maxHistoryItems,
        aiProvider:         s.aiProvider,
        customUrl:          s.customUrl,
      }),
    }
  )
)
