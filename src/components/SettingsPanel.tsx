import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useWindowPosition, type Position } from '../hooks/useWindowPosition'
import { useStore } from '../store'
import { useTranslation, LANGUAGES } from '../i18n'
import type { ProviderStatus } from '../hooks/useAIResponse'

interface Props {
  onClose: () => void
  detectedModel: string
  refreshModel: () => Promise<void>
  gamesTimeLeft: number
  gamesWindowOpen: boolean
  providerStatus: ProviderStatus
  autoDetect: () => Promise<void>
}

const GAME_INTERVALS = [15, 25, 45, 60]

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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

export function SettingsPanel({ onClose, detectedModel, refreshModel, gamesTimeLeft, gamesWindowOpen, providerStatus, autoDetect }: Props) {
  const t = useTranslation()
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
  const gamesEnabled           = useStore((s) => s.gamesEnabled)
  const toggleGamesEnabled     = useStore((s) => s.toggleGamesEnabled)
  const gamesInterval          = useStore((s) => s.gamesInterval)
  const setGamesInterval       = useStore((s) => s.setGamesInterval)
  const responseLanguage       = useStore((s) => s.responseLanguage)
  const setResponseLanguage    = useStore((s) => s.setResponseLanguage)
  const aiProvider             = useStore((s) => s.aiProvider)
  const setAiProvider          = useStore((s) => s.setAiProvider)
  const customUrl              = useStore((s) => s.customUrl)
  const setCustomUrl           = useStore((s) => s.setCustomUrl)
  const globalShortcut         = useStore((s) => s.globalShortcut)
  const setGlobalShortcut      = useStore((s) => s.setGlobalShortcut)

  const [recordingShortcut, setRecordingShortcut] = useState(false)

  // Capture the next keydown combo while in recording mode
  const handleShortcutKeyDown = useCallback(async (e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const modifiers = ['Meta', 'Control', 'Shift', 'Alt']
    if (modifiers.includes(e.key)) return // wait for a non-modifier key

    const parts: string[] = []
    if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl')
    if (e.shiftKey)  parts.push('Shift')
    if (e.altKey)    parts.push('Alt')
    parts.push(e.key.toUpperCase())

    if (parts.length < 2) return // require at least one modifier

    const newShortcut = parts.join('+')
    setRecordingShortcut(false)
    try {
      await invoke('update_global_shortcut', { oldShortcut: globalShortcut, newShortcut })
      setGlobalShortcut(newShortcut)
    } catch (err) {
      console.error('Shortcut registration failed:', err)
    }
  }, [globalShortcut, setGlobalShortcut])

  useEffect(() => {
    if (!recordingShortcut) return
    window.addEventListener('keydown', handleShortcutKeyDown, true)
    return () => window.removeEventListener('keydown', handleShortcutKeyDown, true)
  }, [recordingShortcut, handleShortcutKeyDown])

  // Format the raw Tauri shortcut string for display
  const displayShortcut = (raw: string) =>
    raw
      .replace('CommandOrControl', '⌘/Ctrl')
      .replace('Command', '⌘')
      .replace('Control', 'Ctrl')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .split('+').join(' + ')

  const handlePosition = async (pos: Position) => {
    await moveToPosition(pos)
    onClose()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start gap-4 backdrop-blur-xl bg-black/50 rounded-2xl p-4 z-50 overflow-y-auto pt-8">

      {/* Close */}
      <button
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white/70 hover:text-white text-xs transition-all"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      <p className="text-white/50 text-[10px] uppercase tracking-widest">{t.settingsTitle}</p>

      {/* Personality mode toggle */}
      <div className="w-full flex flex-col gap-1">
        <p className="text-white/50 text-[10px]">{t.personality}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPersonalityMode('programmer')}
            className={`flex-1 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-colors border ${
              personalityMode === 'programmer'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
            }`}
          >
            🦆 {t.programmer}
          </button>
          <button
            onClick={() => setPersonalityMode('general')}
            className={`flex-1 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-colors border ${
              personalityMode === 'general'
                ? 'bg-blue-500 text-white border-blue-400'
                : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
            }`}
          >
            🌍 {t.general}
          </button>
        </div>
      </div>

      {/* Language selector */}
      <div className="w-full flex flex-col gap-1">
        <p className="text-white/50 text-[10px]">{t.languageTitle}</p>
        <div className="flex gap-1">
          {LANGUAGES.map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => setResponseLanguage(code)}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-medium transition-colors border ${
                responseLanguage === code
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-white/10 text-white/40 border-white/20 hover:bg-white/20'
              }`}
            >
              {flag} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation memory toggle */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[10px] font-medium">{t.memoryTitle}</p>
            <p className="text-white/35 text-[9px] italic">{t.memorySubtitle}</p>
          </div>
          <button
            onClick={toggleConversationMemory}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
              conversationMemory ? 'bg-emerald-500' : 'bg-white/20'
            }`}
            aria-label="Toggle memory"
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
            {t.clearMemory}
          </button>
        )}
      </div>

      {/* Tamagotchi toggle */}
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-white/70 text-[10px] font-medium">{t.tamagotchiTitle}</p>
          <p className="text-white/35 text-[9px] italic">{t.tamagotchiSubtitle}</p>
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

      {/* Games toggle + timer + frequency */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-[10px] font-medium">{t.gamesTitle}</p>
          <button
            onClick={toggleGamesEnabled}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
              gamesEnabled ? 'bg-purple-500' : 'bg-white/20'
            }`}
            aria-label="Toggle Minigames"
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              gamesEnabled ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Timer display */}
        <p className={`text-[10px] font-mono tabular-nums ${
          !gamesEnabled
            ? 'text-white/25'
            : gamesWindowOpen
            ? 'text-purple-400'
            : gamesTimeLeft <= gamesInterval * 6    // ≤10%
            ? 'text-red-400'
            : gamesTimeLeft <= gamesInterval * 15   // ≤25%
            ? 'text-yellow-400'
            : 'text-green-400'
        }`}>
          {!gamesEnabled
            ? t.gamesDisabled
            : gamesWindowOpen
            ? t.gamesPlaying
            : gamesTimeLeft <= 0
            ? t.gamesNow
            : `${t.gamesNext} ${formatTime(gamesTimeLeft)}`}
        </p>

        {/* Frequency selector */}
        {gamesEnabled && (
          <div className="flex flex-col gap-1">
            <p className="text-white/40 text-[9px]">{t.frequency}</p>
            <div className="flex gap-1.5">
              {GAME_INTERVALS.map(min => (
                <button
                  key={min}
                  onClick={() => setGamesInterval(min)}
                  className={`flex-1 py-0.5 rounded-full text-[9px] font-medium border transition-colors ${
                    gamesInterval === min
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-white/10 text-white/50 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cruelty slider — hidden when Tamagotchi mode controls tone */}
      {!tamagotchiMode && (
      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between text-white/50 text-[10px]">
          <span>{t.crueltyPedagogical}</span>
          <span>{t.crueltyCruel}</span>
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
            ? t.crueltyLabelMentor
            : crueltyLevel < 70
            ? t.crueltyLabelBalance
            : t.crueltyLabelBrutal}
        </p>
        <p className="text-[9px] text-center text-white/25 italic">
          {crueltyLevel < 30
            ? t.crueltySubMentor
            : crueltyLevel < 70
            ? t.crueltySubBalance
            : t.crueltySubBrutal}
        </p>
      </div>
      )}

      {/* AI Server */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-[10px]">{t.serverTitle}</p>
          <span className={`text-[9px] font-medium ${
            providerStatus === 'connected'    ? 'text-green-400'  :
            providerStatus === 'disconnected' ? 'text-red-400'    :
            'text-yellow-400'
          }`}>
            {providerStatus === 'connected'    ? t.providerConnected    :
             providerStatus === 'disconnected' ? t.providerDisconnected :
             t.providerDetecting}
          </span>
        </div>

        {/* Provider buttons */}
        <div className="flex gap-1.5">
          {(['lmstudio', 'ollama', 'custom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setAiProvider(p)}
              className={`flex-1 py-1.5 rounded-xl text-[9px] font-medium transition-colors border ${
                aiProvider === p
                  ? 'bg-cyan-500 text-white border-cyan-400'
                  : 'bg-white/10 text-white/50 border-white/20 hover:bg-white/20'
              }`}
            >
              {p === 'lmstudio' ? 'LM Studio' : p === 'ollama' ? 'Ollama' : 'Custom'}
            </button>
          ))}
        </div>

        {/* Custom URL input */}
        {aiProvider === 'custom' && (
          <div className="flex flex-col gap-0.5">
            <label className="text-white/40 text-[9px]">{t.customUrlLabel}</label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={t.customUrlPlaceholder}
              className="w-full bg-white/10 border border-white/20 rounded-xl text-white text-[10px] px-2 py-1.5 outline-none focus:border-cyan-400/60 placeholder-white/25"
            />
          </div>
        )}

        {/* Auto-detect */}
        <button
          onClick={autoDetect}
          className="w-full py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/60 hover:text-white text-[9px] transition-colors"
        >
          {t.autoDetect}
        </button>
      </div>

      {/* Detected model */}
      <div className="w-full flex flex-col gap-1">
        <p className="text-white/50 text-[10px]">{t.activeModel}</p>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-white/90 text-[10px] font-mono truncate bg-white/10 border border-white/20 rounded-xl px-2 py-1.5">
            {detectedModel}
          </p>
          <button
            onClick={refreshModel}
            className="shrink-0 px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white/70 hover:text-white text-[10px] transition-colors"
            title="Re-detect model"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Manual override selector */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-white/50 text-[10px]">{t.forceModel}</label>
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

      {/* Global keyboard shortcut */}
      <div className="w-full flex flex-col gap-1.5">
        <div>
          <p className="text-white/70 text-[10px] font-medium">{t.shortcutTitle}</p>
          <p className="text-white/35 text-[9px] italic">{t.shortcutSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 text-[10px] font-mono text-white/90 truncate">
            {recordingShortcut ? (
              <span className="text-yellow-400 animate-pulse">{t.shortcutRecording}</span>
            ) : (
              displayShortcut(globalShortcut)
            )}
          </div>
          <button
            onClick={() => setRecordingShortcut(true)}
            disabled={recordingShortcut}
            className="shrink-0 px-2 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black text-[9px] font-medium transition-colors"
          >
            {t.shortcutChange}
          </button>
        </div>
        <p className="text-white/25 text-[9px]">{t.shortcutDefault}</p>
      </div>

      {/* Window position grid */}
      <div className="flex flex-col gap-1 w-full items-center">
        <p className="text-white/50 text-[10px] self-start">{t.windowPosition}</p>
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
