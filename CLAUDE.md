# Contexto del Proyecto: DebugDuck

Widget de escritorio nativo (macOS/Windows) para "Rubber Duck Debugging" interactivo. Pato flotante transparente con IA local, voz, animaciones y sistema Tamagotchi.

## 1. Experiencia de Usuario

- **Doble clic** en el pato → activa micrófono (Web Speech API)
- **Flujo del bocadillo** (estilo cómic, fondo blanco, borde negro):
  1. Escuchando → anillo latiendo
  2. Pensando → puntos suspensivos + animación rasca cabeza
  3. Respuesta → texto scrolleable + botones Eureka/Pomo
- **¡Eureka!** → confeti fullscreen + +1 contador + +10 happiness (Tamagotchi)
- **Pomo** → arranca timer 25min visible encima del pato, notificación al terminar
- **Atajo global** `⌘+Shift+D` → activa micrófono desde cualquier app (configurable)
- **Botones verticales** (⚙️🎮📋) a la derecha del pato — siempre visibles
- **Ajustes** (⚙️) → panel con blur y scroll

## 2. Stack Tecnológico

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Estado:** Zustand con persist
- **Desktop:** Tauri v2 (Rust)
- **IA:** LM Studio (`localhost:1234`) u Ollama (`localhost:11434`), auto-detectado
- **HTTP:** `@tauri-apps/plugin-http` para bypass CORS en bundle firmado
- **Animaciones:** Canvas offscreen 190×190px, PNGs normalizados a 600×600
- **i18n:** ES / EN / FR / DE / PT via hook `useTranslation()` + Zustand
- **Atajo global:** `tauri-plugin-global-shortcut` — `⌘+Shift+D` configurable

## 3. Arquitectura
src/
├── hooks/
│   ├── useVoiceRecognition.ts   # Web Speech API + fixTechTerms
│   ├── useAIResponse.ts         # LM Studio + streaming + memoria
│   ├── useAnimation.ts          # Sistema de animaciones por estado
│   ├── useWindowPosition.ts     # Posicionamiento ventana
│   ├── usePomodoro.ts           # Timer 25min + notificación
│   └── useTamagotchi.ts         # Sistema Tamagotchi (happiness)
├── components/
│   ├── DuckAvatar.tsx           # Canvas 190px + badge Tamagotchi
│   ├── SpeechBubble.tsx         # Bocadillo cómic + confeti
│   └── SettingsPanel.tsx        # Panel de ajustes completo
├── store.ts                     # Zustand store persistido
└── App.tsx                      # Coordinador principal
src-tauri/
├── src/lib.rs                   # Comandos Rust
├── capabilities/default.json    # Permisos Tauri v2
├── entitlements.plist           # Entitlements macOS
└── tauri.conf.json              # Config bundle

## 4. Reglas Críticas de Desarrollo

1. **Bundle siempre** — nunca `tauri dev`, siempre `tauri build --debug` + firmar
2. **Bundle ID:** `com.debugduck.widget`
3. **Tauri v2 API** — `import { getCurrentWindow } from '@tauri-apps/api/window'`
4. **HTTP a localhost** — usar `@tauri-apps/plugin-http`, NO fetch nativo
5. **Streaming** — usar comando Rust `stream_lm_studio` + eventos Tauri
6. **Transparencia** — `body, #root { background: transparent !important }`
7. **WebKit bug** — `* { -webkit-text-stroke: 0 !important }` en index.css
8. **Posición inicial** — calcular en Rust: bottom-right con margen 16px/80px
9. **Click-through** — canvas alpha pixel-perfect via `isDuckTransparent()`
10. **pointer-events: none** en `#root`, `auto` solo en componentes interactivos

## 5. Comandos Rust Implementados

```rust
stream_lm_studio(messages, model, max_tokens, base_url)  // streaming SSE → eventos Tauri
set_ignore_cursor(ignore)       // click-through nativo
get_cursor_pos()                // posición cursor relativa ventana
launch_confetti_window()        // ventana overlay confeti fullscreen
launch_games_window(mode)       // ventana arcade 400×520
finish_game(completed, won, game) // cierra arcade + emite game-result
launch_history_window()         // ventana historial 500×620
update_global_shortcut(old, new) // re-registra atajo teclado global
score_pixel_art(image, topic)   // IA puntúa pixel art (requiere modelo visión)
```

## 6. Sistema de Animaciones
src/assets/animations/
├── idle/      # 35 frames, 3s, loop continuo
├── rasca/     # 35 frames, 2.5s — thinking + idle random
├── asiente/   # 35 frames, 2s — listening
└── libreta/   # 35 frames, 4s — listening (pato más pequeño por diseño)

**Estados:**
- `idle` → loop idle, cada 8-15s animación aleatoria
- `listening` → cicla rasca/asiente/libreta con pausa 0.8-1.5s
- `thinking` → loop rasca continuo
- `responding` → loop idle

**Canvas:** 190×190px fijo, escala por altura (`190/naturalHeight`), centrado horizontal

## 7. Panel de Ajustes (SettingsPanel)

- **Personalidad:** toggle Programador 🦆 / General 🌍
- **Idioma:** selector ES/EN/FR/DE/PT (5 banderas)
- **Memoria conversación:** toggle ON/OFF + botón limpiar
- **Modo Tamagotchi:** toggle ON/OFF (oculta slider crueldad cuando ON)
- **Minijuegos:** toggle ON/OFF + selector frecuencia [15m/25m/45m/60m] + timer
- **Slider crueldad** (0-100): Mentor paciente / Equilibrado / Sin piedad
- **🔌 Servidor de IA:** botones LM Studio / Ollama / Custom + indicador estado + auto-detectar
- **Modelo activo:** detectado automáticamente + botón ↺
- **Forzar modelo:** select manual override
- **⌨️ Atajo de teclado:** display atajo actual + botón "Cambiar" (modo grabación)
- **Posición ventana:** grid 3×3 flechas
- Panel con `overflow-y: auto` para scroll cuando el contenido no cabe

## 8. Sistema de IA

**Proveedores soportados:**
- **LM Studio** `http://localhost:1234` — formato OpenAI (`data[0].id`)
- **Ollama** `http://localhost:11434` — formato nativo (`models[0].name`) o OpenAI-compat
- **Custom URL** — cualquier servidor compatible con la API OpenAI
- Auto-detección al arrancar: prueba LM Studio → Ollama → marca "Sin conexión"
- `aiProvider` y `customUrl` persistidos en Zustand

**Detección automática de modelo:**
```typescript
GET {baseUrl}/v1/models → data[0].id | models[0].name
isThinkingModel: /qwen|deepseek|r1/i → usa reasoning_content
```

**Modos de personalidad:**
- `programmer` → MODO CONCEPTUAL (didáctico) + MODO DEBUG (socrático)
- `general` → responde cualquier tema con carácter sarcástico

**Slider de crueldad:**
- <30: Mentor paciente, sin sarcasmo, cálido, celebra intentos
- 30-70: Equilibrado, toque sarcástico, asume conocimiento básico
- >70: Sin piedad, técnico seco, sarcasmo inteligente tipo senior

**Memoria de conversación:**
- Historial últimos 4 mensajes (2 pares)
- Compresión automática a los 2 intercambios (resumen 200 tokens)
- NO persiste entre sesiones, solo la preferencia ON/OFF

**Streaming SSE:**
- Modelos normales (Mistral, Llama): `stream: true` via comando Rust `stream_lm_studio`
- Modelos thinking (Qwen): `stream: false` + extracción de reasoning_content
- max_tokens: 400 con memoria, 800 sin memoria
- `base_url` se pasa como parámetro a `stream_lm_studio` para soporte multi-proveedor

**Multiidioma:**
- `responseLanguage` en Zustand: `'es' | 'en' | 'fr' | 'de' | 'pt'`
- Inyectado en system prompt: `"Responde SIEMPRE en ${langName}"`
- UI traducida via `useTranslation()` hook + `translations` object en `i18n.ts`
- Leído en callbacks via `languageRef` para evitar stale closures

**Historial de conversaciones:**
- `historyLog: HistoryItem[]` persistido (máx. 50 entradas, configurable)
- `HistoryItem = { id, timestamp, question, answer, model }`
- Ventana `history.html` embebida en el binario — lee directo de localStorage
- Sincronización bidireccional: localStorage → eventos Tauri → Zustand
- `confirm()` bloqueado en WKWebView — usar modal HTML custom para "Borrar todo"

## 9. Sistema Tamagotchi (useTamagotchi.ts) — PENDIENTE DE IMPLEMENTAR

**Estados happiness:**
- 😊 Feliz (70-100): tono positivo y entusiasta
- 😐 Neutral (40-69): directo y equilibrado
- 😤 Malhumorado (20-39): irritado, sarcástico, se queja del abandono
- 😡 Furioso (0-19): brutal, muy corto, sin paciencia

**Eventos:**
- Eureka: +10 | Pomodoro: +5 | Pregunta compleja (>8 palabras): +3
- Tiempo sin interacción (>1h): -8/hora | Pregunta corta (<4 palabras): -2

**Badge visual (DuckAvatar):**
- Emoji estado siempre visible (top-right del pato)
- Hover → barra de vida expandida con color dinámico
- Oculto cuando tamagotchiMode=false

**Integración IA:**
- Cuando tamagotchiMode=true → tono controlado por happiness
- Cuando tamagotchiMode=false → tono controlado por slider crueldad

**En store.ts (PERSISTIDO):**
- `tamagotchiMode: boolean` (default: false)
- `duckHappiness: number` (default: 75)
- `lastInteraction: number` (default: Date.now())

## 10. Corrección de Términos Técnicos (useVoiceRecognition.ts)

`fixTechTerms()` corrige transcripciones erróneas del speech recognition:
- "Rack/Rad" → "React"
- "Types Creed" → "TypeScript"  
- "dub ar" → "debugging"
- "pitón" → "Python"
- + ~40 términos técnicos más

## 11. Bugs Conocidos y Soluciones

### TCC / SpeechRecognition
- Requiere bundle `.app` firmado, nunca binario suelto
- `tccutil reset Microphone && tccutil reset SpeechRecognition` si falla

### CORS con LM Studio
- fetch nativo bloqueado en bundle firmado
- Usar `@tauri-apps/plugin-http` o comando Rust con reqwest
- Streaming: comando Rust `stream_lm_studio` + `window.emit()` chunks

### Qwen3.5 thinking mode
- content siempre vacío, respuesta en reasoning_content
- Regex: `/"([^"]*[áéíóúñ¿¡][^"]{10,}[.?!]?)"/g` → último match >100 chars
- max_tokens: 2000 mínimo

### Click-through transparente
- CSS pointer-events NO funciona para otras apps del SO
- Solución: `get_cursor_pos()` Rust + canvas alpha pixel reading cada 30ms
- `set_ignore_cursor(true)` cuando alpha < 10 en el PNG

### Confeti segunda vez
- Usar label único con timestamp: `confetti-{Date.now()}`
- `set_ignore_cursor_events(true)` en ventana confeti para no bloquear

### Animación libreta más pequeña
- Es por diseño — encuadre más abierto al sostener libreta
- No es un bug de normalización (duck ocupa 563×600 del canvas)

## 12. Flujo de Desarrollo Diario

```bash
npm run tauri build -- --debug && \
codesign --sign - --force --deep \
  --entitlements src-tauri/entitlements.plist \
  src-tauri/target/debug/bundle/macos/DebugDuck.app && \
open src-tauri/target/debug/bundle/macos/DebugDuck.app
```

## 14. Sistema de Minijuegos (PENDIENTE DE IMPLEMENTAR)

### Activación
- Automática: tras completar un Pomodoro o 25min de inactividad
- Manual: botón 🎮 permanente en el widget junto al engranaje
- Toggle en SettingsPanel: "🎮 Minijuegos ON/OFF"
  * OFF: desactiva sugerencia automática, botón manual sigue activo

### Ventana de juegos
- Comando Rust: `launch_games_window()` en lib.rs
- Archivo: `public/games.html` (JS puro, sin frameworks)
- Tamaño: 400x500px, always_on_top, centrada
- Selecciona UN juego aleatorio al abrir
- Botón "🔀 Otro juego" para cambiar aleatoriamente

### Estética RETRO TERMINAL obligatoria
- Fondo: negro puro (#000000)
- Texto y elementos: verde fosforescente (#00ff00)
- Fuente: Courier New o monospace puro
- Efecto scanlines sobre todo el contenido
- Efecto CRT: viñeta en bordes
- Bordes ASCII: ┌─┐│└─┘ en lugar de border-radius
- Botones: [JUGAR] → [>JUGAR<] en hover
- Animaciones a "pasos" sin transitions suaves
- Títulos con efecto typing (letras aparecen una a una)
- Puntuaciones con prefijo: SCORE: 0042
- Game over parpadeante estilo arcade
- Sonidos via Web Audio API (sin archivos externos):
  beep en click, error al fallar, melodía al ganar

### Los 6 juegos
1. 🎯 PATO AL AGUA (Flappy Duck)
   - Canvas 380x300px, gravedad + obstáculos
   - Velocidad progresiva, puntuación por obstáculos

2. 🧠 DEBUG QUIZ
   - 10 preguntas de banco de 20+, 4 opciones
   - 15 segundos por pregunta, barra de tiempo
   - Temas: JS, Python, Git, patrones, algoritmos
   - Mensajes sarcásticos del pato según resultado

3. 🎨 PATO PIXEL
   - Grid 16x16, paleta 8 colores
   - Sin puntuación ni tiempo — relajante
   - Botones: Limpiar + Guardar como PNG

4. ⚡ RUBBER DUCK TYPING
   - 30 palabras técnicas por ronda
   - Banco 100+ términos (React, TypeScript, etc.)
   - Mide WPM y precisión %

5. 🔢 DUCK MATH
   - 10 operaciones, 8 segundos cada una
   - Niveles: fácil/medio/difícil
   - Puntuación por aciertos y velocidad

6. ❌⭕ 3 EN RAYA
   - IA con algoritmo minimax perfecto
   - El pato nunca pierde
   - Mensajes sarcásticos según resultado:
     * Gana pato: "¿En serio? Soy un pato de goma..."
     * Empate: "No está mal para ser humano."

### Minijuegos pendientes de implementar (v2)

7. 🃏 MEMORY DUCK
   - Tablero de cartas boca abajo
   - Parejas de emojis técnicos: 💻🐛⚡🦆🔧📦🚀🎯
   - Tableros: 4x4 (fácil), 4x6 (medio), 6x6 (difícil)
   - Score: parejas encontradas + bonus por velocidad
   - Estética retro terminal: cartas como bloques ASCII

8. 🎵 DUCK BEAT
   - Secuencia de sonidos via Web Audio API
   - El usuario repite la secuencia pulsando teclas
   - Secuencia crece cada ronda (como Simon Says)
   - 4 teclas: A S D F con sonidos distintos
   - Score: ronda máxima alcanzada

9. 🔢 SUDOKU DUCK
   - Grid 4x4 mini (fácil de completar en 2-3 min)
   - Números 1-4, sin repetir en fila/columna/cuadrante
   - Generador aleatorio de puzzles válidos
   - Celdas pre-rellenadas resaltadas diferente
   - Score: tiempo empleado en completarlo

10. 🐛 BUG HUNT
    - Fragmento de código con 1 error visible
    - El usuario debe identificar la línea con el bug
    - Lenguajes: JavaScript, Python, pseudocódigo
    - 10 rondas, 20 segundos cada una
    - Banco de 30+ bugs reales y comunes
    - Score: aciertos + velocidad

11. 💬 DUCK WORDLE
    - Adivina la palabra técnica en 6 intentos
    - Palabras de 5-6 letras del mundo tech
    - Verde: letra correcta en posición correcta
    - Amarillo: letra existe pero en posición incorrecta
    - Gris: letra no existe
    - Banco de 50+ palabras: REACT, REDUX, PROXY...
    - Score: intentos usados (menos = mejor)
### Integración Tamagotchi
- Completar juego: +5 happiness
- Ganar (Quiz, Math, Typing >60 WPM): +8 happiness  
- Perder al pato en 3 en raya: +3 happiness
- Emitir evento Tauri al cerrar con resultado
  para que App.tsx actualice duckHappiness

### Archivos a crear/modificar
- `public/games.html` — ventana de juegos completa
- `src-tauri/src/lib.rs` — comando launch_games_window
- `src-tauri/capabilities/default.json` — permisos
- `src/components/SettingsPanel.tsx` — toggle minijuegos
- `src/App.tsx` — botón 🎮 + lógica de sugerencia automática
- `src/store.ts` — gamesEnabled: boolean (default: true)

## 15. ROADMAP v0.3.0

### ✅ IMPLEMENTADO

#### 1. Compatibilidad con Ollama + URL personalizada
- Auto-detección al arrancar: LM Studio (`:1234`) → Ollama (`:11434`) → "Sin conexión"
- Selector en SettingsPanel: LM Studio / Ollama / Custom + indicador 🟢/🔴
- `base_url` pasado como parámetro a `stream_lm_studio` en Rust
- Permisos `http.json` actualizados: `localhost:11434/**`

#### 2. Soporte multiidioma (ES/EN/FR/DE/PT)
- `useTranslation()` + `translations` en `i18n.ts` — 5 idiomas completos
- Idioma inyectado en system prompt: `"Responde SIEMPRE en ${langName}"`
- `responseLanguage` persistido en Zustand, leído via ref en callbacks

#### 3. Historial de conversaciones
- `historyLog: HistoryItem[]` persistido (máx. 50 entradas)
- Ventana `history.html` con búsqueda, copiar, borrar individual y borrar todo
- Modal HTML custom (confirm() bloqueado en WKWebView)
- Sincronización localStorage ↔ eventos Tauri ↔ Zustand

#### 4. Botones verticales (⚙️🎮📋)
- Un único `div` con `position: absolute; right: 2px; top: 30%` via inline styles
- Siempre visibles; se ocultan cuando el panel de ajustes está abierto
- Badge Tamagotchi también oculto cuando settings está abierto

#### 5. Atajo de teclado global configurable
- `tauri-plugin-global-shortcut` — por defecto `⌘+Shift+D` / `Ctrl+Shift+D`
- Configurable en SettingsPanel: botón "Cambiar" → modo grabación → keydown
- `globalShortcut` persistido en Zustand; re-registrado en App.tsx al arrancar
- Flash visual "🎙️ Atajo activado" 0.8s antes de activar el micrófono

---

**v0.3.0 completado al 100%.**