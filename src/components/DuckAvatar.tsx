import { useState, useRef, useEffect } from 'react'
import { useAnimation, type AnimState } from '../hooks/useAnimation'
import { getDuckMood } from '../hooks/useTamagotchi'
import { useStore } from '../store'
import type { VoiceState } from '../hooks/useVoiceRecognition'

const toAnimState = (vs: VoiceState, hasResponse: boolean): AnimState => {
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
}

export function DuckAvatar({ voiceState, hasResponse, onDoubleClick, onSettingsOpen }: Props) {
  const [hovered, setHovered] = useState(false)
  const tamagotchiMode = useStore((s) => s.tamagotchiMode)
  const duckHappiness  = useStore((s) => s.duckHappiness)
  const isTopPosition  = useStore((s) => s.isTopPosition)
  const mood = getDuckMood(duckHappiness)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameSrc = useAnimation(toAnimState(voiceState, hasResponse))

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

  const showGear = () => {
    clearTimeout(hideTimer.current)
    setHovered(true)
  }
  const scheduleHideGear = () => {
    hideTimer.current = setTimeout(() => setHovered(false), 200)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDoubleClick()
  }

  return (
    <div className="relative w-[190px] h-[190px] pointer-events-none">

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
        onMouseEnter={showGear}
        onMouseLeave={scheduleHideGear}
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
          style={{ width: '190px', height: '190px' }}
        />
      </div>

      {hovered && (
        <button
          data-settings-btn="true"
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/35 transition-all text-xs pointer-events-auto z-10"
          onMouseEnter={showGear}
          onMouseLeave={scheduleHideGear}
          onClick={(e) => { e.stopPropagation(); onSettingsOpen() }}
          aria-label="Ajustes"
        >
          ⚙
        </button>
      )}

      {tamagotchiMode && (
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
