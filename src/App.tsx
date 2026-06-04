import { useState, useCallback, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import duckImg from './assets/DebugDuck.png'
import { DuckAvatar } from './components/DuckAvatar'
import { SpeechBubble, type BubblePhase } from './components/SpeechBubble'
import { SettingsPanel } from './components/SettingsPanel'
import { useVoiceRecognition } from './hooks/useVoiceRecognition'
import { useAIResponse } from './hooks/useAIResponse'
import { usePomodoro } from './hooks/usePomodoro'
import { useTamagotchi } from './hooks/useTamagotchi'
import { useStore } from './store'

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
  const { aiResponse, isThinking, fetchResponse, clearResponse, detectedModel, refreshModel } = useAIResponse()
  const tamagotchi = useTamagotchi()
  const { startPomodoro, cancelPomodoro, isRunning: pomodoroRunning, secondsLeft } = usePomodoro(tamagotchi.onPomodoro)
  const incrementEurekas = useStore((s) => s.incrementEurekas)
  const isTopPosition    = useStore((s) => s.isTopPosition)

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
      // While bubble or settings are open, never ignore — buttons must be clickable.
      if (uiVisibleRef.current) return false

      // The settings gear button sits in the transparent corner of the duck PNG —
      // always keep it interactive regardless of the alpha check below.
      const gearBtn = document.querySelector('[data-settings-btn]')
      if (gearBtn) {
        const r = gearBtn.getBoundingClientRect()
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

  // Keep uiVisibleRef in sync so the click-through interval can read it.
  useEffect(() => {
    uiVisibleRef.current = showBubble || showSettings
  }, [showBubble, showSettings])

  return (
    <div className="w-full h-full relative p-0 m-0">

      {/* Drag strip — 20px at top, uses startDragging() on mousedown.
          No data-tauri-drag-region anywhere so WKWebView never sees a
          "title bar" to double-click-close. */}
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
          />
        </div>
      )}

      {/* Settings overlay */}
      {showSettings && (
        <div className="pointer-events-auto">
          <SettingsPanel
          onClose={() => setShowSettings(false)}
          detectedModel={detectedModel}
          refreshModel={refreshModel}
        />
        </div>
      )}

      {/* Duck — bottom 200 px normally, top 200 px when in top position */}
      <div className={`absolute inset-x-0 h-[200px] flex items-center justify-center pointer-events-auto ${
        isTopPosition ? 'top-0' : 'bottom-0'
      }`}>
        {/* Wrapper gives the timer a relative anchor next to the duck */}
        <div className="relative">
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
          />
        </div>
      </div>

    </div>
  )
}

export default App
