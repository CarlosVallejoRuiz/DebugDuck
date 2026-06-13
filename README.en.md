🌍 English | [Español](README.md)

<div align="center">

# 🦆 DebugDuck

**Your rubber duck with local AI. Always floating. Always judging you.**

[![Version](https://img.shields.io/badge/Version-v0.3.0-brightgreen?style=for-the-badge)](https://github.com/CarlosVallejoRuiz/DebugDuck/releases)
[![Tauri](https://img.shields.io/badge/Tauri_v2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-CE422B?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)

<img src="src/assets/DebugDuck.png" width="160" alt="DebugDuck mascot" />

*Rubber duck debugging, but with local AI, voice, animations and its own feelings.*

</div>

---

## What is DebugDuck?

A floating desktop widget for macOS that lives on top of all your windows. No distractions, no subscriptions, no data leaving your machine. Just you, your duck, and your local language model.

You talk. The duck thinks. The duck answers. If you ignore it for too long, it gets grumpy.

---

## ✨ Features

- 🎙️ **Voice activation** — double-click the duck to talk, Web Speech API
- ⌨️ **Global keyboard shortcut** — `Cmd+Shift+D` / `Ctrl+Shift+D`, configurable from any app
- 🧠 **100% local AI** — connects to LM Studio (`:1234`) or Ollama (`:11434`), no internet required
- 🔌 **Multi-server** — LM Studio, Ollama or custom URL with auto-detection
- 📡 **Real-time streaming** — responses appear token by token
- 🌍 **Multilingual** — responses in Spanish, English, French, German or Portuguese
- 🎭 **Two personalities** — Programmer (Socratic) or General (opinionated)
- 😈 **Cruelty slider** — from patient mentor to "obvious question for any senior dev"
- 🥚 **Tamagotchi mode** — the duck has a mood that affects its responses
- 🎬 **State animations** — idle, listening, thinking, responding, gametime (140 PNG frames)
- 🎉 **Eureka button** — fullscreen confetti + win counter
- 🍅 **Built-in Pomodoro** — 25-min timer with native notification
- 💬 **Conversation memory** — remembers context with automatic compression
- 📋 **Conversation history** — last 50 sessions persisted, with search and copy
- 🖱️ **Pixel-perfect click-through** — the duck doesn't intercept clicks on transparent areas
- 🔍 **Automatic model detection** — detects which model you have loaded
- 📐 **Configurable position** — 3×3 grid to move the widget to any corner
- 🎮 **Built-in Arcade** — 12 retro terminal mini-games when you've been working too long

---

## 🕹️ DebugDuck Arcade

After a configurable amount of time without playing, the duck suggests a break with a quick game. The game window uses retro terminal aesthetics: black background, phosphorescent green, monospace font and scanline effect.

> Games marked as **Adaptive** change their content based on the active mode (Programmer / General).

| Game | Description | Mode |
|------|-------------|------|
| 🎯 **Flappy Duck** | Dodge obstacles Flappy Bird style | All |
| 🧠 **Debug Quiz** | Programming or general culture trivia | Adaptive |
| 🎨 **Duck Pixel** | Draw and get scored by local AI | Requires vision |
| ⚡ **Rubber Duck Typing** | Technical or everyday typing speed test | Adaptive |
| 🔢 **Duck Math** | Mental math against the clock | All |
| ❌⭕ **Tic-Tac-Toe** | Play against the duck (perfect minimax) | All |
| 🃏 **Memory Duck** | Find matching pairs of tech cards | All |
| 🎵 **Duck Beat** | Simon Says with Web Audio API sounds | All |
| 🔢 **Sudoku Duck** | Complete the 4×4 grid without repeating | All |
| 🐛 **Bug Hunt** | Find the bug in code or logical error | Adaptive |
| 💬 **Duck Wordle** | Guess the word + AI-generated definition | Adaptive |
| 🚗 **Frogger Duck** | Infinite road with increasing speed | All |

### Arcade Configuration

- **Toggle** in Settings ⚙️ → enable/disable the system entirely
- **Frequency:** `[15m] [25m] [45m] [60m]` — work time between suggestions
- **Visible timer** in the settings panel with color coding (green → yellow → red)
- **Manual activation** with the 🎮 button next to the duck at any time

### Tamagotchi Integration

| Result | Happiness |
|--------|-----------|
| Complete any game | +5 |
| Win at Quiz, Math or Typing | +8 |
| Lose to the duck at Tic-Tac-Toe | +3 |

---

## 📋 System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| macOS | 12 Monterey | 14 Sonoma+ |
| RAM | 8 GB | 16 GB |
| Chip | Intel / Apple Silicon | Apple Silicon |
| [LM Studio](https://lmstudio.ai) | any version | latest version |
| Microphone | required | — |

---

## 🖥️ How to set up LM Studio (step by step)

### Step 1 — Download LM Studio

1. Go to **[lmstudio.ai](https://lmstudio.ai)**
2. Click the download button for your operating system (macOS or Windows)
3. Install the app normally and open it

### Step 2 — Download an AI model

Once LM Studio is open:

1. In the left sidebar, find the icon that looks like a **magnifying glass** 🔍 — it's called **Discover** or **Search**
2. Type in the search box: `mistral`
3. Find **Mistral 7B Instruct** in the results
4. Click the **Download** button that appears to the right of the model
5. Wait for it to finish downloading (may take several minutes)

> 💡 **Low RAM or small GPU?** Search for `phi-3-mini` instead — it only needs ~2 GB and works well for debugging

#### Recommended models

| Model | RAM / VRAM | Best for |
|-------|-----------|----------|
| `phi-3-mini` (Q4) | ~2 GB | PCs with limited memory |
| `mistralai/Ministral-3B` | ~3 GB | Light and fast |
| `mistralai/Mistral-7B-Instruct` | ~6 GB | **Recommended** — ideal balance |
| `meta-llama/Llama-3.1-8B-Instruct` | ~7 GB | Great for code |

> ⚠️ **Avoid "thinking" models** (Qwen3, DeepSeek-R1, names with `reasoning`) — DebugDuck supports them, but the experience is worse.

### Step 3 — Start the local server

This is the most important step to connect with DebugDuck:

1. In the left sidebar, find the icon that looks like **`<->`** — it's called **Local Server** or **Developer**
2. Click it to open the server panel
3. At the top you'll see a model selector — click it and select the model you downloaded
4. Click the **"Start Server"** button or toggle the **"Status"** switch
5. When you see **`Server running on port 1234`** or the indicator turns green ✅ — the server is ready

### Step 4 — Connect DebugDuck

1. Open DebugDuck
2. The duck will automatically detect LM Studio on startup
3. You'll see **🟢 Connected** in the settings panel ⚙️
4. Done! Double-click the duck and start talking

### ❓ Common issues

**The duck says "No connection":**
→ Verify the LM Studio server is active and shows `Running on port 1234`
→ Open settings ⚙️ → **AI Provider** section → click **↺ Auto-detect**

**"Failed to load model" error on Windows:**
→ Your GPU doesn't have enough memory for that model
→ In LM Studio, enable **"CPU only"** in the model settings before loading it
→ Or download a smaller model like `phi-3-mini`

**The model takes too long to respond:**
→ Large models are slow the first time they load
→ Try `phi-3-mini` or `Ministral-3B` if responses take more than 30 seconds

---

## 🤖 Alternative — Ollama

Ollama is easier to install and uses fewer resources than LM Studio:

```bash
# macOS (with Homebrew)
brew install ollama
ollama run llama3.2

# Windows — download the installer at ollama.com
```

Ollama runs on `localhost:11434`. DebugDuck detects it automatically just like LM Studio.

In settings ⚙️ → **AI Provider** → select **Ollama** if auto-detection doesn't find it.

---

## 🚀 Installation and development

### Prerequisites

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js 20+
# (Recommended: use nvm or fnm)
```

### Clone and install

```bash
git clone https://github.com/CarlosVallejoRuiz/DebugDuck.git
cd DebugDuck
npm install
```

### Development build (required — do not use `tauri dev`)

> ⚠️ The widget uses `SpeechRecognition` and `SpeechSynthesis`, which require a signed `.app` bundle on macOS. `tauri dev` does not work for this.

```bash
npm run tauri build -- --debug && \
codesign --sign - --force --deep \
  --entitlements src-tauri/entitlements.plist \
  src-tauri/target/debug/bundle/macos/DebugDuck.app && \
open src-tauri/target/debug/bundle/macos/DebugDuck.app
```

---

## 🦆 How to use DebugDuck

### Basic interaction

| Action | What it does |
|--------|-------------|
| **Double-click** the duck | Activates the microphone |
| Speak your question | The duck listens and transcribes |
| Wait for the response | "Scratching head" animation while thinking |
| Read the speech bubble | Scrollable comic-style response |
| **Eureka!** | You got it — confetti 🎉, +1 counter, +10 happiness |
| **Pomo** | Starts a 25-min Pomodoro timer 🍅 |
| **Double-click** (with bubble open) | Closes and returns to idle |

### Global keyboard shortcut

Activate the microphone from any app without touching the duck:

- **Default:** `Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows)
- **To change:** Settings ⚙️ → `⌨️ Keyboard shortcut` section → click **Change** → press the desired combination
- The duck shows a "🎙️ Shortcut activated" flash 0.8s before activating the microphone

### Settings ⚙️

Click the ⚙️ button to the right of the duck to open settings:

- **Personality** — `🦆 Programmer` (Socratic mode, doesn't give direct solutions) or `🌍 General` (talks about any topic)
- **AI Provider** — LM Studio / Ollama / Custom URL selector with connection indicator
- **Language** — Español / English / Français / Deutsch / Português
- **Tamagotchi mode** — enables the mood system
- **Cruelty slider** — only visible when Tamagotchi is off
- **Memory** — the duck remembers up to 4 messages + compressed summary
- **Keyboard shortcut** — configure the global shortcut
- **Mini-games** — ON/OFF toggle + frequency selector `[15m] [25m] [45m] [60m]` + countdown timer
- **Position** — 3×3 grid to move the widget

### 🥚 Tamagotchi Mode

When enabled, the duck's mood controls the tone of its responses instead of the cruelty slider:

| State | Happiness | Behavior |
|-------|-----------|----------|
| 😊 Happy | 70–100 | Enthusiastic, good vibes, funny comments |
| 😐 Neutral | 40–69 | Direct, gets the job done, moderate sarcasm |
| 😤 Grumpy | 20–39 | Curt, complains about being ignored |
| 😡 Furious | 0–19 | Very short answers, maximum sarcasm |

**Events that affect happiness:**

| Event | Change |
|-------|--------|
| Eureka! | +10 |
| Pomodoro completed | +5 |
| Long question (>8 words) | +3 |
| Very short question (<4 words) | −2 |
| More than 1h without interaction | −8 per hour (minimum 5) |

The status badge (emoji) appears next to the duck. Hover over it to see the health bar.

---

## 🏗️ Tech stack

| Technology | Use |
|-----------|-----|
| **Tauri v2** | Native macOS shell, transparent window, Rust commands |
| **React 19** | Declarative UI, hooks for logic |
| **TypeScript** | Static typing across the entire frontend |
| **Vite 8** | Build tool, HMR, PNG asset imports |
| **Tailwind CSS v4** | Utility-first styles |
| **Zustand** | Global state with localStorage persistence |
| **Rust / reqwest** | SSE streaming to LM Studio (CORS bypass in signed bundle) |
| **Web Speech API** | Voice recognition without external dependencies |
| **Canvas API** | Frame-by-frame animations + alpha sampling for click-through |

### Hook architecture

```
src/hooks/
├── useVoiceRecognition.ts   # Web Speech API + tech term correction
├── useAIResponse.ts         # LM Studio + SSE streaming + compressed memory
├── useAnimation.ts          # State-based animation system
├── usePomodoro.ts           # 25-min timer + native notification
├── useTamagotchi.ts         # Mood system + automatic decay
└── useWindowPosition.ts     # On-screen positioning via Rust
```

### Animation states

| State | Trigger | Description |
|-------|---------|-------------|
| `idle` | Default | Continuous loop + random animation every 8-15s |
| `listening` | Microphone active | Cycles scratch / nod / notebook |
| `thinking` | Waiting for AI response | Continuous scratch loop |
| `responding` | Response visible | Idle loop |
| `gametime` | Arcade window open | 3 phases: enter → loop → reverse exit |

---

## 🗺️ Roadmap v0.3.0

### ✅ Shipped in v0.3.0

| Feature | Description |
|---------|-------------|
| 🔌 **Ollama + custom URL** | Auto-detection LM Studio/Ollama, selector in Settings, custom URL support |
| 🌍 **Multilingual** | Responses in ES/EN/FR/DE/PT, translated UI, language persisted in Zustand |
| ⌨️ **Global keyboard shortcut** | Configurable `Cmd+Shift+D`, works from any app system-wide |
| 📋 **Conversation history** | Last 50 sessions persisted, search, copy, delete; dedicated window |
| 🎮 **Vertical buttons** | ⚙️🎮📋 stacked to the right of the duck, hidden when settings panel is open |

**v0.3.0 complete.**

---

## 🤝 Contributing

Want to implement a feature or have new ideas?

1. Fork the repository
2. Create a branch: `git checkout -b feat/feature-name`
3. Open a Pull Request describing the change

Any PR is welcome: new features, bug fixes, performance improvements, translations or documentation.

---

## 📄 License

MIT — do whatever you want, but if the duck helps you fix a bug, at least give it an Eureka.

---

<div align="center">

*Built with frustration, caffeine and rubber duck debugging.*

🦆

</div>
