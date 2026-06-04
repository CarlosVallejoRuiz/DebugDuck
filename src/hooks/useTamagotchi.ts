import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '../store'

export type DuckMood = { emoji: string; label: string }

export function getDuckMood(happiness: number): DuckMood {
  if (happiness >= 70) return { emoji: '😊', label: 'Feliz' }
  if (happiness >= 40) return { emoji: '😐', label: 'Neutral' }
  if (happiness >= 20) return { emoji: '😤', label: 'Malhumorado' }
  return { emoji: '😡', label: 'Furioso' }
}

export function useTamagotchi() {
  const tamagotchiMode    = useStore((s) => s.tamagotchiMode)
  const duckHappiness     = useStore((s) => s.duckHappiness)
  const lastInteraction   = useStore((s) => s.lastInteraction)
  const setDuckHappiness  = useStore((s) => s.setDuckHappiness)
  const setLastInteraction = useStore((s) => s.setLastInteraction)

  // Keep a ref so interval callbacks always see the latest happiness value.
  const happinessRef = useRef(duckHappiness)
  useEffect(() => { happinessRef.current = duckHappiness }, [duckHappiness])

  // Auto-decay: check every minute for neglect (>1h without interaction).
  useEffect(() => {
    if (!tamagotchiMode) return
    const interval = setInterval(() => {
      const hoursSince = (Date.now() - lastInteraction) / 3_600_000
      if (hoursSince > 1) {
        const penalty = Math.floor(hoursSince) * 8
        setDuckHappiness(Math.max(5, happinessRef.current - penalty))
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [tamagotchiMode, lastInteraction, setDuckHappiness])

  const onEureka = useCallback(() => {
    if (!tamagotchiMode) return
    setDuckHappiness(Math.min(100, happinessRef.current + 10))
    setLastInteraction(Date.now())
  }, [tamagotchiMode, setDuckHappiness, setLastInteraction])

  const onPomodoro = useCallback(() => {
    if (!tamagotchiMode) return
    setDuckHappiness(Math.min(100, happinessRef.current + 5))
    setLastInteraction(Date.now())
  }, [tamagotchiMode, setDuckHappiness, setLastInteraction])

  // Call with word count of the user's question.
  const onInteraction = useCallback((wordCount: number) => {
    if (!tamagotchiMode) return
    setLastInteraction(Date.now())
    if (wordCount < 4) {
      setDuckHappiness(Math.max(0, happinessRef.current - 2))
    } else if (wordCount > 8) {
      setDuckHappiness(Math.min(100, happinessRef.current + 3))
    }
  }, [tamagotchiMode, setDuckHappiness, setLastInteraction])

  const mood = getDuckMood(duckHappiness)

  return { duckHappiness, mood, onEureka, onPomodoro, onInteraction }
}
