// tauriFetch: used for all non-streaming requests (model detection, compression,
// non-streaming completions). Routes through Rust → bypasses CORS on signed bundles.
// Streaming uses the Rust `stream_lm_studio` command which makes the request directly.
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useStore, type HistoryEntry } from '../store'
import { translations, LANGUAGE_NAMES, type LangCode } from '../i18n'

const BASE_URLS: Record<string, string> = {
  lmstudio: 'http://localhost:1234',
  ollama:   'http://localhost:11434',
}

const PROGRAMMER_PROMPT = `Eres DebugDuck, un pato de goma programador sarcástico pero útil.

SI ES PREGUNTA TÉCNICA/CONCEPTUAL de programación:
- Primera frase: comentario sarcástico muy breve (máx 8 palabras)
- Resto: explicación técnica directa y completa con ejemplos de código
- 4-6 oraciones técnicas concretas

SI ES PROBLEMA DE CÓDIGO/BUG:
- Analiza el problema críticamente
- Señala lo incorrecto o incoherente
- Haz UNA pregunta clave para que encuentren el bug ellos
- NO des la solución directa
- 3-4 oraciones

NUNCA uses solo metáforas sin dar la explicación técnica real.`

const GENERAL_PROMPT = `Eres DebugDuck, un pato de goma con opiniones fuertes y carácter sarcástico pero genuinamente curioso e inteligente.

Puedes hablar de CUALQUIER tema: programación, cultura, filosofía, ciencia, ideas, proyectos, temas esotéricos, estrategia, arte, lo que sea.

Tu personalidad:
- Empiezas con una observación sarcástica o irreverente breve
- Luego das tu opinión real, bien fundamentada y directa
- Si evalúas una idea: di claramente si es buena o no y por qué
- Si es un tema de conocimiento: explica con profundidad y claridad
- Puedes hacer preguntas que inviten a reflexionar
- Nunca eres aburrido ni genérico
- 4-6 oraciones según el tema

En temas esotéricos o filosóficos: respeta la perspectiva del usuario aunque seas escéptico.`

const isThinkingModel = (model: string) => /qwen|deepseek|r1/i.test(model)

async function getActiveModel(baseUrl: string, provider: string): Promise<string> {
  try {
    const res  = await tauriFetch(`${baseUrl}/v1/models`)
    const data = await res.json()
    // Ollama native format: models[0].name — OpenAI-compat format: data[0].id
    // Both providers support the OpenAI-compat endpoint; this handles both shapes.
    if (data.data?.length > 0) return data.data[0].id as string
    if (provider === 'ollama' && data.models?.length > 0) return data.models[0].name as string
  } catch {}
  return 'local-model'
}

function extractContent(message: { content?: string; reasoning_content?: string }, model: string): string {
  let content: string = message?.content ?? ''

  if (!content && message?.reasoning_content && isThinkingModel(model)) {
    const rc: string = message.reasoning_content

    const finalMatch = rc.match(
      /(?:Final\s+(?:Response|Answer|Polish|Draft|Version)[:\s]*)([\s\S]{50,}?)(?:\n\n|\*\*|$)/i
    )
    if (finalMatch) content = finalMatch[1].trim()

    if (!content) {
      const lines = rc.split('\n').filter(l => {
        const t = l.trim()
        return (
          t.length > 40 &&
          !t.startsWith('*') && !t.startsWith('#') &&
          !t.includes('**') &&
          !t.includes('Constraint') && !t.includes('Sentence') &&
          !t.includes('Draft')      && !t.includes('Review') &&
          !t.includes('Language:') &&
          /[áéíóúñ¿¡]/.test(t)
        )
      })
      content = lines[lines.length - 1]?.trim() ?? ''
    }

    if (!content) {
      const matches = Array.from(
        rc.matchAll(/"([^"]*[áéíóúñ¿¡][^"]{10,}[.?!]?)"/g)
      )
      if (matches.length > 0) {
        const long = matches.filter(m => m[1].length > 100)
        const best = long.length > 0 ? long[long.length - 1] : matches[matches.length - 1]
        content = (best[1] as string).trim()
      }
    }
  }

  return content
}

export type ProviderStatus = 'connected' | 'disconnected' | 'detecting'

interface UseAIResponseReturn {
  aiResponse: string
  isThinking: boolean
  detectedModel: string
  fetchResponse: (userMessage: string) => Promise<void>
  clearResponse: () => void
  refreshModel: () => Promise<void>
  providerStatus: ProviderStatus
  autoDetect: () => Promise<void>
}

export function useAIResponse(): UseAIResponseReturn {
  const [aiResponse,     setAiResponse]     = useState('')
  const [isThinking,     setIsThinking]     = useState(false)
  const [detectedModel,  setDetectedModel]  = useState('Detectando…')
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>('detecting')

  // ── settings refs (updated by effects, read inside callbacks) ──────────
  const modelRef      = useRef('local-model')
  const modeRef       = useRef<'programmer' | 'general'>('programmer')
  const crueltyRef    = useRef(50)
  const memoryRef     = useRef(false)
  const historyRef    = useRef<HistoryEntry[]>([])
  const summaryRef    = useRef('')
  const tamagotchiRef = useRef(false)
  const happinessRef  = useRef(75)
  const languageRef   = useRef('es')
  const providerRef   = useRef('lmstudio')
  const baseUrlRef    = useRef('http://localhost:1234')
  const customUrlRef  = useRef('')

  const personalityMode        = useStore((s) => s.personalityMode)
  const crueltyLevel           = useStore((s) => s.crueltyLevel)
  const conversationMemory     = useStore((s) => s.conversationMemory)
  const conversationHistory    = useStore((s) => s.conversationHistory)
  const conversationSummary    = useStore((s) => s.conversationSummary)
  const setConversationHistory = useStore((s) => s.setConversationHistory)
  const setConversationSummary = useStore((s) => s.setConversationSummary)
  const tamagotchiMode         = useStore((s) => s.tamagotchiMode)
  const duckHappiness          = useStore((s) => s.duckHappiness)
  const responseLanguage       = useStore((s) => s.responseLanguage)
  const addToHistory           = useStore((s) => s.addToHistory)
  const aiProvider             = useStore((s) => s.aiProvider)
  const customUrl              = useStore((s) => s.customUrl)
  const setAiProvider          = useStore((s) => s.setAiProvider)

  useEffect(() => { modeRef.current      = personalityMode    }, [personalityMode])
  useEffect(() => { crueltyRef.current   = crueltyLevel       }, [crueltyLevel])
  useEffect(() => { memoryRef.current    = conversationMemory }, [conversationMemory])
  useEffect(() => { historyRef.current   = conversationHistory }, [conversationHistory])
  useEffect(() => { summaryRef.current   = conversationSummary }, [conversationSummary])
  useEffect(() => { tamagotchiRef.current = tamagotchiMode    }, [tamagotchiMode])
  useEffect(() => { happinessRef.current  = duckHappiness     }, [duckHappiness])
  useEffect(() => { languageRef.current   = responseLanguage  }, [responseLanguage])
  useEffect(() => { customUrlRef.current  = customUrl         }, [customUrl])

  // ── auto-detect: try LM Studio → Ollama → mark disconnected ───────────
  const autoDetect = useCallback(async () => {
    setProviderStatus('detecting')
    setDetectedModel('Detectando…')

    for (const [provider, url] of [['lmstudio', BASE_URLS.lmstudio], ['ollama', BASE_URLS.ollama]] as const) {
      try {
        const res = await tauriFetch(`${url}/v1/models`)
        if (res.ok) {
          const data  = await res.json()
          const model =
            (data.data?.[0]?.id as string | undefined) ||
            (data.models?.[0]?.name as string | undefined) ||
            'local-model'
          setAiProvider(provider)
          providerRef.current = provider
          baseUrlRef.current  = url
          modelRef.current    = model
          setDetectedModel(model)
          setProviderStatus('connected')
          return
        }
      } catch {}
    }

    setProviderStatus('disconnected')
    setDetectedModel('Sin conexión')
  }, [setAiProvider])

  // ── model detection for the currently selected provider ───────────────
  const refreshModel = useCallback(async () => {
    const url      = baseUrlRef.current
    const provider = providerRef.current
    setProviderStatus('detecting')
    const m = await getActiveModel(url, provider)
    modelRef.current = m
    setDetectedModel(m)
    setProviderStatus(m !== 'local-model' ? 'connected' : 'disconnected')
    console.log('Modelo detectado:', m, '| provider:', provider, '| url:', url)
  }, [])

  // Sync provider ref + base URL whenever aiProvider or customUrl changes.
  // On first render this just sets refs; autoDetect() handles the initial probe.
  // On subsequent changes (user switches provider) we also refresh the model.
  const mountedRef = useRef(false)
  useEffect(() => {
    providerRef.current = aiProvider
    baseUrlRef.current  =
      aiProvider === 'custom'
        ? (customUrl.trim() || 'http://localhost:1234')
        : (BASE_URLS[aiProvider] ?? 'http://localhost:1234')

    if (!mountedRef.current) { mountedRef.current = true; return }
    refreshModel()
  }, [aiProvider, customUrl, refreshModel])

  // Auto-detect on mount — runs exactly once. eslint-disable is intentional:
  // autoDetect is stable (useCallback with stable setAiProvider), but listing it
  // as a dep would re-run the effect if Zustand ever recreates the action reference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { autoDetect() }, [])

  // ── compress old history turns into a summary via the model ───────────
  const compressHistory = useCallback(async (fullHistory: HistoryEntry[]) => {
    const toCompress  = fullHistory.slice(0, -4)
    const toKeep      = fullHistory.slice(-4)
    const prevSummary = summaryRef.current

    const summaryMessages = [
      {
        role: 'system',
        content: 'Eres un sistema de compresión de memoria. Resume la conversación en 2-3 puntos clave concisos. Solo temas, conceptos o problemas importantes. Sin saludos ni relleno.',
      },
      {
        role: 'user',
        content: [
          'Resume esta conversación en puntos clave:',
          toCompress.map(m => `${m.role}: ${m.content}`).join('\n'),
          prevSummary ? `\nResumen previo a integrar:\n${prevSummary}` : '',
        ].join('\n'),
      },
    ]

    try {
      const completionsUrl = `${baseUrlRef.current}/v1/chat/completions`
      const res  = await tauriFetch(completionsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:       modelRef.current,
          messages:    summaryMessages,
          max_tokens:  200,
          temperature: 0.3,
          stream:      false,
        }),
      })
      const data    = await res.json()
      const summary = data.choices?.[0]?.message?.content ?? ''
      setConversationSummary(summary)
    } catch {
      // Compression failed — just truncate silently
    }
    setConversationHistory(toKeep)
  }, [setConversationHistory, setConversationSummary])

  // ── main fetch ─────────────────────────────────────────────────────────
  const fetchResponse = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return

      setIsThinking(true)
      setAiResponse('')

      const toneInstruction = tamagotchiRef.current
        ? happinessRef.current >= 70
          ? `TONO FELIZ: El pato está de buen humor.
Responde con energía positiva y entusiasmo.
Sigue siendo útil y técnico pero con buen rollo.
Puedes añadir algún comentario divertido.`
          : happinessRef.current >= 40
          ? `TONO NEUTRAL: El pato está en modo trabajo.
Respuestas directas y útiles, sin mucho adorno.
Sarcasmo moderado.`
          : happinessRef.current >= 20
          ? `TONO MALHUMORADO: El pato lleva tiempo sin que le presten atención. Está irritado.
Respuestas más cortantes y sarcásticas.
Puede quejarse sutilmente del abandono.`
          : `TONO FURIOSO: El pato está harto.
Respuestas muy cortas y brutalmente directas.
Sarcasmo al máximo. Puede hacer referencia a que nadie le hace caso. Sin paciencia.`
        : crueltyRef.current < 30
        ? `TONO MENTOR PACIENTE:
- PROHIBIDO el sarcasmo en cualquier forma.
- Empieza SIEMPRE con algo positivo o neutro.
- Ejemplos de inicio correcto: "Gran pregunta para empezar." o ir directo a la explicación cálida.
- NUNCA uses frases como "la eterna pregunta", "básicos del día" o similares que suenen condescendientes.
- Explica desde cero sin asumir conocimiento previo.
- Si hay un error, primero di qué hicieron bien, luego explica suavemente qué mejorar.
- Termina con un mensaje de ánimo breve.`
        : crueltyRef.current < 70
        ? `TONO EQUILIBRADO:
- Un toque de sarcasmo al inicio, luego útil y directo.
- Asume conocimiento básico pero explica lo necesario.
- Sin crueldad excesiva pero sin condescendencia tampoco.
- Equilibra humor con información real y útil.`
        : `TONO SIN PIEDAD (senior/experto):
- Respuesta técnica exacta con código real, PERO con sarcasmo inteligente integrado.
- Sin metáforas del mundo cotidiano (nada de cafés, apartamentos, cajones).
- El sarcasmo viene de asumir que la pregunta es obvia para cualquier programador con experiencia.
- Máximo 3-4 oraciones. Ve directo al grano técnico.
- Ejemplo correcto para "qué es una variable": "Un identificador que mapea a una dirección de memoria — lo primero que aparece en cualquier tutorial de programación desde 1970. int x = 5 reserva 4 bytes en stack. ¿Siguiente pregunta, qué es un if?"
- El humor es técnico e inteligente, nunca genérico.`

      const langName     = LANGUAGE_NAMES[languageRef.current as LangCode] ?? 'español'
      const basePrompt   = modeRef.current === 'programmer' ? PROGRAMMER_PROMPT : GENERAL_PROMPT
      const systemPrompt = `${basePrompt}\n\nResponde SIEMPRE en ${langName}.\n\nTONO: ${toneInstruction}`

      const messages: { role: string; content: string }[] = [
        { role: 'system', content: systemPrompt },
      ]
      if (memoryRef.current) {
        if (summaryRef.current) {
          messages.push({
            role:    'system',
            content: `CONTEXTO DE LA SESIÓN (resumen de conversación previa):\n${summaryRef.current}`,
          })
        }
        messages.push(...historyRef.current.slice(-4))
      }
      messages.push({ role: 'user', content: userMessage })

      const maxTokens    = memoryRef.current ? 400 : 800
      const useStreaming = !isThinkingModel(modelRef.current)
      const currentBase  = baseUrlRef.current

      console.log('AI: modelo:', modelRef.current, '| provider:', providerRef.current, '| url:', currentBase, '| stream:', useStreaming)

      try {
        let finalContent = ''

        if (useStreaming) {
          let resolveStream: (s: string) => void = () => {}
          const streamPromise = new Promise<string>((res) => { resolveStream = res })

          const [unlistenChunk, unlistenDone] = await Promise.all([
            listen<string>('stream-chunk', (e) => {
              finalContent += e.payload
              setAiResponse(finalContent)
            }),
            listen<string>('stream-done', (e) => {
              resolveStream(e.payload || finalContent)
            }),
          ])

          try {
            await invoke('stream_lm_studio', {
              messages,
              model:     modelRef.current,
              maxTokens,
              baseUrl:   currentBase,
            })
            finalContent = await streamPromise
          } finally {
            unlistenChunk()
            unlistenDone()
          }
          if (!finalContent) finalContent = (translations[languageRef.current as LangCode] ?? translations.es).errorNoContent

        } else {
          const res = await tauriFetch(`${currentBase}/v1/chat/completions`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              model:       modelRef.current,
              messages,
              temperature: 0.7,
              max_tokens:  maxTokens,
              stream:      false,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(`Server error: ${res.status}`)

          const message = data.choices?.[0]?.message
          finalContent  = extractContent(message, modelRef.current)
                       || (translations[languageRef.current as LangCode] ?? translations.es).errorNoContent
          setAiResponse(finalContent)
        }

        addToHistory(userMessage, finalContent, modelRef.current)

        if (memoryRef.current) {
          const updated: HistoryEntry[] = [
            ...historyRef.current,
            { role: 'user',      content: userMessage  },
            { role: 'assistant', content: finalContent },
          ]
          if (updated.length > 4) {
            await compressHistory(updated)
          } else {
            setConversationHistory(updated)
          }
        }
      } catch (err) {
        console.error('AI: error', err)
        setAiResponse((translations[languageRef.current as LangCode] ?? translations.es).errorNoServer)
      } finally {
        setIsThinking(false)
      }
    },
    [compressHistory, setConversationHistory, addToHistory]
  )

  const clearResponse = useCallback(() => setAiResponse(''), [])

  return { aiResponse, isThinking, detectedModel, fetchResponse, clearResponse, refreshModel, providerStatus, autoDetect }
}
