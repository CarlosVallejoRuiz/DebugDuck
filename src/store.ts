import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PersonalityMode = 'programmer' | 'general'

export type HistoryEntry = { role: 'user' | 'assistant'; content: string }

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
      }),
    }
  )
)
