import { invoke } from '@tauri-apps/api/core'

export type BubblePhase = 'listening' | 'thinking' | 'response'

interface Props {
  phase: BubblePhase
  transcript: string
  aiResponse: string
  onEureka: () => void
  onPomo: () => void
}

export function SpeechBubble({ phase, transcript, aiResponse, onEureka, onPomo }: Props) {
  const handleEureka = async () => {
    // Open a separate fullscreen transparent window that runs the confetti
    // animation. The duck window is never resized or moved.
    try { await invoke('launch_confetti_window') } catch {}
    setTimeout(onEureka, 300)
  }

  return (
    // 14 px bottom padding so the 13 px tail clears the duck's head
    <div className="w-full px-3 pointer-events-auto" style={{ paddingBottom: '17px', maxHeight: '240px' }}>
      <div className="relative bg-white border-[2.5px] border-black rounded-2xl shadow-lg p-3">

        {phase === 'listening' && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-green-500 animate-pulse shrink-0" />
            <span className="text-gray-500 text-xs">Escuchando…</span>
          </div>
        )}

        {phase === 'thinking' && (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="thinking-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
            <span className="thinking-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
            <span className="thinking-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
          </div>
        )}

        {phase === 'response' && (
          <div className="flex flex-col gap-2">
            {transcript && (
              <p className="text-gray-400 text-[10px] leading-snug italic line-clamp-2">
                "{transcript}"
              </p>
            )}

            <div className="overflow-y-auto" style={{ maxHeight: '160px' }}>
              <p className="text-black text-xs leading-snug">{aiResponse}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 rounded-full py-1.5 text-[11px] font-semibold text-white transition-colors"
                onClick={handleEureka}
              >
                ¡Eureka! 💡
              </button>
              <button
                className="flex-1 bg-rose-500 hover:bg-rose-400 rounded-full py-1.5 text-[11px] font-semibold text-white transition-colors"
                onClick={onPomo}
              >
                Pomo 🍅
              </button>
            </div>
          </div>
        )}

        {/* Comic tail — points down toward the duck.
            Two triangles: black (border) under white (fill). */}
        <div
          className="absolute"
          style={{
            bottom: '-13px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '13px solid black',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '11px solid white',
          }}
        />

      </div>
    </div>
  )
}
