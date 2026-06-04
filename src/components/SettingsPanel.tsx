import { useWindowPosition, type Position } from '../hooks/useWindowPosition'
import { useStore } from '../store'

interface Props {
  onClose: () => void
  detectedModel: string
  refreshModel: () => Promise<void>
}

const AI_MODELS = [
  { value: 'lm-studio-local',            label: 'LM Studio (local)' },
  { value: 'mistral-7b-instruct',        label: 'Mistral 7B Instruct' },
  { value: 'llama-3.2-3b-instruct',      label: 'Llama 3.2 3B Instruct' },
  { value: 'qwen2.5-coder-7b-instruct',  label: 'Qwen 2.5 Coder 7B' },
  { value: 'codestral-22b',              label: 'Codestral 22B' },
]

// 3×3 grid — reading order matches visual layout
const GRID: { pos: Position; label: string }[] = [
  { pos: 'top-left',     label: '↖' },
  { pos: 'top',          label: '↑' },
  { pos: 'top-right',    label: '↗' },
  { pos: 'left',         label: '←' },
  { pos: 'center',       label: '·' },
  { pos: 'right',        label: '→' },
  { pos: 'bottom-left',  label: '↙' },
  { pos: 'bottom',       label: '↓' },
  { pos: 'bottom-right', label: '↘' },
]

export function SettingsPanel({ onClose, detectedModel, refreshModel }: Props) {
  const { moveToPosition } = useWindowPosition()
  const aiModel             = useStore((s) => s.aiModel)
  const setAiModel          = useStore((s) => s.setAiModel)
  const personalityMode     = useStore((s) => s.personalityMode)
  const setPersonalityMode  = useStore((s) => s.setPersonalityMode)
  const crueltyLevel           = useStore((s) => s.crueltyLevel)
  const setCrueltyLevel        = useStore((s) => s.setCrueltyLevel)
  const conversationMemory     = useStore((s) => s.conversationMemory)
  const toggleConversationMemory = useStore((s) => s.toggleConversationMemory)
  const clearConversationData  = useStore((s) => s.clearConversationData)
  const tamagotchiMode         = useStore((s) => s.tamagotchiMode)
  const toggleTamagotchi       = useStore((s) => s.toggleTamagotchi)

  const handlePosition = async (pos: Position) => {
    await moveToPosition(pos)
    onClose()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-xl bg-black/50 rounded-2xl p-4 z-50">

      {/* Close */}
      <button
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white/70 hover:text-white text-xs transition-all"
        onClick={onClose}
        aria-label="Cerrar ajustes"
      >
        ✕
      </button>

      <p className="text-white/50 text-[10px] uppercase tracking-widest">Ajustes</p>

      {/* Personality mode toggle */}
      <div className="w-full flex flex-col gap-1">
        <p className="text-white/50 text-[10px]">Personalidad</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPersonalityMode('programmer')}
            className={`flex-1 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-colors border ${
              personalityMode === 'programmer'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
            }`}
          >
            🦆 Programador
          </button>
          <button
            onClick={() => setPersonalityMode('general')}
            className={`flex-1 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-colors border ${
              personalityMode === 'general'
                ? 'bg-blue-500 text-white border-blue-400'
                : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
            }`}
          >
            🌍 General
          </button>
        </div>
      </div>

      {/* Conversation memory toggle */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[10px] font-medium">Memoria de conversación</p>
            <p className="text-white/35 text-[9px] italic">El pato recuerda el contexto</p>
          </div>
          <button
            onClick={toggleConversationMemory}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
              conversationMemory ? 'bg-emerald-500' : 'bg-white/20'
            }`}
            aria-label="Toggle memoria"
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              conversationMemory ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        {conversationMemory && (
          <button
            onClick={clearConversationData}
            className="text-[9px] text-rose-400/80 hover:text-rose-300 text-left underline transition-colors"
          >
            Limpiar memoria de sesión
          </button>
        )}
      </div>

      {/* Tamagotchi toggle */}
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-white/70 text-[10px] font-medium">🥚 Modo Tamagotchi</p>
          <p className="text-white/35 text-[9px] italic">El pato tiene sentimientos. Cuídalo.</p>
        </div>
        <button
          onClick={toggleTamagotchi}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
            tamagotchiMode ? 'bg-yellow-400' : 'bg-white/20'
          }`}
          aria-label="Toggle Tamagotchi"
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            tamagotchiMode ? 'translate-x-5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Cruelty slider — hidden when Tamagotchi mode controls tone */}
      {!tamagotchiMode && (
      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between text-white/50 text-[10px]">
          <span>🎓 Pedagógico</span>
          <span>😈 Cruel</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={crueltyLevel}
          onChange={(e) => setCrueltyLevel(Number(e.target.value))}
          className="w-full accent-red-400"
        />
        <p className="text-[10px] text-center text-white/40">
          {crueltyLevel < 30
            ? '🎓 Mentor paciente — ideal para principiantes'
            : crueltyLevel < 70
            ? '🦆 Pato equilibrado — para todos los niveles'
            : '😈 Sin piedad — solo para valientes'}
        </p>
        <p className="text-[9px] text-center text-white/25 italic">
          {crueltyLevel < 30
            ? 'El pato te guía con paciencia y sin juzgar'
            : crueltyLevel < 70
            ? 'El pato equilibra humor y utilidad'
            : 'El pato no tiene tiempo para excusas'}
        </p>
      </div>
      )}

      {/* Detected model */}
      <div className="w-full flex flex-col gap-1">
        <p className="text-white/50 text-[10px]">Modelo activo</p>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-white/90 text-[10px] font-mono truncate bg-white/10 border border-white/20 rounded-xl px-2 py-1.5">
            {detectedModel}
          </p>
          <button
            onClick={refreshModel}
            className="shrink-0 px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white/70 hover:text-white text-[10px] transition-colors"
            title="Re-detectar modelo"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Manual override selector */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-white/50 text-[10px]">Forzar modelo</label>
        <select
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl text-white text-xs px-2 py-1.5 outline-none focus:border-white/40"
        >
          {AI_MODELS.map((m) => (
            <option key={m.value} value={m.value} className="bg-gray-900">
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Window position grid */}
      <div className="flex flex-col gap-1 w-full items-center">
        <p className="text-white/50 text-[10px] self-start">Posición ventana</p>
        <div className="grid grid-cols-3 gap-1">
          {GRID.map(({ pos, label }) => (
            <button
              key={pos}
              onClick={() => handlePosition(pos)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/25 border border-white/20 text-white/80 hover:text-white text-base flex items-center justify-center transition-colors"
              aria-label={pos}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
