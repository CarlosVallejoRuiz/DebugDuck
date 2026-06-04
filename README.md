<div align="center">

# 🦆 DebugDuck

**Tu pato de goma con IA local. Siempre flotando. Siempre juzgándote.**

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
- 🧠 **IA 100% local** — conecta con LM Studio en `localhost:1234`, sin internet
- 📡 **Streaming en tiempo real** — las respuestas aparecen token a token
- 🎭 **Dos personalidades** — Programador (socrático) o General (opinionado)
- 😈 **Slider de crueldad** — de mentor paciente a "pregunta obvia para cualquier senior"
- 🥚 **Modo Tamagotchi** — el pato tiene un estado de ánimo que afecta sus respuestas
- 🎬 **Animaciones por estados** — idle, escuchando, pensando, respondiendo (140 frames PNG)
- 🎉 **Botón Eureka** — confeti fullscreen + contador de victorias
- 🍅 **Pomodoro integrado** — timer 25min con notificación nativa
- 💬 **Memoria de conversación** — recuerda contexto con compresión automática
- 🖱️ **Click-through pixel-perfect** — el pato no intercepta clicks en áreas transparentes
- 🔍 **Detección automática de modelo** — detecta qué modelo tienes cargado en LM Studio
- 📐 **Posición configurable** — grid 3×3 para mover el widget a cualquier esquina

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

## 🤖 Configuración de LM Studio

### a) Instalación

1. Descarga [LM Studio](https://lmstudio.ai) e instálalo
2. Ábrelo y ve a la pestaña **Discover** para buscar modelos

### b) Modelos recomendados

| Modelo | VRAM / RAM | Notas |
|--------|-----------|-------|
| `mistralai/Ministral-3B` | ~3 GB | Ligero y rápido, buenas respuestas |
| `mistralai/Mistral-7B-Instruct` | ~6 GB | **Recomendado** — equilibrio ideal |
| `mistralai/Mistral-7B-Instruct-v0.3` | ~6 GB | Alternativa estable |
| `meta-llama/Llama-3.1-8B-Instruct` | ~7 GB | Sólido para preguntas técnicas |
| `google/gemma-2-9b-it` | ~9 GB | Excelente para código |

> ⚠️ **Evita modelos "thinking"** (Qwen3, DeepSeek-R1, nombres con `reasoning`). Usan tokens extra en razonamiento interno y ralentizan las respuestas. DebugDuck los soporta, pero la experiencia es peor.

### c) Activar el servidor local

1. Abre la pestaña **Local Server** en LM Studio
2. Selecciona un modelo y pulsa **Load Model**
3. Activa el toggle **Status** → debe mostrar `Running on port 1234`

### d) Conectar con DebugDuck

El pato detecta automáticamente el modelo activo al arrancar. Para cambiar de modelo en caliente:
- Abre ajustes ⚙️ → **Modelo activo** muestra el modelo detectado
- Pulsa **↺** para refrescar la detección

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

### Ajustes ⚙️

Hover sobre el pato → aparece el engranaje → clic para abrir ajustes:

- **Personalidad** — `🦆 Programador` (modo socrático, no da soluciones directas) o `🌍 General` (habla de cualquier tema)
- **Modo Tamagotchi** — activa el sistema de estado de ánimo
- **Slider de crueldad** — solo visible cuando Tamagotchi está desactivado
- **Memoria** — el pato recuerda hasta 4 mensajes + resumen comprimido
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

---

## 🗺️ Roadmap

- [ ] Build para Windows (ajustar transparencia y permisos)
- [ ] Soporte para Ollama como backend alternativo a LM Studio
- [ ] Historial de conversaciones persistente entre sesiones
- [ ] Modo multi-pato (más de un widget)
- [ ] Temas visuales para el pato
- [ ] Export de la conversación como Markdown
- [ ] Atajos de teclado globales para activar el micrófono

---

## 📄 Licencia

MIT — haz lo que quieras, pero si el pato te ayuda a resolver un bug, mínimo dale un Eureka.

---

<div align="center">

*Hecho con frustración, cafeína y rubber duck debugging.*

🦆

</div>
