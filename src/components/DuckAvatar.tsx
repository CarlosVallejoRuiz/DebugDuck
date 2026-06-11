import { useState, useRef, useEffect, useCallback } from 'react'
import { useAnimation, type AnimState } from '../hooks/useAnimation'
import { getDuckMood } from '../hooks/useTamagotchi'
import { useStore } from '../store'
import type { VoiceState } from '../hooks/useVoiceRecognition'

const toAnimState = (vs: VoiceState, hasResponse: boolean, isGaming: boolean): AnimState => {
  if (isGaming)             return 'gaming'     // games window open → gametime loop
  if (hasResponse)          return 'responding' // AI response visible → idle loop
  if (vs === 'listening')   return 'listening'
  if (vs === 'processing')  return 'thinking'   // waiting for AI → rasca
  return 'idle'
}

interface Props {
  voiceState: VoiceState
  hasResponse: boolean
  onDoubleClick: () => void
  onSettingsOpen: () => void
  onGamesOpen: () => void
  onHistoryOpen: () => void
  isGaming: boolean
  showSettings: boolean
}

export function DuckAvatar({ voiceState, hasResponse, onDoubleClick, onSettingsOpen, onGamesOpen, onHistoryOpen, isGaming, showSettings }: Props) {
  const tamagotchiMode = useStore((s) => s.tamagotchiMode)
  const duckHappiness  = useStore((s) => s.duckHappiness)
  const isTopPosition  = useStore((s) => s.isTopPosition)
  const lastPosition   = useStore((s) => s.lastPosition)
  const isLeft         = lastPosition.includes('left')
  const mood = getDuckMood(duckHappiness)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // isGamingRef lets the animation loop read the live prop without stale closures.
  // inGamingMode keeps state='gaming' alive through Phase 3 so active stays true.
  const isGamingRef = useRef(false)
  const [inGamingMode, setInGamingMode] = useState(false)

  useEffect(() => {
    isGamingRef.current = isGaming
    if (isGaming) setInGamingMode(true)
    // Phase 3 completion sets inGamingMode=false via handleGamingComplete
  }, [isGaming])

  const handleGamingComplete = useCallback(() => setInGamingMode(false), [])

  const frameSrc = useAnimation(
    toAnimState(voiceState, hasResponse, inGamingMode),
    isGamingRef,
    handleGamingComplete
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, 190, 190)

      // All frames are trim()+contain normalized to 600×600 — the duck fills
      // the canvas in every set, so uniform height-based scaling works for all.
      const scale = 190 / img.naturalHeight
      const w = img.naturalWidth * scale
      ctx.drawImage(img, (190 - w) / 2, 0, w, 190)
    }
    img.src = frameSrc
  }, [frameSrc])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDoubleClick()
  }

  return (
    <div className="relative w-[190px] h-[190px] pointer-events-none">

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
        onDoubleClick={handleDoubleClick}
      >
        {voiceState === 'listening' && (
          <div className="absolute inset-[4px] rounded-full border-2 border-green-400 animate-pulse pointer-events-none" />
        )}

        <canvas
          ref={canvasRef}
          width={190}
          height={190}
          data-duck="true"
          className="pointer-events-none"
          style={{
            width: '190px',
            height: '190px',
            transform: isLeft ? 'scaleX(-1)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {/* Button column — hidden when settings panel is open */}
      {!showSettings && <div style={{
        position: 'absolute',
        right: '2px',
        top: '30%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 50,
      }}>
        <button
          data-settings-btn="true"
          style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', pointerEvents: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onSettingsOpen() }}
          aria-label="Ajustes"
          title="Ajustes"
        >
          ⚙️
        </button>
        <button
          data-games-btn="true"
          style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', pointerEvents: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onGamesOpen() }}
          aria-label="Minijuegos"
          title="Abrir Arcade"
        >
          🎮
        </button>
        <button
          data-history-btn="true"
          style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', pointerEvents: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onHistoryOpen() }}
          aria-label="Historial"
          title="Ver historial"
        >
          📋
        </button>
      </div>}

      {tamagotchiMode && !showSettings && (
        <div className="absolute top-1 -left-10 z-50 group pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-base border-2 border-gray-200 cursor-pointer">
            {mood.emoji}
          </div>
          <div className={`absolute left-0 ${isTopPosition ? 'top-10' : 'bottom-10'} bg-white/95 rounded-xl p-3 shadow-xl border border-gray-200 w-44 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
            <p className="text-xs font-bold text-gray-600 mb-1">{mood.label}</p>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${duckHappiness}%`,
                  backgroundColor: duckHappiness > 70 ? '#22c55e'
                    : duckHappiness > 40 ? '#eab308'
                    : duckHappiness > 20 ? '#f97316'
                    : '#ef4444',
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{duckHappiness}/100</p>
          </div>
        </div>
      )}
    </div>
  )
}
