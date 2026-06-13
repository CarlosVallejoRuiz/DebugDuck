import { useState, useCallback, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import duckImg from './assets/DebugDuck.png'
import { DuckAvatar } from './components/DuckAvatar'
import { SpeechBubble, type BubblePhase } from './components/SpeechBubble'
import { SettingsPanel } from './components/SettingsPanel'
import { useVoiceRecognition } from './hooks/useVoiceRecognition'
import { useAIResponse } from './hooks/useAIResponse'
import { usePomodoro } from './hooks/usePomodoro'
import { useTamagotchi } from './hooks/useTamagotchi'
import { useWindowPosition, type Position } from './hooks/useWindowPosition'
import { useStore } from './store'
import { useTranslation } from './i18n'

const DEBUG_BUBBLE = false
const mockTranscript = ''
const mockAiResponse = ''

// startDragging() is called imperatively on mousedown — no data-tauri-drag-region
// anywhere in the tree, which prevents WKWebView from intercepting double-clicks.
const handleDragMouseDown = async (e: React.MouseEvent) => {
  if (e.button === 0) {
    e.preventDefault()
    await getCurrentWindow().startDragging()
  }
}

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showGameSuggestion, setShowGameSuggestion] = useState(false)
  const { aiResponse, isThinking, fetchResponse, clearResponse, detectedModel, refreshModel, providerStatus, autoDetect } = useAIResponse()
  const tamagotchi = useTamagotchi()
  const isTopPosition    = useStore((s) => s.isTopPosition)
  const lastPosition     = useStore((s) => s.lastPosition)
  const setDuckHappiness = useStore((s) => s.setDuckHappiness)

  const t = useTranslation()
  const { moveToPosition } = useWindowPosition()

  // Restore saved window position on startup using the same logic as the manual grid.
  useEffect(() => {
    moveToPosition(lastPosition as Position)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [shortcutFlash, setShortcutFlash] = useState(false)

  const incrementEurekas    = useStore((s) => s.incrementEurekas)
  const deleteHistoryItem   = useStore((s) => s.deleteHistoryItem)
  const clearHistory        = useStore((s) => s.clearHistory)
  const globalShortcut      = useStore((s) => s.globalShortcut)
  const gamesEnabled        = useStore((s) => s.gamesEnabled)
  const gamesInterval     = useStore((s) => s.gamesInterval)
  const personalityMode   = useStore((s) => s.personalityMode)

  const [gamesTimeLeft,   setGamesTimeLeft]   = useState(gamesInterval * 60)
  const [gamesWindowOpen, setGamesWindowOpen] = useState(false)
  const gamesTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const gamesTimeLeftRef = useRef<number>(gamesInterval * 60)

  const startGamesTimer = useCallback(() => {
    if (gamesTimerRef.current) clearInterval(gamesTimerRef.current)
    const secs = useStore.getState().gamesInterval * 60
    gamesTimeLeftRef.current = secs
    setGamesTimeLeft(secs)
    gamesTimerRef.current = setInterval(() => {
      gamesTimeLeftRef.current -= 1
      setGamesTimeLeft(gamesTimeLeftRef.current)
      if (gamesTimeLeftRef.current <= 0) {
        clearInterval(gamesTimerRef.current!)
        gamesTimerRef.current = null
        setShowGameSuggestion(true)
      }
    }, 1000)
  }, [])

  const stopGamesTimer = useCallback((reset: boolean) => {
    if (gamesTimerRef.current) {
      clearInterval(gamesTimerRef.current)
      gamesTimerRef.current = null
    }
    if (reset) {
      const secs = useStore.getState().gamesInterval * 60
      gamesTimeLeftRef.current = secs
      setGamesTimeLeft(secs)
    }
  }, [])

  // Callback passed to usePomodoro — also shows game suggestion when gamesEnabled.
  const handlePomodoroComplete = useCallback(() => {
    tamagotchi.onPomodoro()
    if (useStore.getState().gamesEnabled) {
      setShowGameSuggestion(true)
    }
  }, [tamagotchi])

  const { startPomodoro, cancelPomodoro, isRunning: pomodoroRunning, secondsLeft } = usePomodoro(handlePomodoroComplete)

  const handleVoiceResult = useCallback(
    (text: string) => {
      setDismissed(false)  // nueva petición — permitir mostrar bocadillo
      const wordCount = text.trim().split(/\s+/).length
      tamagotchi.onInteraction(wordCount)
      fetchResponse(text)
    },
    [fetchResponse, tamagotchi]
  )

  const { voiceState, transcript, startListening, reset } = useVoiceRecognition(handleVoiceResult)

  const handleDoubleClick = useCallback(() => {
    if (voiceState !== 'idle' || aiResponse) {
      setDismissed(true)
      reset()
      clearResponse()
    } else {
      clearResponse()
      startListening()
    }
  }, [voiceState, aiResponse, reset, clearResponse, startListening])

  const handleEureka = useCallback(() => {
    setDismissed(true)
    incrementEurekas()
    tamagotchi.onEureka()
    reset()
    clearResponse()
  }, [incrementEurekas, tamagotchi, reset, clearResponse])

  const handlePomo = useCallback(() => {
    setDismissed(true)
    startPomodoro()
    reset()
    clearResponse()
  }, [startPomodoro, reset, clearResponse])

  const handleHistoryOpen = useCallback(async () => {
    try { await invoke('launch_history_window') } catch (e) { console.error(e) }
  }, [])

  const handleGamesOpen = useCallback(async () => {
    try {
      await invoke('launch_games_window', { personalityMode })
      setGamesWindowOpen(true)
      stopGamesTimer(false)
    } catch (e) {
      console.error(e)
    }
  }, [stopGamesTimer, personalityMode])

  const handleGameSuggestionAccept = useCallback(async () => {
    setShowGameSuggestion(false)
    await handleGamesOpen()
  }, [handleGamesOpen])

  // Start/stop/reset the games countdown based on enabled state and interval.
  useEffect(() => {
    if (gamesEnabled) {
      startGamesTimer()
    } else {
      setShowGameSuggestion(false)
      stopGamesTimer(true)
    }
    return () => { stopGamesTimer(false) }
  }, [gamesEnabled, gamesInterval, startGamesTimer, stopGamesTimer])

  // Listen for history mutations from the history.html window.
  useEffect(() => {
    let unlistenDelete: (() => void) | undefined
    let unlistenClear:  (() => void) | undefined

    listen<{ id: string }>('history-delete', (e) => {
      deleteHistoryItem(e.payload.id)
    }).then(fn => { unlistenDelete = fn })

    listen('history-clear', () => {
      clearHistory()
    }).then(fn => { unlistenClear = fn })

    return () => { unlistenDelete?.(); unlistenClear?.() }
  }, [deleteHistoryItem, clearHistory])

  // Listen for game-result events: update happiness, reset timer, close tracking.
  useEffect(() => {
    let unlisten: (() => void) | undefined

    listen<{ completed: boolean; won: boolean; game: string }>('game-result', (event) => {
      const { completed, won, game } = event.payload
      setGamesWindowOpen(false)
      startGamesTimer()
      if (!completed) return
      let bonus = 5
      if (game === 'tictactoe') bonus = 3
      else if (won && ['quiz', 'math', 'typing'].includes(game)) bonus = 8
      const current = useStore.getState().duckHappiness
      setDuckHappiness(Math.min(100, current + bonus))
    }).then(fn => { unlisten = fn })

    return () => { unlisten?.() }
  }, [setDuckHappiness, startGamesTimer])

  // Global keyboard shortcut — re-register on mount if user stored a custom one,
  // then listen for the trigger event emitted by Rust.
  const showBubbleRef  = useRef(false)
  const isThinkingRef  = useRef(false)

  useEffect(() => {
    const DEFAULT = 'CommandOrControl+Shift+D'
    if (globalShortcut !== DEFAULT) {
      invoke('update_global_shortcut', { oldShortcut: DEFAULT, newShortcut: globalShortcut }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let unlisten: (() => void) | undefined
    listen<void>('global-shortcut-triggered', () => {
      if (showBubbleRef.current || isThinkingRef.current) return
      clearResponse()
      setShortcutFlash(true)
      setTimeout(() => {
        setShortcutFlash(false)
        startListening()
      }, 800)
    }).then(fn => { unlisten = fn })
    return () => { unlisten?.() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Offscreen canvas for per-pixel alpha sampling of the duck PNG.
  const duckCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const duckCtxRef   = useRef<CanvasRenderingContext2D | null>(null)

  // Tracks whether any interactive UI (bubble or settings) is visible.
  // Read inside the setInterval callback — must be a ref, not state.
  const uiVisibleRef = useRef(false)

  useEffect(() => {
    const img = new Image()
    img.src = duckImg
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      duckCanvasRef.current = canvas
      duckCtxRef.current = ctx
    }
  }, [])

  // Native click-through: poll cursor via Rust (works even when WKWebView ignores
  // events), then read the PNG alpha at that pixel — transparent = pass-through.
  useEffect(() => {
    let ignoring = false

    const isDuckTransparent = (winX: number, winY: number): boolean => {
      // While bubble, settings, or game suggestion are open, never ignore.
      if (uiVisibleRef.current) return false

      // Keep gear button interactive even when duck is transparent.
      const gearBtn = document.querySelector('[data-settings-btn]')
      if (gearBtn) {
        const r = gearBtn.getBoundingClientRect()
        if (winX >= r.left && winX <= r.right && winY >= r.top && winY <= r.bottom) return false
      }

      // Keep games button interactive.
      const gamesBtn = document.querySelector('[data-games-btn]')
      if (gamesBtn) {
        const r = gamesBtn.getBoundingClientRect()
        if (winX >= r.left && winX <= r.right && winY >= r.top && winY <= r.bottom) return false
      }

      // Keep history button interactive.
      const historyBtn = document.querySelector('[data-history-btn]')
      if (historyBtn) {
        const r = historyBtn.getBoundingClientRect()
        if (winX >= r.left && winX <= r.right && winY >= r.top && winY <= r.bottom) return false
      }

      const canvas = duckCanvasRef.current
      const ctx = duckCtxRef.current
      if (!canvas || !ctx) return true

      const imgEl = document.querySelector('[data-duck]') as HTMLElement | null
      if (!imgEl) return true

      const rect = imgEl.getBoundingClientRect()
      if (winX < rect.left || winX > rect.right || winY < rect.top || winY > rect.bottom) return true

      const pngX = Math.floor((winX - rect.left) / rect.width  * canvas.width)
      const pngY = Math.floor((winY - rect.top)  / rect.height * canvas.height)

      try {
        return ctx.getImageData(pngX, pngY, 1, 1).data[3] < 10
      } catch {
        return true
      }
    }

    const check = async () => {
      try {
        const [x, y] = await invoke<[number, number]>('get_cursor_pos')
        const shouldIgnore = isDuckTransparent(x, y)

        if (shouldIgnore !== ignoring) {
          ignoring = shouldIgnore
          await invoke('set_ignore_cursor', { ignore: shouldIgnore })
        }
      } catch {}
    }

    const interval = setInterval(check, 30)
    return () => clearInterval(interval)
  }, [])

  // aiResponse must be checked FIRST: voiceState stays 'processing' until
  // reset() is called, so it would otherwise block the 'response' phase.
  const derivedPhase: BubblePhase | null =
    (aiResponse && !dismissed)                 ? 'response'  :
    voiceState === 'listening'                 ? 'listening' :
    isThinking || voiceState === 'processing'  ? 'thinking'  :
    null

  const bubblePhase: BubblePhase | null = DEBUG_BUBBLE ? 'response' : derivedPhase
  const displayTranscript = DEBUG_BUBBLE ? mockTranscript : transcript
  const displayAiResponse = DEBUG_BUBBLE ? mockAiResponse : aiResponse

  const showBubble = bubblePhase !== null

  // Keep refs in sync — read inside callbacks to avoid stale closures.
  useEffect(() => { showBubbleRef.current = showBubble }, [showBubble])
  useEffect(() => { isThinkingRef.current = isThinking }, [isThinking])

  // Keep uiVisibleRef in sync so the click-through interval can read it.
  useEffect(() => {
    uiVisibleRef.current = showBubble || showSettings || showGameSuggestion
  }, [showBubble, showSettings, showGameSuggestion])

  return (
    <div className="w-full h-full relative p-0 m-0" style={{ background: 'transparent' }}>

      {/* Drag strip — 20px at top, uses startDragging() on mousedown. */}
      <div
        className="absolute inset-x-0 top-0 h-5 cursor-grab active:cursor-grabbing pointer-events-auto"
        onMouseDown={handleDragMouseDown}
      />

      {/* Speech bubble — above duck (default) or below duck (top positions). */}
      {showBubble && (
        <div className={`absolute inset-x-0 pointer-events-auto ${
          isTopPosition
            ? 'top-[200px] bottom-5 flex items-start'
            : 'top-5 bottom-[200px] flex items-end'
        }`}>
          <SpeechBubble
            phase={bubblePhase!}
            transcript={displayTranscript}
            aiResponse={displayAiResponse}
            onEureka={handleEureka}
            onPomo={handlePomo}
            isTopPosition={isTopPosition}
            isLeftPosition={lastPosition.includes('left')}
          />
        </div>
      )}

      {/* Game suggestion bubble */}
      {showGameSuggestion && !showBubble && !showSettings && (
        <div className={`absolute inset-x-0 pointer-events-auto ${
          isTopPosition
            ? 'top-[200px] bottom-5 flex items-start pt-2'
            : 'top-5 bottom-[200px] flex items-end pb-2'
        }`}>
          <div className="w-full flex flex-col items-center gap-2 px-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 px-4 py-3 max-w-[185px] text-center">
              <p className="text-[11px] text-gray-700 leading-snug">
                {t.gameSuggestion}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGameSuggestionAccept}
                className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-[11px] rounded-full font-medium transition-colors shadow"
              >
                {t.gameSuggestionYes}
              </button>
              <button
                onClick={() => { setShowGameSuggestion(false); startGamesTimer() }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] rounded-full font-medium transition-colors shadow"
              >
                {t.gameSuggestionNo}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings overlay */}
      {showSettings && (
        <div className="pointer-events-auto">
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            detectedModel={detectedModel}
            refreshModel={refreshModel}
            gamesTimeLeft={gamesTimeLeft}
            gamesWindowOpen={gamesWindowOpen}
            providerStatus={providerStatus}
            autoDetect={autoDetect}
          />
        </div>
      )}

      {/* Duck — bottom 200 px normally, top 200 px when in top position */}
      <div className={`absolute inset-x-0 h-[200px] flex items-center justify-center pointer-events-auto ${
        isTopPosition ? 'top-0' : 'bottom-0'
      }`}>
        {/* Wrapper gives the timer a relative anchor next to the duck */}
        <div className="relative">
          {shortcutFlash && (
            <div className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none ${
              isTopPosition ? 'top-full mt-1' : '-top-8'
            }`}>
              <div className="bg-indigo-500 text-white text-[10px] font-medium rounded-full px-2.5 py-0.5 shadow whitespace-nowrap animate-pulse">
                🎙️ Atajo activado
              </div>
            </div>
          )}

          {pomodoroRunning && !showSettings && (
            <div
              className={`absolute left-2 z-50 pointer-events-auto cursor-pointer ${
                isTopPosition ? 'top-full mt-1' : '-top-8'
              }`}
              onClick={cancelPomodoro}
              title="Cancelar Pomodoro"
            >
              <div className="bg-rose-500 hover:bg-rose-400 transition-colors text-white text-[11px] font-mono rounded-full px-2.5 py-0.5 shadow select-none">
                🍅 {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
              </div>
            </div>
          )}
          <DuckAvatar
            voiceState={voiceState}
            hasResponse={!!aiResponse}
            onDoubleClick={handleDoubleClick}
            onSettingsOpen={() => setShowSettings(true)}
            onGamesOpen={handleGamesOpen}
            onHistoryOpen={handleHistoryOpen}
            isGaming={gamesWindowOpen}
            showSettings={showSettings}
          />
        </div>
      </div>

    </div>
  )
}

export default App
