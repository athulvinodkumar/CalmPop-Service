# CalmPop V2 — Workplace Wellbeing & Interactive Calm Platform

> 🌐 **Live Application:** [https://calmpopv2.vercel.app/](https://calmpopv2.vercel.app/)

A proactive, privacy-first workplace wellbeing application designed for employees and teams. CalmPop integrates intelligent pulse surveys, privacy-preserving tenant analytics, an AI-powered Wellbeing Companion, and five mindful interactive stress-relief activities with real-time procedural audio synthesis.

---

## 🌟 Key Features

### 1. Interactive Mindful Activities
Five tactile, non-competitive stress-relief experiences designed to restore focus and emotional equilibrium:

- **Zen Sand (Focus • Tired, Overwhelmed):**
  - Interactive sand garden with realistic 3-tine rake grooves and cast shadows.
  - Placed Japanese basalt stones with ground shadows.
  - Realistic wave smoothing action that washes across the sand to restore it.
  - Filtered whispering sand friction noise and sweeping ocean wave audio synthesis.
- **Calm Keys (Auditory • Anxious, Sad):**
  - Minimalist chime instrument supporting full Diatonic C Major (including F4 and B4) and Pentatonic mode.
  - Multi-partial acoustic bell synthesizer with serene overtone shimmer and gentle exponential decay.
  - Volume control, mute toggle, letter keybindings (`A–L`), and automated Gentle Sequences (Dawn Serenade, Flowing Stream, Starfield, Pentatonic Lullaby).
- **Star Catcher (Focus • Sad, Restless):**
  - Large light-celestial playfield with gently drifting multi-point stars and glowing nebulae.
  - Tap or click stars to trigger delicate stardust particle bursts and expanding rings.
  - Mindful non-competitive counter ("Stars Gathered"), pause/resume drift control, Stardust Cascade sparkle bursts, and celestial sine chimes.
- **Mandala Bloom (Creative • Restless, Okay):**
  - 8-way radial kaleidoscopic drawing canvas with 16-segment sacred reflection symmetry.
  - Shifting pastels mode cycling across vibrant pastel hues (`hsl(hue, 85%, 68%)`).
  - Pentatonic harmonic chime playback mapped to radius and stroke angle.
  - High-DPI antialiasing, brush size slider, live stroke hue badge, undo/redo history, and PNG artwork export.
- **Calm Soundscapes (Auditory • Anxious, Overwhelmed, Tired):**
  - 5 procedural ambient sound scenes (Ocean Waves, Gentle Rain, Whispering Forest, Summer Night, Cozy Campfire) synthesized in real-time with Web Audio API noise buffers, biquad filters, and oscillators (zero external audio files).
  - Real-time `AnalyserNode`-driven canvas visualizer featuring layered undulating waves, mirrored spectrum bars, and a pulsing central orb with dynamic per-scene color palettes.
  - Smooth 1.5-second crossfades when switching scenes, keyboard shortcuts (`1–5`, Space, M), Play/Pause, volume slider, mute toggle, and gentle sleep timer presets (15, 30, 60 min).

### 2. AI Wellbeing Companion
- Conversational support for workplace stress, burnout, difficult situations, and workload balance.
- Multi-provider AI integration via OpenRouter (`nvidia/nemotron-3.5-lightning`), Google Gemini, or OpenAI.
- Built-in safety protocols with crisis detection, de-escalation guidelines, and verified emergency helplines.
- Four distinct conversation modes: *Mindful Venting*, *Workplace Problem Solving*, *Boundary Setting*, and *Recharge & Breathe*.
- Automated structured action cards and personalized takeaway summaries.
- Strict cross-employee tenant isolation (conversations are completely invisible across users and HR admins).

### 3. Comprehensive 30-Question Wellbeing Survey
- Bank of 100 research-grounded questions across 10 critical dimensions (Workload, Emotional Stress, Sleep, Work-Life Balance, Focus, Team/Manager Support, etc.).
- 30 randomized questions selected without replacement per attempt with persistent question ordering.
- Transparent directional scoring calculating the employee's stress index (0–100%) and wellbeing indicators.
- Immediate personal insights and historical trend tracking in "My Wellbeing".

### 4. Enterprise Architecture & HR Insights
- Role-based views: Employee Portal, HR/People Analytics, and Superadmin mockups.
- Department-level aggregated anonymized reporting with k-anonymity (minimum 5 respondents required to display team statistics).
- Local SQLite database persistence (`calmpop.db`) for surveys, attempts, game sessions, and companion messages.

---

## 🛠 Tech Stack

- **Frontend:** Vanilla JavaScript (ES modules), Tailwind CSS, Canvas API, Web Audio API.
- **Backend / API:** Node.js, Express 5, Vite 6 development server.
- **Database:** SQLite (via `better-sqlite3`) initialized at `data/calmpop.db`.
- **AI Integration:** OpenAI-compatible API (`/chat/completions`) connecting to OpenRouter, NVIDIA Nemotron, or Gemini.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/athulvinodkumar/CalmPop-Service.git
cd CalmPop-Service
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and set your preferred AI provider key:
```env
AI_PROVIDER=openrouter
AI_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=your_openrouter_api_key_here
AI_MODEL=nvidia/nemotron-3.5-lightning
```

### 3. Run Development Server
Start the Vite dev server with integrated API middleware:
```bash
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
Preview the built application:
```bash
npm run preview
```

---

## 🧪 Testing

CalmPop includes dedicated test suites for the core systems:

- **Interactive Games System Test:**
  ```bash
  node scratch/test-games-system.js
  ```
  *(Verifies the 5-game catalog, game mechanics, obsolete file removals, controller lifecycles, and database table integrity - 122 assertions).*

- **Survey Flow Regression Test:**
  ```bash
  node scratch/test-survey-flow.js
  ```
  *(Verifies question selection, directional scoring, and survey submission lifecycle).*

- **AI Companion Security & Safety Test:**
  ```bash
  node scratch/test-companion-system.js
  ```
  *(Verifies crisis detection, helpline triggers, action cards, and cross-employee tenant isolation - 23 assertions).*

---

## 📁 Project Structure

```
CalmPop-V2/
├── data/                       # Local SQLite database (calmpop.db)
├── scratch/                    # Verification scripts and regression test suites
├── server/                     # Backend API services, AI companion, and DB schema
│   ├── aiService.js            # OpenRouter / Gemini / OpenAI LLM integration
│   ├── api.js                  # Express API routes (auth, surveys, companion, games)
│   ├── db.js                   # SQLite database initialization & tables
│   └── seed.js                 # Sample organizations & credentials seed
├── src/
│   ├── games/                  # Interactive stress-relief games subsystem
│   │   ├── implementations/    # Game controllers (zenSand, calmKeys, starCatcher, mandalaBloom, calmSoundscapes)
│   │   ├── views/              # Games gallery and session UI views
│   │   ├── audioSynth.js       # Real-time Web Audio API procedural sound engine
│   │   ├── catalog.js          # Metadata, recommended moods, and route definitions
│   │   └── gameShell.js        # Common game viewport wrapper with timer and controls
│   ├── views/                  # Main portal views (Employee, HR, Superadmin, Auth)
│   └── main.js                 # Application entrypoint & client-side router
├── index.html                  # Main single-page application HTML template
└── vite.config.js              # Vite configuration with Express API proxy
```

---

## 🔒 Privacy & Safety Notice

- **Non-Clinical Application:** CalmPop activities and surveys are designed for workplace relaxation, reflective mindfulness, and stress management. They do not diagnose, treat, or measure clinical mental health conditions.
- **Strict Privacy:** Survey responses and AI Companion chats are confidential and protected by tenant isolation. Individual chat logs and unaggregated responses are never exposed to employers or administrators.

---

## 📄 License

This project is proprietary and confidential. All rights reserved.
