---
name: debugduck
description: "DebugDuck project context — Tauri v2 transparent desktop widget with local AI. Auto-loaded for all work in this repo. Contains critical rules (build+sign required, no tauri dev, no native fetch), known bugs and fixes, architecture patterns, and anti-patterns specific to this project."
version: 1.0.0
---

# DebugDuck — Project Skill

Floating rubber duck debugging widget. Tauri v2 + React + TypeScript + Rust + Zustand.
Bundle ID: `com.debugduck.widget` · Window: 280×550 transparent, always_on_top, no decorations.

---

## REGLAS CRÍTICAS — leer antes de cualquier cambio

### Build obligatorio (macOS)
```bash
npm run tauri build -- --debug && \
codesign --sign - --force --deep \
  --entitlements src-tauri/entitlements.plist \
  src-tauri/target/debug/bundle/macos/DebugDuck.app && \
open src-tauri/target/debug/bundle/macos/DebugDuck.app
```

**Por qué:** SpeechRecognition y transparencia requieren bundle `.app` firmado. `tauri dev` no funciona para este proyecto — nunca sugerir su uso.

### HTTP a localhost → siempre plugin-http
```typescript
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
// NO: fetch('http://localhost:1234/...') — bloqueado por CORS en bundle firmado
```

### Posicionamiento de ventana → dividir por scaleFactor
```typescript
// NO hardcodear scaleFactor — varía por monitor (Retina = 2, externos = 1-1.5)
const pos = await window.outerPosition()
const sf  = await window.scaleFactor()
const logical = { x: pos.x / sf, y: pos.y / sf }
```

### Streaming → comando Rust, nunca fetch desde frontend
```typescript
invoke('stream_lm_studio', { messages, model, maxTokens, baseUrl })
// Emite eventos 'stream-chunk' y 'stream-done' — escucharlos con listen()
```

### Zustand store → persist con clave 'debugduck-storage'
Al añadir campos nuevos al store, agregarlos también a `partialize` en store.ts — si no, no se persisten. Si se cambia la estructura de un campo existente, los datos guardados del usuario se rompen silenciosamente.

---

## ANTIPATRONES — nunca hacer esto

| Antipatrón | Por qué rompe |
|-----------|---------------|
| `clip-path` en canvas del pato | Rompe el click-through pixel-perfect |
| `overflow: hidden` en contenedor del pato | Mismo problema |
| `fetch()` nativo a localhost | CORS bloqueado en bundle firmado |
| `tauri dev` | Sin transparencia, sin SpeechRecognition |
| Hardcodear `scaleFactor: 2` | Falla en monitores no-Retina |
| Crear ventana con label duplicado | Error — usar `format!("confetti-{}", timestamp)` |
| `useEffect(() => { fn() }, [fn])` donde fn es callback | Loop infinito si fn se recrea |

---

## ARQUITECTURA

```
src/
├── hooks/
│   ├── useVoiceRecognition.ts  # Web Speech API + fixTechTerms()
│   ├── useAIResponse.ts        # autoDetect + streaming + memoria
│   ├── useAnimation.ts         # estados: idle/listening/thinking/responding/gametime
│   ├── useWindowPosition.ts    # posición via Rust
│   ├── usePomodoro.ts          # timer 25min + notificación nativa
│   └── useTamagotchi.ts        # happiness + decay automático
├── components/
│   ├── DuckAvatar.tsx          # canvas 190px + badge + botones verticales ⚙️🎮📋
│   ├── SpeechBubble.tsx        # bocadillo cómic + confeti
│   └── SettingsPanel.tsx       # panel completo con overflow-y: auto
├── store.ts                    # Zustand persist ('debugduck-storage')
├── i18n.ts                     # translations + useTranslation() hook
└── App.tsx                     # coordinador + click-through loop 30ms

src-tauri/src/lib.rs            # todos los comandos Rust
src-tauri/capabilities/
├── default.json                # permisos Tauri v2
└── http.json                   # allowlist HTTP (localhost:1234 + :11434)
src/assets/animations/
└── {idle,rasca,asiente,libreta,gametime}/  # 35 frames PNG 600×600
```

### Canvas de animación
- Tamaño fijo: 190×190px
- PNGs originales: 600×600 (normalizados)
- Escala: `190 / naturalHeight`, centrado horizontal
- Click-through: lee alpha pixel del canvas cada 30ms via `get_cursor_pos()` Rust + `set_ignore_cursor(bool)`

---

## COMANDOS RUST (lib.rs)

| Comando | Descripción |
|---------|-------------|
| `stream_lm_studio(messages, model, max_tokens, base_url)` | SSE streaming → emite `stream-chunk` / `stream-done` |
| `set_ignore_cursor(ignore: bool)` | Click-through nativo WKWebView |
| `get_cursor_pos()` | Posición cursor relativa a la ventana |
| `launch_confetti_window()` | Overlay fullscreen transparente, auto-cierra 2.2s |
| `launch_games_window(personality_mode)` | Ventana arcade 400×520 |
| `launch_history_window()` | Ventana historial 500×620 |
| `finish_game(completed, won, game)` | Cierra arcade + emite `game-result` a main |
| `score_pixel_art(base64_image, topic)` | IA puntúa pixel art (requiere modelo visión) |
| `update_global_shortcut(old_shortcut, new_shortcut)` | Re-registra atajo global |

Todos los comandos deben estar en `tauri::generate_handler![...]` en `pub fn run()`.

---

## SISTEMA DE IA

### Proveedores y auto-detección
```typescript
// useAIResponse.ts — orden de detección al montar
// 1. LM Studio  http://localhost:1234/v1/models
// 2. Ollama     http://localhost:11434/v1/models
// 3. Custom URL (desde store.customUrl)
// mountedRef pattern: evita loop — autoDetect() solo en useEffect([])
```

### Modelos thinking (Qwen, DeepSeek, R1)
```typescript
const isThinkingModel = /qwen|deepseek|r1/i.test(model)
// → stream: false + extraer reasoning_content, no content
// → max_tokens mínimo 2000
```

### Parámetros de streaming
- `stream: true` + comando Rust para modelos normales
- `stream: false` + tauriFetch para modelos thinking
- `max_tokens`: 400 con memoria, 800 sin memoria
- `base_url` siempre pasado como parámetro (multi-proveedor)

---

## SISTEMA DE VENTANAS

| Label | Tamaño | Características |
|-------|--------|----------------|
| `main` | 280×550 | transparente, always_on_top, sin decoraciones, closable: false |
| `games` | 400×520 | always_on_top, decoraciones, reabre si ya existe |
| `history` | 500×620 | centrada, no always_on_top, foco si ya existe |
| `confetti-{ts}` | fullscreen | transparente, ignore_cursor_events, auto-cierra 2.2s |

**Archivos HTML embebidos en el binario:** `confetti.html`, `games.html`, `history.html` — cualquier cambio requiere rebuild completo.

---

## PERMISOS (capabilities/default.json)

Permisos activos relevantes:
- `core:event:allow-listen` / `allow-emit` — eventos Tauri
- `global-shortcut:allow-register` / `allow-unregister`
- `core:window:allow-set-position` / `allow-set-size` / `allow-current-monitor`
- `core:window:allow-set-always-on-top` / `allow-start-dragging`

HTTP allowlist en `capabilities/http.json`:
- `http://localhost:1234/**` + `http://127.0.0.1:1234/**` (LM Studio)
- `http://localhost:11434/**` + `http://127.0.0.1:11434/**` (Ollama)

Al añadir un nuevo proveedor o puerto, actualizar `http.json`.

---

## BUGS CONOCIDOS Y FIXES

| Bug | Fix |
|-----|-----|
| SpeechRecognition denegado (TCC) | Requiere bundle `.app` firmado + `tccutil reset Microphone` si falla |
| CORS a localhost desde bundle firmado | Usar `@tauri-apps/plugin-http`, nunca `fetch()` nativo |
| Qwen/thinking models: `content` vacío | Extraer `reasoning_content` — `stream: false` + `max_tokens: 2000` |
| Confeti segunda vez falla | Label con timestamp: `confetti-{Date.now()}` |
| Transparencia Windows fondo gris | `backgroundColor: "#00000000"` en `tauri.conf.json` + `background: transparent` en CSS y div raíz |
| autoDetect en loop | `useEffect(() => { autoDetect() }, [])` — deps vacío, no `[autoDetect]` |
| `confirm()` bloqueado en WKWebView | Usar modal HTML custom (afecta `history.html`) |
| Botones bloqueados por click-through | Añadir atributo `data-*-btn="true"` al whitelist en `isDuckTransparent()` en App.tsx |

---

## STORE (store.ts) — campos persistidos

```typescript
// localStorage key: 'debugduck-storage'
aiProvider: 'lmstudio' | 'ollama' | 'custom'
customUrl: string
globalShortcut: string          // e.g. 'CommandOrControl+Shift+D'
responseLanguage: string        // 'es' | 'en' | 'fr' | 'de' | 'pt'
personalityMode: 'programmer' | 'general'
crueltyLevel: number            // 0-100
tamagotchiMode: boolean
duckHappiness: number           // 0-100, default 75
conversationMemory: boolean
gamesEnabled: boolean
gamesInterval: number           // minutos: 15|25|45|60
historyLog: HistoryItem[]       // máx 50, { id, timestamp, question, answer, model }
```

`conversationHistory` y `conversationSummary` son **session-only** — no se persisten.

---

## CHECKLIST ANTES DE COMMIT

- [ ] `npm run tauri build -- --debug` sin errores TypeScript ni Rust
- [ ] Codesign aplicado
- [ ] App abre y ventana transparente (sin fondo gris)
- [ ] Doble clic activa micrófono
- [ ] IA responde (🟢 en ajustes)
- [ ] Animaciones fluidas (no parpadeo)
- [ ] Click-through en zonas transparentes del pato
- [ ] Botones ⚙️🎮📋 accesibles y se ocultan al abrir ajustes
- [ ] Panel de ajustes hace scroll si el contenido no cabe

---

## FLUJO GIT

```bash
# Commits semánticos
feat: nueva funcionalidad
fix: corrección de bug
docs: solo documentación
chore: bump versión, deps
refactor: sin cambio de comportamiento

# Release
# 1. Actualizar version en src-tauri/tauri.conf.json
# 2. git tag v0.X.Y && git push origin v0.X.Y
# → GitHub Actions compila Mac + Windows automáticamente
```
