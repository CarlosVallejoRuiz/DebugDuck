import { useState, useRef, useCallback, useEffect } from 'react'

export type VoiceState = 'idle' | 'listening' | 'processing'

interface UseVoiceRecognitionReturn {
  voiceState: VoiceState
  transcript: string
  startListening: () => void
  reset: () => void
}

// TypeScript 6+ removed SpeechRecognition as a global var from lib.dom.d.ts
// (it's not universally supported). Define the minimal interface locally.
interface SR extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  onstart:       ((e: Event) => void) | null
  onaudiostart:  ((e: Event) => void) | null
  onspeechstart: ((e: Event) => void) | null
  onspeechend:   ((e: Event) => void) | null
  onresult:      ((e: SpeechRecognitionEvent) => void) | null
  onend:         ((e: Event) => void) | null
  onerror:       ((e: SpeechRecognitionErrorEvent) => void) | null
  start(): void
  stop(): void
  abort(): void
}
interface SRConstructor { new(): SR }

declare global {
  interface Window {
    SpeechRecognition?: SRConstructor
    webkitSpeechRecognition?: SRConstructor
  }
}

const TECH_CORRECTIONS: [RegExp, string][] = [
  // Frameworks y librerías JS/TS
  [/\b(rack|rad|ract|rax|raact)\b/gi, 'React'],
  [/\b(types?\s*creed|type\s*script|taip\s*script|typescript)\b/gi, 'TypeScript'],
  [/\b(java\s*script|javas\s*cript|yava\s*script)\b/gi, 'JavaScript'],
  [/\b(next\s*ye|necks\s*yes|nex\s*chus)\b/gi, 'Next.js'],
  [/\b(vue\s*yes|viu|bue)\b/gi, 'Vue.js'],
  [/\b(angular|angula|engular)\b/gi, 'Angular'],
  [/\b(svelte|esvel|svelt)\b/gi, 'Svelte'],
  [/\b(zustand|gus\s*tan|sus\s*tan|justan|guizús)\b/gi, 'Zustand'],
  [/\b(redux|ri\s*dax|redax|reedux)\b/gi, 'Redux'],
  [/\b(tailwind|teil\s*wind|tail\s*win)\b/gi, 'Tailwind'],
  [/\b(vite|bait|vait|bite)\b/gi, 'Vite'],
  [/\b(webpack|web\s*pac|ueb\s*pack)\b/gi, 'Webpack'],
  // Runtime y backend
  [/\b(nodo|naiv|nod\s*yes|nou\s*yes)\b/gi, 'Node.js'],
  [/\b(express|ex\s*pres|expres)\b/gi, 'Express'],
  [/\b(pitón|python|paiton|pai\s*ton)\b/gi, 'Python'],
  [/\b(chava|java(?!\s*script)|yava)\b/gi, 'Java'],
  [/\b(rust|ras|rast)\b/gi, 'Rust'],
  [/\b(go\s*lang|golang|gou\s*lang)\b/gi, 'Go'],
  [/\b(kotlin|cotlin|cotling)\b/gi, 'Kotlin'],
  [/\b(swift|suift|suif)\b/gi, 'Swift'],
  [/\b(ruby|rubi|ruvi)\b/gi, 'Ruby'],
  [/\b(php|pe\s*ache\s*pe|fepe)\b/gi, 'PHP'],
  // Bases de datos
  [/\b(postgres|postgress|post\s*gres|pos\s*gres)\b/gi, 'PostgreSQL'],
  [/\b(mongo\s*db|mongo|mongou)\b/gi, 'MongoDB'],
  [/\b(my\s*sql|mai\s*sequel|mi\s*sequel)\b/gi, 'MySQL'],
  [/\b(supa\s*base|super\s*base|supabase)\b/gi, 'Supabase'],
  [/\b(firebase|fair\s*base|fayer\s*base)\b/gi, 'Firebase'],
  [/\b(redis|readis|reedis)\b/gi, 'Redis'],
  [/\b(sqlite|ese\s*quite|es\s*kite)\b/gi, 'SQLite'],
  // Conceptos de programación
  [/\b(dub\s*ar|de\s*bu\s*gar|debugear|debuggin|dibuguin)\b/gi, 'debugging'],
  [/\b(de\s*plo\s*yer|deployer|deployar|di\s*ploi)\b/gi, 'deploy'],
  [/\b(re\s*fac\s*tor|refactorizar|refactor)\b/gi, 'refactoring'],
  [/\b(a\s*pi|ei\s*pi|hay\s*pi)\b/gi, 'API'],
  [/\b(rest\s*ful|res\s*full|restfull)\b/gi, 'REST'],
  [/\b(gra\s*fi\s*kuel|graphicuel|graph\s*cool)\b/gi, 'GraphQL'],
  [/\b(web\s*soquete|web\s*soket|websocket)\b/gi, 'WebSocket'],
  [/\b(docker|doker|dóker)\b/gi, 'Docker'],
  [/\b(kubernetes|cubernetes|cu\s*ber\s*netes)\b/gi, 'Kubernetes'],
  [/\b(ci\s*cd|si\s*si\s*di|integration\s*continua)\b/gi, 'CI/CD'],
  [/\b(git\s*hub|githab|guithub)\b/gi, 'GitHub'],
  [/\b(git\s*lab|gitlav)\b/gi, 'GitLab'],
  // Conceptos OOP y patrones
  [/\b(sin\s*cro\s*no|asincronía|asíncrono)\b/gi, 'asíncrono'],
  [/\b(pro\s*mi\s*ses|promesas|pro\s*miss)\b/gi, 'Promises'],
  [/\b(a\s*sink|ei\s*sink|asink)\b/gi, 'async'],
  [/\b(a\s*ueit|a\s*wait|aueit)\b/gi, 'await'],
  [/\b(la\s*mada|lam\s*da|lambda)\b/gi, 'lambda'],
  [/\b(re\s*cur\s*sión|recursividad|rekursion)\b/gi, 'recursión'],
  [/\b(e\s*rror\s*handling|manejar\s*errores)\b/gi, 'manejo de errores'],
  // Cloud y DevOps
  [/\b(ei\s*doble\s*u\s*es|amazon\s*web|aws)\b/gi, 'AWS'],
  [/\b(goo\s*gle\s*cloud|ji\s*si\s*pi|gcp)\b/gi, 'GCP'],
  [/\b(ei\s*sur|azure|asure)\b/gi, 'Azure'],
  [/\b(ver\s*sel|vercel|ber\s*sel)\b/gi, 'Vercel'],
  [/\b(net\s*li\s*fai|netlify|netlifai)\b/gi, 'Netlify'],
  // Testing
  [/\b(yes\s*test|yest|jest)\b/gi, 'Jest'],
  [/\b(sai\s*press|cypress|si\s*press)\b/gi, 'Cypress'],
  [/\b(vitest|bai\s*test|vi\s*test)\b/gi, 'Vitest'],
  // Herramientas IA
  [/\b(llm|ele\s*ele\s*eme|llem)\b/gi, 'LLM'],
  [/\b(open\s*ei\s*ai|openai|open\s*ai)\b/gi, 'OpenAI'],
  [/\b(chei\s*pi\s*ti|chatgpt|chat\s*yi\s*pi\s*ti)\b/gi, 'ChatGPT'],
]

function fixTechTerms(text: string): string {
  let fixed = text
  for (const [pattern, replacement] of TECH_CORRECTIONS) {
    fixed = fixed.replace(pattern, replacement)
  }
  return fixed
}

export function useVoiceRecognition(
  onResult: (transcript: string) => void
): UseVoiceRecognitionReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SR | null>(null)
  const transcriptRef = useRef('')
  const onResultRef = useRef(onResult)
  useEffect(() => { onResultRef.current = onResult }, [onResult])

  const startListening = useCallback(() => {
    try {
      const Impl = window.SpeechRecognition ?? window.webkitSpeechRecognition
      if (!Impl) {
        console.warn('SpeechRecognition no disponible en este entorno')
        return
      }

      const recognition = new Impl()
      recognition.lang = 'es-ES'
      recognition.interimResults = true
      recognition.continuous = false

      recognition.onstart       = () => { console.log('SR: started'); setVoiceState('listening') }
      recognition.onaudiostart  = () => console.log('SR: audio started')
      recognition.onspeechstart = () => console.log('SR: speech detected')
      recognition.onspeechend   = () => console.log('SR: speech ended')

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        console.log('SR: result', transcript)
        const raw = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('')
        const text = fixTechTerms(raw)
        transcriptRef.current = text
        setTranscript(text)
      }

      recognition.onend = () => {
        const finalText = fixTechTerms(transcriptRef.current)
        console.log('SR: ended — transcript:', finalText)
        transcriptRef.current = finalText
        setVoiceState('processing')
        onResultRef.current(finalText)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('SR: error', event.error, event.message)
        setVoiceState('idle')
      }

      recognitionRef.current = recognition
      transcriptRef.current = ''
      setTranscript('')
      recognition.start()
    } catch (err) {
      console.error('Error iniciando reconocimiento:', err)
      setVoiceState('idle')
    }
  }, [])

  const reset = useCallback(() => {
    try {
      recognitionRef.current?.abort()
    } catch {
      // abort() puede lanzar si el reconocimiento ya estaba detenido
    }
    recognitionRef.current = null
    transcriptRef.current = ''
    setVoiceState('idle')
    setTranscript('')
  }, [])

  return { voiceState, transcript, startListening, reset }
}
