<div align="center">

# 🦆 DebugDuck

**Tu pato de goma con IA local. Siempre flotando. Siempre juzgándote.**

[![Version](https://img.shields.io/badge/Version-v0.3.0-brightgreen?style=for-the-badge)](https://github.com/CarlosVallejoRuiz/DebugDuck/releases)
[![Tauri](https://img.shields.io/badge/Tauri_v2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-CE422B?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)

<img src="src/assets/DebugDuck.png" width="160" alt="DebugDuck mascot" />

*El rubber duck debugging, pero con IA local, voz, animaciones y sus propios sentimientos.*

</div>

---

## ¿Qué es DebugDuck?

Un widget de escritorio flotante para macOS que vive encima de todas tus ventanas. Sin distracciones, sin suscripciones, sin datos que salen de tu máquina. Solo tú, tu pato y tu modelo de lenguaje local.

Hablas. El pato piensa. El pato responde. Si lo abandonas mucho tiempo, se pone de mal humor.

---

## ✨ Features

- 🎙️ **Activación por voz** — doble clic en el pato para hablar, Web Speech API
- ⌨️ **Atajo de teclado global** — `Cmd+Shift+D` / `Ctrl+Shift+D` configurable desde cualquier app
- 🧠 **IA 100% local** — conecta con LM Studio (`:1234`) u Ollama (`:11434`), sin internet
- 🔌 **Multi-servidor** — LM Studio, Ollama o URL personalizada con detección automática
- 📡 **Streaming en tiempo real** — las respuestas aparecen token a token
- 🌍 **Multiidioma** — respuestas en Español, English, Français, Deutsch o Português
- 🎭 **Dos personalidades** — Programador (socrático) o General (opinionado)
- 😈 **Slider de crueldad** — de mentor paciente a "pregunta obvia para cualquier senior"
- 🥚 **Modo Tamagotchi** — el pato tiene un estado de ánimo que afecta sus respuestas
- 🎬 **Animaciones por estados** — idle, escuchando, pensando, respondiendo, gametime (140 frames PNG)
- 🎉 **Botón Eureka** — confeti fullscreen + contador de victorias
- 🍅 **Pomodoro integrado** — timer 25min con notificación nativa
- 💬 **Memoria de conversación** — recuerda contexto con compresión automática
- 📋 **Historial de conversaciones** — últimas 50 sesiones persistidas, con búsqueda y copiar
- 🖱️ **Click-through pixel-perfect** — el pato no intercepta clicks en áreas transparentes
- 🔍 **Detección automática de modelo** — detecta qué modelo tienes cargado
- 📐 **Posición configurable** — grid 3×3 para mover el widget a cualquier esquina
- 🎮 **Arcade integrado** — 12 minijuegos retro terminal cuando llevas mucho tiempo trabajando

---

## 🕹️ DebugDuck Arcade

Después de un tiempo configurable sin jugar, el pato te sugiere un descanso con una partida. La ventana de juegos es estética retro terminal: fondo negro, verde fosforescente, fuente monospace y efecto scanlines.

> Los juegos marcados como **Adaptable** cambian su contenido según el modo activo (Programador / General).

| Juego | Descripción | Modo |
|-------|-------------|------|
| 🎯 **Flappy Duck** | Esquiva obstáculos al estilo Flappy Bird | Todos |
| 🧠 **Debug Quiz** | Trivia de programación o cultura general | Adaptable |
| 🎨 **Pato Pixel** | Dibuja y recibe puntuación de la IA local | Requiere visión |
| ⚡ **Rubber Duck Typing** | Velocidad de escritura técnica o cotidiana | Adaptable |
| 🔢 **Duck Math** | Operaciones mentales contra el reloj | Todos |
| ❌⭕ **3 en Raya** | Juega contra el pato (minimax perfecto) | Todos |
| 🃏 **Memory Duck** | Encuentra las parejas de cartas técnicas | Todos |
| 🎵 **Duck Beat** | Simon Says con sonidos generados por Web Audio API | Todos |
| 🔢 **Sudoku Duck** | Completa el grid 4×4 sin repetir números | Todos |
| 🐛 **Bug Hunt** | Encuentra el bug en código o error lógico | Adaptable |
| 💬 **Duck Wordle** | Adivina la palabra + definición por IA local | Adaptable |
| 🚗 **Frogger Duck** | Carretera infinita con velocidad creciente | Todos |

### Configuración del Arcade

- **Toggle** en Ajustes ⚙️ → activar/desactivar el sistema completamente
- **Frecuencia:** `[15m] [25m] [45m] [60m]` — tiempo de trabajo entre sugerencias
- **Timer visible** en el panel de ajustes con código de colores (verde → amarillo → rojo)
- **Activación manual** con el botón 🎮 junto al pato en cualquier momento

### Integración Tamagotchi

| Resultado | Happiness |
|-----------|-----------|
| Completar cualquier juego | +5 |
| Ganar en Quiz, Math o Typing | +8 |
| Perder al pato en 3 en Raya | +3 |

---

## 📋 Requisitos del sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| macOS | 12 Monterey | 14 Sonoma+ |
| RAM | 8 GB | 16 GB |
| Chip | Intel / Apple Silicon | Apple Silicon |
| [LM Studio](https://lmstudio.ai) | cualquier versión | última versión |
| Micrófono | requerido | — |

---

## 🤖 Configuración del servidor de IA local

DebugDuck soporta **LM Studio** y **Ollama** con detección automática al arrancar. También acepta una URL personalizada para servidores corporativos.

### Opción A — LM Studio

1. Descarga [LM Studio](https://lmstudio.ai) e instálalo
2. Ábrelo y ve a la pestaña **Discover** para buscar modelos

#### Modelos recomendados

| Modelo | VRAM / RAM | Notas |
|--------|-----------|-------|
| `mistralai/Ministral-3B` | ~3 GB | Ligero y rápido, buenas respuestas |
| `mistralai/Mistral-7B-Instruct` | ~6 GB | **Recomendado** — equilibrio ideal |
| `mistralai/Mistral-7B-Instruct-v0.3` | ~6 GB | Alternativa estable |
| `meta-llama/Llama-3.1-8B-Instruct` | ~7 GB | Sólido para preguntas técnicas |
| `google/gemma-2-9b-it` | ~9 GB | Excelente para código |

> ⚠️ **Evita modelos "thinking"** (Qwen3, DeepSeek-R1, nombres con `reasoning`). DebugDuck los soporta, pero la experiencia es peor.

1. Abre la pestaña **Local Server** en LM Studio
2. Selecciona un modelo y pulsa **Load Model**
3. Activa el toggle **Status** → debe mostrar `Running on port 1234`

### Opción B — Ollama

```bash
# Instalar Ollama
brew install ollama

# Descargar y arrancar un modelo
ollama run llama3.2
```

Ollama corre en `localhost:11434` por defecto. DebugDuck lo detecta automáticamente.

### Conectar con DebugDuck

El pato detecta automáticamente qué servidor está activo al arrancar (primero LM Studio, luego Ollama). El indicador en ajustes muestra 🟢 Conectado o 🔴 Sin conexión.

- Abre ajustes ⚙️ → **Proveedor IA** → selecciona LM Studio / Ollama / Custom
- **Modelo activo** muestra el modelo detectado → pulsa **↺** para refrescar

---

## 🚀 Instalación y desarrollo

### Prerrequisitos

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js 20+
# (Recomendado: usar nvm o fnm)
```

### Clonar y arrancar

```bash
git clone https://github.com/tu-usuario/DebugDuck.git
cd DebugDuck
npm install
```

### Build de desarrollo (requerido — no usar `tauri dev`)

> ⚠️ El widget usa `SpeechRecognition` y `SpeechSynthesis`, que requieren un bundle `.app` firmado en macOS. `tauri dev` no funciona para esto.

```bash
npm run tauri build -- --debug && \
codesign --sign - --force --deep \
  --entitlements src-tauri/entitlements.plist \
  src-tauri/target/debug/bundle/macos/DebugDuck.app && \
open src-tauri/target/debug/bundle/macos/DebugDuck.app
```

---

## 🦆 Cómo usar DebugDuck

### Interacción básica

| Acción | Qué hace |
|--------|----------|
| **Doble clic** en el pato | Activa el micrófono |
| Habla tu pregunta | El pato escucha y transcribe |
| Espera la respuesta | Animación "rasca cabeza" mientras piensa |
| Lee el bocadillo | Respuesta scrolleable estilo cómic |
| **¡Eureka!** | Entendiste — confeti 🎉, +1 contador, +10 felicidad |
| **Pomo** | Inicia timer Pomodoro de 25 min 🍅 |
| **Doble clic** (con bocadillo abierto) | Cierra y vuelve a idle |

### Atajo de teclado global

Activa el micrófono desde cualquier app sin tocar el pato:

- **Por defecto:** `Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows)
- **Para cambiar:** Ajustes ⚙️ → sección `⌨️ Atajo de teclado` → clic en **Cambiar** → pulsa la combinación deseada
- El pato muestra un flash "🎙️ Atajo activado" 0.8s antes de activar el micrófono

### Ajustes ⚙️

Clic en el botón ⚙️ a la derecha del pato para abrir ajustes:

- **Personalidad** — `🦆 Programador` (modo socrático, no da soluciones directas) o `🌍 General` (habla de cualquier tema)
- **Proveedor IA** — selector LM Studio / Ollama / Custom URL con indicador de conexión
- **Idioma** — Español / English / Français / Deutsch / Português
- **Modo Tamagotchi** — activa el sistema de estado de ánimo
- **Slider de crueldad** — solo visible cuando Tamagotchi está desactivado
- **Memoria** — el pato recuerda hasta 4 mensajes + resumen comprimido
- **Atajo de teclado** — configura el shortcut global
- **Minijuegos** — toggle ON/OFF + selector de frecuencia `[15m] [25m] [45m] [60m]` + timer de cuenta atrás
- **Posición** — grid 3×3 para mover el widget

### 🥚 Modo Tamagotchi

Cuando está activado, el estado de ánimo del pato controla el tono de sus respuestas en lugar del slider de crueldad:

| Estado | Happiness | Comportamiento |
|--------|-----------|----------------|
| 😊 Feliz | 70–100 | Entusiasta, buen rollo, comentarios divertidos |
| 😐 Neutral | 40–69 | Directo, trabajo hecho, sarcasmo moderado |
| 😤 Malhumorado | 20–39 | Cortante, se queja del abandono |
| 😡 Furioso | 0–19 | Respuestas muy cortas, sarcasmo al máximo |

**Eventos que modifican la felicidad:**

| Evento | Cambio |
|--------|--------|
| ¡Eureka! | +10 |
| Pomodoro completado | +5 |
| Pregunta larga (>8 palabras) | +3 |
| Pregunta muy corta (<4 palabras) | −2 |
| Más de 1h sin interacción | −8 por hora (mínimo 5) |

El badge de estado (emoji) aparece a la izquierda del pato. Hover sobre él para ver la barra de vida.

---

## 🏗️ Tech stack

| Tecnología | Uso |
|-----------|-----|
| **Tauri v2** | Shell nativo macOS, ventana transparente, comandos Rust |
| **React 19** | UI declarativa, hooks para lógica |
| **TypeScript** | Tipado estático en todo el frontend |
| **Vite 8** | Build tool, HMR, import de assets PNG |
| **Tailwind CSS v4** | Estilos utility-first |
| **Zustand** | Estado global con persistencia en localStorage |
| **Rust / reqwest** | Streaming SSE a LM Studio (bypass CORS en bundle firmado) |
| **Web Speech API** | Reconocimiento de voz sin dependencias externas |
| **Canvas API** | Animaciones frame-by-frame + alpha sampling para click-through |

### Arquitectura de hooks

```
src/hooks/
├── useVoiceRecognition.ts   # Web Speech API + corrección de términos técnicos
├── useAIResponse.ts         # LM Studio + streaming SSE + memoria comprimida
├── useAnimation.ts          # Sistema de animaciones por estado
├── usePomodoro.ts           # Timer 25min + notificación nativa
├── useTamagotchi.ts         # Sistema de estado de ánimo + decay automático
└── useWindowPosition.ts     # Posicionamiento en pantalla via Rust
```

### Estados de animación

| Estado | Trigger | Descripción |
|--------|---------|-------------|
| `idle` | Por defecto | Loop continuo + animación aleatoria cada 8-15s |
| `listening` | Micrófono activo | Cicla rasca / asiente / libreta |
| `thinking` | Esperando respuesta IA | Loop rasca continuo |
| `responding` | Respuesta visible | Loop idle |
| `gametime` | Ventana arcade abierta | 3 fases: entrada → loop → salida inversa |

---

## 🗺️ Roadmap v0.3.0

### ✅ Implementado en v0.3.0

| Feature | Descripción |
|---------|-------------|
| 🔌 **Ollama + URL personalizada** | Detección automática LM Studio/Ollama, selector en Ajustes, soporte URL custom |
| 🌍 **Multiidioma** | Respuestas en ES/EN/FR/DE/PT, UI traducida, idioma persistido en Zustand |
| ⌨️ **Atajo de teclado global** | `Cmd+Shift+D` configurable, funciona desde cualquier app del sistema |
| 📋 **Historial de conversaciones** | Últimas 50 sesiones persistidas, búsqueda, copiar, borrar; ventana dedicada |
| 🎮 **Botones verticales** | ⚙️🎮📋 apilados a la derecha del pato, se ocultan con el panel de ajustes |

### ⏳ Pendiente en v0.4.0

### 🔕 Modo No Molestar automático
- Detecta reuniones activas en el calendario del sistema (macOS/Windows)
- El pato se oculta o minimiza durante reuniones
- Indicador visual `🔕` y toggle manual en Ajustes

---

## 🤝 Contribuir

¿Quieres implementar alguna feature del roadmap o tienes ideas nuevas?

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feat/nombre-feature`
3. Abre un Pull Request describiendo el cambio

Cualquier PR es bienvenido: nuevas features, bug fixes, mejoras de rendimiento, traducciones o documentación.

---

## 📄 Licencia

MIT — haz lo que quieras, pero si el pato te ayuda a resolver un bug, mínimo dale un Eureka.

---

<div align="center">

*Hecho con frustración, cafeína y rubber duck debugging.*

🦆

</div>
