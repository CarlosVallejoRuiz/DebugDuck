// tauriFetch: used for non-streaming requests (model detection, compression,
// thinking-model completions). Routes through Rust → bypasses CORS.
// globalThis.fetch: used for streaming SSE responses, which require ReadableStream
// support not available in the Tauri HTTP plugin. Requires LM Studio to accept
// Origin: tauri://localhost (it does with Access-Control-Allow-Origin: *).
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useStore, type HistoryEntry } from '../store'

const LM_STUDIO_URL    = 'http://localhost:1234/v1/chat/completions'
const LM_STUDIO_MODELS = 'http://localhost:1234/v1/models'

const PROGRAMMER_PROMPT = `Eres DebugDuck, un pato de goma programador sarcástico pero útil.
Respondes SIEMPRE en español.

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
Respondes SIEMPRE en español.

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

async function getActiveModel(): Promise<string> {
  try {
    const res  = await tauriFetch(LM_STUDIO_MODELS)
    const data = await res.json()
    if (data.data?.length > 0) return data.data[0].id as string
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

interface UseAIResponseReturn {
  aiResponse: string
  isThinking: boolean
  detectedModel: string
  fetchResponse: (userMessage: string) => Promise<void>
  clearResponse: () => void
  refreshModel: () => Promise<void>
}

export function useAIResponse(): UseAIResponseReturn {
  const [aiResponse, setAiResponse]       = useState('')
  const [isThinking, setIsThinking]       = useState(false)
  const [detectedModel, setDetectedModel] = useState('Detectando…')

  // ── settings refs (updated by effects, read inside callbacks) ──────────
  const modelRef        = useRef('local-model')
  const modeRef         = useRef<'programmer' | 'general'>('programmer')
  const crueltyRef      = useRef(50)
  const memoryRef       = useRef(false)
  const historyRef      = useRef<HistoryEntry[]>([])
  const summaryRef      = useRef('')
  const tamagotchiRef   = useRef(false)
  const happinessRef    = useRef(75)

  const personalityMode        = useStore((s) => s.personalityMode)
  const crueltyLevel           = useStore((s) => s.crueltyLevel)
  const conversationMemory     = useStore((s) => s.conversationMemory)
  const conversationHistory    = useStore((s) => s.conversationHistory)
  const conversationSummary    = useStore((s) => s.conversationSummary)
  const setConversationHistory = useStore((s) => s.setConversationHistory)
  const setConversationSummary = useStore((s) => s.setConversationSummary)
  const tamagotchiMode         = useStore((s) => s.tamagotchiMode)
  const duckHappiness          = useStore((s) => s.duckHappiness)

  useEffect(() => { modeRef.current      = personalityMode   }, [personalityMode])
  useEffect(() => { crueltyRef.current   = crueltyLevel      }, [crueltyLevel])
  useEffect(() => { memoryRef.current    = conversationMemory }, [conversationMemory])
  useEffect(() => { historyRef.current   = conversationHistory }, [conversationHistory])
  useEffect(() => { summaryRef.current   = conversationSummary }, [conversationSummary])
  useEffect(() => { tamagotchiRef.current = tamagotchiMode   }, [tamagotchiMode])
  useEffect(() => { happinessRef.current  = duckHappiness    }, [duckHappiness])

  // ── model detection ────────────────────────────────────────────────────
  const refreshModel = useCallback(async () => {
    const m = await getActiveModel()
    modelRef.current = m
    setDetectedModel(m)
    console.log('Modelo detectado:', m)
  }, [])

  useEffect(() => { refreshModel() }, [refreshModel])

  // ── compress old history turns into a summary via the model ───────────
  const compressHistory = useCallback(async (fullHistory: HistoryEntry[]) => {
    const toCompress  = fullHistory.slice(0, -4) // keep latest 2 pairs
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
      const res  = await tauriFetch(LM_STUDIO_URL, {
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

      const systemPrompt = `${modeRef.current === 'programmer' ? PROGRAMMER_PROMPT : GENERAL_PROMPT}\n\nTONO: ${toneInstruction}`

      // Build messages array, injecting conversation context when memory is on.
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
        messages.push(...historyRef.current.slice(-4)) // latest 2 pairs
      }
      messages.push({ role: 'user', content: userMessage })

      const maxTokens   = memoryRef.current ? 400 : 800
      const useStreaming = !isThinkingModel(modelRef.current)

      console.log('AI: modelo:', modelRef.current, '| modo:', modeRef.current, '| crueldad:', crueltyRef.current, '| memoria:', memoryRef.current, '| stream:', useStreaming)

      try {
        let finalContent = ''

        if (useStreaming) {
          // ── Streaming via Rust command + Tauri events ────────────────────
          // Native fetch is blocked by CORS in signed bundles; the Rust command
          // makes the request directly bypassing WebView origin restrictions.
          let resolveStream: (s: string) => void = () => {}
          const streamPromise = new Promise<string>((res) => { resolveStream = res })

          const [unlistenChunk, unlistenDone] = await Promise.all([
            listen<string>('stream-chunk', (e) => {
              finalContent += e.payload
              setAiResponse(finalContent) // live update per delta
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
            })
            finalContent = await streamPromise
          } finally {
            unlistenChunk()
            unlistenDone()
          }
          if (!finalContent) finalContent = '...ni yo sé qué decir. ¿Tienes código?'

        } else {
          // ── Non-streaming via Tauri plugin (thinking models) ────────────
          const res = await tauriFetch(LM_STUDIO_URL, {
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
          if (!res.ok) throw new Error(`LM Studio error: ${res.status}`)

          const message = data.choices?.[0]?.message
          finalContent  = extractContent(message, modelRef.current)
                       || '...ni yo sé qué decir. ¿Tienes código?'
          setAiResponse(finalContent)
        }

        // Update conversation history if memory is enabled.
        if (memoryRef.current) {
          const updated: HistoryEntry[] = [
            ...historyRef.current,
            { role: 'user',      content: userMessage  },
            { role: 'assistant', content: finalContent },
          ]
          if (updated.length > 4) {
            await compressHistory(updated) // > 2 pairs → compress oldest
          } else {
            setConversationHistory(updated)
          }
        }
      } catch (err) {
        console.error('AI: error', err)
        setAiResponse('Parece que LM Studio no está corriendo. ¿Seguro que abriste el servidor local?')
      } finally {
        setIsThinking(false)
      }
    },
    [compressHistory, setConversationHistory]
  )

  const clearResponse = useCallback(() => setAiResponse(''), [])

  return { aiResponse, isThinking, detectedModel, fetchResponse, clearResponse, refreshModel }
}
