import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'

const idleModules = import.meta.glob(
  '../assets/animations/idle/*.png',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

const rascaModules = import.meta.glob(
  '../assets/animations/rasca/*.png',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

const asienteModules = import.meta.glob(
  '../assets/animations/asiente/*.png',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

const libretatModules = import.meta.glob(
  '../assets/animations/libreta/*.png',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

const toFrames = (m: Record<string, string>) =>
  Object.keys(m).sort().map(k => m[k])

const IDLE    = { frames: toFrames(idleModules),     duration: 3600 }
const RASCA   = { frames: toFrames(rascaModules),    duration: 2500 }
const ASIENTE = { frames: toFrames(asienteModules),  duration: 2000 }
const LIBRETA = { frames: toFrames(libretatModules), duration: 4000 }

const LISTENING_ANIMS = [RASCA, ASIENTE, LIBRETA]

export type AnimState = 'idle' | 'listening' | 'thinking' | 'responding'

export function useAnimation(state: AnimState): string {
  const [src, setSrc] = useState(IDLE.frames[0] ?? '')

  const tamagotchiMode = useStore((s) => s.tamagotchiMode)
  const duckHappiness  = useStore((s) => s.duckHappiness)
  const isFuriousRef   = useRef(false)
  useEffect(() => {
    isFuriousRef.current = tamagotchiMode && duckHappiness < 20
  }, [tamagotchiMode, duckHappiness])

  useEffect(() => {
    let active = true
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    const playAnim = async (anim: { frames: string[]; duration: number }) => {
      const ms = Math.floor(anim.duration / anim.frames.length)
      for (const frame of anim.frames) {
        if (!active) return
        setSrc(frame)
        await wait(ms)
      }
    }

    // Idle: loop idle animation continuously, but every 8–15 s play one
    // random expressive animation then go back to the idle loop.
    // When furious: shorter intervals (2–5 s) and only rasca.
    const runIdle = async () => {
      const idleMs = Math.floor(IDLE.duration / IDLE.frames.length)
      const nextDelay = () => isFuriousRef.current
        ? 2000 + Math.random() * 3000
        : 8000 + Math.random() * 7000
      let triggerAt = Date.now() + nextDelay()

      while (active) {
        for (const frame of IDLE.frames) {
          if (!active) return
          setSrc(frame)
          await wait(idleMs)
        }
        if (Date.now() >= triggerAt) {
          const anim = isFuriousRef.current
            ? RASCA
            : LISTENING_ANIMS[Math.floor(Math.random() * LISTENING_ANIMS.length)]
          await playAnim(anim)
          triggerAt = Date.now() + nextDelay()
        }
      }
    }

    // Listening: cycle rasca / asiente / libreta with a short pause between each.
    const runListening = async () => {
      let last = -1
      while (active) {
        let idx: number
        do { idx = Math.floor(Math.random() * LISTENING_ANIMS.length) } while (idx === last)
        last = idx
        await playAnim(LISTENING_ANIMS[idx])
        if (!active) return
        await wait(800 + Math.random() * 700)
      }
    }

    // Thinking: loop rasca (scratching head = thinking).
    const runThinking = async () => {
      while (active) await playAnim(RASCA)
    }

    if      (state === 'idle')      runIdle()
    else if (state === 'listening') runListening()
    else if (state === 'thinking')  runThinking()
    else                            runIdle() // responding → idle loop

    return () => { active = false }
  }, [state])

  return src
}
