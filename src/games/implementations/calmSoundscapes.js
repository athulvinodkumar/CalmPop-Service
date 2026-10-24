// CalmPop - Calm Soundscapes Interactive Auditory Experience
// Procedural ambient sound generator with 5 Web Audio scenes (Waves, Rain, Forest, Night, Campfire),
// real-time AnalyserNode reactive canvas visualizer, sleep timer, and smooth crossfades.
// Pure Web Audio API: Zero external audio files and zero npm dependencies.

export const SCENES = [
  {
    id: 'waves',
    name: 'Ocean Waves',
    shortName: 'Waves',
    key: '1',
    icon: 'tsunami',
    badgeColor: 'from-cyan-500 to-teal-500',
    description: 'Rhythmic ocean swells and gentle coastal surf',
    theme: {
      primary: '#06b6d4',
      secondary: '#0d9488',
      accent: '#38bdf8',
      glow: 'rgba(6, 182, 212, 0.45)',
      ambientBg: 'rgba(6, 30, 42, 0.85)'
    }
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    shortName: 'Rain',
    key: '2',
    icon: 'rainy',
    badgeColor: 'from-sky-500 to-blue-600',
    description: 'Steady soothing rain with soft droplet resonance',
    theme: {
      primary: '#38bdf8',
      secondary: '#2563eb',
      accent: '#93c5fd',
      glow: 'rgba(56, 189, 248, 0.45)',
      ambientBg: 'rgba(10, 25, 45, 0.85)'
    }
  },
  {
    id: 'forest',
    name: 'Whispering Forest',
    shortName: 'Forest',
    key: '3',
    icon: 'forest',
    badgeColor: 'from-emerald-500 to-teal-600',
    description: 'Gentle canopy wind and randomized harmonic birdsong',
    theme: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#a3e635',
      glow: 'rgba(16, 185, 129, 0.45)',
      ambientBg: 'rgba(6, 32, 22, 0.85)'
    }
  },
  {
    id: 'night',
    name: 'Summer Night',
    shortName: 'Night',
    key: '4',
    icon: 'bedtime',
    badgeColor: 'from-indigo-500 to-violet-600',
    description: 'Warm cricket chorus under quiet twilight skies',
    theme: {
      primary: '#818cf8',
      secondary: '#6366f1',
      accent: '#c084fc',
      glow: 'rgba(129, 140, 248, 0.45)',
      ambientBg: 'rgba(15, 15, 38, 0.85)'
    }
  },
  {
    id: 'campfire',
    name: 'Cozy Campfire',
    shortName: 'Campfire',
    key: '5',
    icon: 'local_fire_department',
    badgeColor: 'from-amber-500 to-orange-600',
    description: 'Warm ember rumble with gentle organic crackles',
    theme: {
      primary: '#f59e0b',
      secondary: '#ea580c',
      accent: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.45)',
      ambientBg: 'rgba(35, 15, 8, 0.85)'
    }
  }
];

// HTML Renderer for GameShell or standalone container
export function renderCalmSoundscapes(sessionManager, options = {}) {
  const currentSceneId = options.initialScene || 'waves';
  const initialScene = SCENES.find(s => s.id === currentSceneId) || SCENES[0];

  return `
    <div id="calm-soundscapes-root" class="relative w-full flex flex-col items-center justify-between min-h-[560px] p-2 sm:p-4 select-none focus:outline-none" tabindex="0">
      
      <!-- Top Scene Selection Toolbar -->
      <header class="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/75 backdrop-blur-md px-3 sm:px-5 py-2.5 rounded-2xl border border-surface-container mb-3 text-xs z-10 shadow-xs">
        
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[18px]">graphic_eq</span>
          <span class="text-on-surface font-bold text-xs">Scenes:</span>
          <span class="text-[10px] text-outline hidden sm:inline">(Press 1–5 to switch)</span>
        </div>

        <!-- 5 Scene Selector Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap" role="tablist" aria-label="Soundscape scenes">
          ${SCENES.map(scene => `
            <button 
              type="button" 
              id="btn-scene-${scene.id}" 
              data-scene="${scene.id}"
              class="soundscape-scene-btn px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 border border-transparent ${scene.id === initialScene.id ? 'bg-primary text-white font-bold shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'}"
              title="Switch to ${scene.name} (Key ${scene.key})"
            >
              <span class="material-symbols-outlined text-[15px]">${scene.icon}</span>
              <span class="text-xs">${scene.shortName}</span>
              <span class="text-[9px] px-1 py-0.2 rounded bg-black/20 font-mono opacity-80">${scene.key}</span>
            </button>
          `).join('')}
        </div>

      </header>

      <!-- Main Visual Instrument Stage -->
      <section class="relative w-full max-w-4xl flex-1 min-h-[420px] rounded-3xl bg-slate-950 shadow-2xl border border-surface-container flex flex-col justify-between overflow-hidden">
        
        <!-- Ambient Sound Visualizer Canvas -->
        <canvas id="soundscape-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-0"></canvas>

        <!-- Dynamic Overlay / Scene Information Header -->
        <div class="relative z-10 flex items-center justify-between p-4 sm:p-6 text-white/90 pointer-events-none">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span id="soundscape-badge-icon" class="material-symbols-outlined text-cyan-400 text-[20px]">${initialScene.icon}</span>
              <h2 id="soundscape-title" class="font-headline-sm text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-md">
                ${initialScene.name}
              </h2>
            </div>
            <p id="soundscape-description" class="text-xs text-white/70 max-w-sm drop-shadow-sm">
              ${initialScene.description}
            </p>
          </div>

          <!-- Live Audio Activity Indicator Badge -->
          <div class="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
            <span id="soundscape-live-dot" class="w-2 h-2 rounded-full bg-slate-500 transition-colors"></span>
            <span id="soundscape-audio-state-text" class="text-[11px] font-semibold text-white/80">Ready</span>
          </div>
        </div>

        <!-- Start Overlay Prompt (Shows before first play gesture) -->
        <div id="soundscape-start-overlay" class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm text-center transition-opacity duration-500">
          <div class="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-surface-container-lowest/90 border border-surface-container shadow-2xl space-y-4">
            <div class="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
              <span class="material-symbols-outlined text-[36px]">headphones</span>
            </div>
            <div class="space-y-1.5">
              <h3 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Calm Soundscapes</h3>
              <p class="text-xs text-on-surface-variant leading-relaxed">
                Immerse yourself in gentle, procedurally generated natural soundscapes designed to calm a busy mind and encourage ease.
              </p>
            </div>
            <div class="pt-2">
              <button 
                type="button" 
                id="btn-soundscape-start"
                class="w-full py-3 px-6 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Begin Listening</span>
              </button>
            </div>
            <p class="text-[11px] text-outline">
              Pure audio synthesized right in your browser. No files downloaded.
            </p>
          </div>
        </div>

        <!-- Bottom Integrated Audio Controls Floating Pill -->
        <div class="relative z-10 w-full p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <!-- Left: Play/Pause & Mute Button -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <button 
              type="button" 
              id="btn-soundscape-toggle-play" 
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 border border-white/15 transition-all shadow-xs"
              title="Play / Pause Soundscape (Space)"
            >
              <span id="soundscape-play-icon" class="material-symbols-outlined text-[18px]">play_arrow</span>
              <span id="soundscape-play-label">Play</span>
            </button>

            <button 
              type="button" 
              id="btn-soundscape-toggle-mute" 
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
              title="Mute / Unmute (M)"
            >
              <span id="soundscape-mute-icon" class="material-symbols-outlined text-[18px]">volume_up</span>
            </button>

            <!-- Volume Slider -->
            <div class="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10" title="Adjust Soundscape Volume">
              <span class="material-symbols-outlined text-[14px] text-white/60">volume_down</span>
              <input 
                type="range" 
                id="soundscape-volume-slider" 
                min="0" 
                max="1" 
                step="0.01" 
                value="0.75" 
                class="w-16 sm:w-24 accent-primary cursor-pointer"
              />
              <span class="material-symbols-outlined text-[14px] text-white/60">volume_up</span>
            </div>
          </div>

          <!-- Right: Sleep Timer Presets -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end text-white/80">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[15px] text-white/60">bedtime</span>
              <span class="text-[11px] font-medium hidden md:inline">Sleep Timer:</span>
            </div>

            <div class="inline-flex rounded-xl bg-black/40 p-0.5 border border-white/10" role="radiogroup" aria-label="Sleep timer duration">
              <button type="button" data-timer="900" class="timer-preset-btn px-2 py-1 rounded-lg text-[10px] font-semibold text-white/70 hover:text-white transition-all">15m</button>
              <button type="button" data-timer="1800" class="timer-preset-btn px-2 py-1 rounded-lg text-[10px] font-semibold text-white/70 hover:text-white transition-all">30m</button>
              <button type="button" data-timer="3600" class="timer-preset-btn px-2 py-1 rounded-lg text-[10px] font-semibold text-white/70 hover:text-white transition-all">60m</button>
              <button type="button" data-timer="0" class="timer-preset-btn px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/20 text-white shadow-xs">∞</button>
            </div>

            <span id="soundscape-timer-countdown" class="text-[10px] font-mono text-white/70 min-w-[36px] text-right"></span>
          </div>

        </div>

      </section>

      <!-- Bottom Hint Note -->
      <footer class="w-full max-w-4xl flex items-center justify-between text-[11px] text-outline mt-2.5 px-2">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">nature_people</span>
          <span>Switch scenes anytime with number keys 1 to 5. Smooth crossfade softens transitions.</span>
        </span>
        <span class="hidden sm:inline">Space: Play/Pause • M: Mute</span>
      </footer>

    </div>
  `;
}

// Controller Class managing AudioContext, procedural synthesis, and visual rendering
export class CalmSoundscapesController {
  constructor(sessionManager, options = {}) {
    this.sessionManager = sessionManager;
    this.options = options;
    
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;
    this.dataArray = null;
    this.timeDomainArray = null;

    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.75;
    this.activeSceneId = options.initialScene || 'waves';
    
    this.currentSoundNode = null;
    this.fadingSoundNode = null;

    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.displayWidth = 0;
    this.displayHeight = 0;

    // Sleep timer state
    this.sleepTimerSeconds = 0; // 0 = continuous
    this.sleepTimerRemaining = 0;
    this.sleepTimerInterval = null;
    this.fadeTimeout = null;

    // Bound listeners for clean teardown
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.canvas = document.getElementById('soundscape-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.setupCanvasSize();
      this.startVisualizerLoop();
    }

    this.attachDomListeners();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);

    // If sessionManager is active, sync with its duration
    if (this.sessionManager && this.sessionManager.targetDurationSeconds) {
      const dur = this.sessionManager.targetDurationSeconds;
      this.setSleepTimer(dur, false);
    }
  }

  setupCanvasSize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  handleResize() {
    this.setupCanvasSize();
  }

  attachDomListeners() {
    // Start Overlay button
    const startBtn = document.getElementById('btn-soundscape-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startAudio();
      });
    }

    // Play/Pause button
    const playToggleBtn = document.getElementById('btn-soundscape-toggle-play');
    if (playToggleBtn) {
      playToggleBtn.addEventListener('click', () => {
        this.togglePlayPause();
      });
    }

    // Mute button
    const muteBtn = document.getElementById('btn-soundscape-toggle-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        this.toggleMute();
      });
    }

    // Volume slider
    const volSlider = document.getElementById('soundscape-volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        this.setVolume(parseFloat(e.target.value));
      });
    }

    // Scene buttons
    document.querySelectorAll('.soundscape-scene-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sceneId = btn.dataset.scene;
        if (sceneId && sceneId !== this.activeSceneId) {
          this.switchScene(sceneId);
        }
      });
    });

    // Sleep timer preset buttons
    document.querySelectorAll('.timer-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const seconds = parseInt(btn.dataset.timer, 10);
        this.setSleepTimer(seconds, true);
      });
    });
  }

  handleKeyDown(e) {
    // Ignore key presses if user is in an input field
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key, 10) - 1;
      if (SCENES[idx]) {
        this.switchScene(SCENES[idx].id);
      }
    } else if (e.code === 'Space') {
      e.preventDefault();
      this.togglePlayPause();
    } else if (e.key === 'm' || e.key === 'M') {
      this.toggleMute();
    }
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

      // Analyser Node for reactive visualization
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainArray = new Uint8Array(this.analyser.fftSize);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startAudio() {
    this.ensureAudioContext();

    // Hide start overlay
    const overlay = document.getElementById('soundscape-start-overlay');
    if (overlay) {
      overlay.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => overlay.classList.add('hidden'), 500);
    }

    this.isPlaying = true;
    this.playScene(this.activeSceneId);
    this.updateControlsUi();

    if (this.sessionManager && this.sessionManager.status === 'initialized') {
      this.sessionManager.start();
    }
  }

  togglePlayPause() {
    if (!this.isPlaying) {
      this.startAudio();
    } else {
      this.pauseAudio();
    }
  }

  pauseAudio() {
    if (this.audioCtx && this.isPlaying) {
      // Smooth fade out before pausing
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0.0001, this.audioCtx.currentTime, 0.15);
      }
      setTimeout(() => {
        if (!this.isPlaying && this.audioCtx && this.audioCtx.state === 'running') {
          this.audioCtx.suspend();
        }
      }, 200);
      this.isPlaying = false;
      this.updateControlsUi();

      if (this.sessionManager && this.sessionManager.status === 'in_progress') {
        this.sessionManager.pause();
      }
    }
  }

  resumeAudio() {
    if (!this.isPlaying) {
      this.ensureAudioContext();
      this.isPlaying = true;
      if (this.masterGain) {
        const target = this.isMuted ? 0 : this.volume;
        this.masterGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.2);
      }
      this.updateControlsUi();

      if (this.sessionManager && this.sessionManager.status === 'paused') {
        this.sessionManager.resume();
      }
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
    }
    const volSlider = document.getElementById('soundscape-volume-slider');
    if (volSlider && parseFloat(volSlider.value) !== this.volume) {
      volSlider.value = this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.08);
    }
    this.updateControlsUi();
  }

  switchScene(sceneId) {
    const scene = SCENES.find(s => s.id === sceneId);
    if (!scene) return;

    this.activeSceneId = sceneId;
    this.updateSceneHeaderUi(scene);

    if (this.isPlaying) {
      this.crossfadeToScene(sceneId);
    }
  }

  crossfadeToScene(sceneId) {
    this.ensureAudioContext();

    const crossfadeDuration = 1.5;
    const now = this.audioCtx.currentTime;

    // Fade out current sound node
    if (this.currentSoundNode) {
      const oldNode = this.currentSoundNode;
      oldNode.gainNode.gain.setValueAtTime(oldNode.gainNode.gain.value, now);
      oldNode.gainNode.gain.linearRampToValueAtTime(0.0001, now + crossfadeDuration);
      
      setTimeout(() => {
        try {
          oldNode.stop();
        } catch (_) {}
      }, crossfadeDuration * 1000 + 100);
    }

    // Start new sound node with ramp up
    const newNode = this.createSceneNode(sceneId);
    newNode.gainNode.gain.setValueAtTime(0.0001, now);
    newNode.gainNode.gain.linearRampToValueAtTime(newNode.targetGain, now + crossfadeDuration);
    
    this.currentSoundNode = newNode;
  }

  playScene(sceneId) {
    this.ensureAudioContext();

    if (this.currentSoundNode) {
      try { this.currentSoundNode.stop(); } catch (_) {}
      this.currentSoundNode = null;
    }

    const node = this.createSceneNode(sceneId);
    const now = this.audioCtx.currentTime;
    node.gainNode.gain.setValueAtTime(0.0001, now);
    node.gainNode.gain.linearRampToValueAtTime(node.targetGain, now + 0.8);
    this.currentSoundNode = node;
  }

  // Procedural Sound Scene Generator Factory
  createSceneNode(sceneId) {
    const ctx = this.audioCtx;
    const gainNode = ctx.createGain();
    gainNode.connect(this.masterGain);

    let stopFn = () => {};
    let targetGain = 0.85;

    switch (sceneId) {
      case 'waves': {
        targetGain = 0.8;
        stopFn = this.buildWavesSound(ctx, gainNode);
        break;
      }
      case 'rain': {
        targetGain = 0.75;
        stopFn = this.buildRainSound(ctx, gainNode);
        break;
      }
      case 'forest': {
        targetGain = 0.8;
        stopFn = this.buildForestSound(ctx, gainNode);
        break;
      }
      case 'night': {
        targetGain = 0.7;
        stopFn = this.buildNightSound(ctx, gainNode);
        break;
      }
      case 'campfire': {
        targetGain = 0.85;
        stopFn = this.buildCampfireSound(ctx, gainNode);
        break;
      }
      default: {
        targetGain = 0.8;
        stopFn = this.buildWavesSound(ctx, gainNode);
      }
    }

    return {
      id: sceneId,
      gainNode,
      targetGain,
      stop: () => {
        try { stopFn(); } catch (_) {}
        try { gainNode.disconnect(); } catch (_) {}
      }
    };
  }

  // 1. Ocean Waves Procedural Synthesis
  buildWavesSound(ctx, destination) {
    // Pink noise buffer (3 seconds looped)
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Resonant Biquad Filter modulated with slow LFO for wave surges
    const waveFilter = ctx.createBiquadFilter();
    waveFilter.type = 'lowpass';
    waveFilter.frequency.setValueAtTime(320, ctx.currentTime);
    waveFilter.Q.setValueAtTime(2.5, ctx.currentTime);

    // LFO (0.09 Hz = ~11-second ocean wave cycle)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.09, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(260, ctx.currentTime); // sweeps between 60Hz and 580Hz

    lfo.connect(lfoGain);
    lfoGain.connect(waveFilter.frequency);

    // Deep sub-bass swell oscillator (48 Hz)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(48, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.12, ctx.currentTime);

    // Modulate sub gain with the wave cycle
    const subLfoGain = ctx.createGain();
    subLfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
    lfo.connect(subLfoGain);
    subLfoGain.connect(subGain.gain);

    // Secondary high froth shimmer
    const frothFilter = ctx.createBiquadFilter();
    frothFilter.type = 'bandpass';
    frothFilter.frequency.setValueAtTime(900, ctx.currentTime);
    frothFilter.Q.setValueAtTime(1.0, ctx.currentTime);
    const frothGain = ctx.createGain();
    frothGain.gain.setValueAtTime(0.15, ctx.currentTime);

    // Wire up
    noiseSource.connect(waveFilter);
    waveFilter.connect(destination);

    noiseSource.connect(frothFilter);
    frothFilter.connect(frothGain);
    frothGain.connect(destination);

    subOsc.connect(subGain);
    subGain.connect(destination);

    noiseSource.start();
    lfo.start();
    subOsc.start();

    return () => {
      try { noiseSource.stop(); } catch (_) {}
      try { lfo.stop(); } catch (_) {}
      try { subOsc.stop(); } catch (_) {}
      noiseSource.disconnect();
      waveFilter.disconnect();
      lfo.disconnect();
      subOsc.disconnect();
      subGain.disconnect();
      frothFilter.disconnect();
    };
  }

  // 2. Gentle Rain Procedural Synthesis
  buildRainSound(ctx, destination) {
    // White noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Steady rain bandpass filter
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1600, ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, ctx.currentTime);

    // Low gentle rumble (roof / window pane)
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(350, ctx.currentTime);
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.2, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(destination);

    rainSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(destination);

    rainSource.start();

    // Stochastic Water Droplets Generator
    let dropTimer = null;
    let isStopped = false;

    const scheduleNextDrop = () => {
      if (isStopped) return;
      const delay = 80 + Math.random() * 250;
      dropTimer = setTimeout(() => {
        if (isStopped) return;
        this.playWaterDrop(ctx, destination);
        scheduleNextDrop();
      }, delay);
    };

    scheduleNextDrop();

    return () => {
      isStopped = true;
      if (dropTimer) clearTimeout(dropTimer);
      try { rainSource.stop(); } catch (_) {}
      rainSource.disconnect();
      rainFilter.disconnect();
      rumbleFilter.disconnect();
    };
  }

  playWaterDrop(ctx, destination) {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startFreq = 1200 + Math.random() * 800;
    const endFreq = startFreq * (0.6 + Math.random() * 0.2);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);

    gain.gain.setValueAtTime(0.04 + Math.random() * 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.06);
    setTimeout(() => {
      try { osc.disconnect(); gain.disconnect(); } catch (_) {}
    }, 80);
  }

  // 3. Whispering Forest & Birdsong Procedural Synthesis
  buildForestSound(ctx, destination) {
    // Canopy Wind (Pink Noise through sweeping filter)
    const bufferSize = ctx.sampleRate * 2.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(450, ctx.currentTime);
    windFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    // Subtle gentle tree sway LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.4, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(destination);

    windSource.start();
    lfo.start();

    // Procedural Gentle Birdsong Chirps
    let birdTimer = null;
    let isStopped = false;

    const scheduleBirdChirp = () => {
      if (isStopped) return;
      const delay = 2200 + Math.random() * 4500;
      birdTimer = setTimeout(() => {
        if (isStopped) return;
        this.playBirdChirp(ctx, destination);
        scheduleBirdChirp();
      }, delay);
    };

    scheduleBirdChirp();

    return () => {
      isStopped = true;
      if (birdTimer) clearTimeout(birdTimer);
      try { windSource.stop(); } catch (_) {}
      try { lfo.stop(); } catch (_) {}
      windSource.disconnect();
      windFilter.disconnect();
      lfo.disconnect();
      windGain.disconnect();
    };
  }

  playBirdChirp(ctx, destination) {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const chirpCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < chirpCount; i++) {
      const chirpTime = now + (i * 0.12);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 2600 + (Math.random() - 0.5) * 600;
      osc.frequency.setValueAtTime(baseFreq, chirpTime);
      osc.frequency.linearRampToValueAtTime(baseFreq + 700 + Math.random() * 400, chirpTime + 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, chirpTime + 0.09);

      gain.gain.setValueAtTime(0.0001, chirpTime);
      gain.gain.linearRampToValueAtTime(0.045, chirpTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.09);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(chirpTime);
      osc.stop(chirpTime + 0.1);

      setTimeout(() => {
        try { osc.disconnect(); gain.disconnect(); } catch (_) {}
      }, (chirpCount * 150) + 100);
    }
  }

  // 4. Summer Night & Cricket Chorus Procedural Synthesis
  buildNightSound(ctx, destination) {
    // Distant nocturnal breeze
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const breezeSource = ctx.createBufferSource();
    breezeSource.buffer = buffer;
    breezeSource.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.setValueAtTime(280, ctx.currentTime);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.25, ctx.currentTime);

    breezeSource.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(destination);

    breezeSource.start();

    // Harmonic Crickets (Multiple frequency cluster with tremolo pulse)
    const cricketCluster = [4250, 4600, 4920];
    const oscs = [];
    const gains = [];

    // Master tremolo LFO (14 Hz cricket wing flutter)
    const tremolo = ctx.createOscillator();
    tremolo.type = 'triangle';
    tremolo.frequency.setValueAtTime(14.5, ctx.currentTime);

    const tremoloGain = ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.03, ctx.currentTime);

    cricketCluster.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.025, ctx.currentTime);

      tremolo.connect(tremoloGain);
      tremoloGain.connect(g.gain);

      osc.connect(g);
      g.connect(destination);

      osc.start();
      oscs.push(osc);
      gains.push(g);
    });

    tremolo.start();

    return () => {
      try { breezeSource.stop(); } catch (_) {}
      try { tremolo.stop(); } catch (_) {}
      oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch (_) {} });
      gains.forEach(g => { try { g.disconnect(); } catch (_) {} });
      breezeSource.disconnect();
      breezeFilter.disconnect();
      tremolo.disconnect();
    };
  }

  // 5. Cozy Campfire Procedural Synthesis
  buildCampfireSound(ctx, destination) {
    // Warm fire rumble base
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.04 * white)) / 1.04;
      lastOut = data[i];
      data[i] *= 2.8;
    }

    const fireBase = ctx.createBufferSource();
    fireBase.buffer = buffer;
    fireBase.loop = true;

    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.setValueAtTime(380, ctx.currentTime);

    const fireGain = ctx.createGain();
    fireGain.gain.setValueAtTime(0.38, ctx.currentTime);

    fireBase.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(destination);

    fireBase.start();

    // Stochastic wood crackle and pop generator
    let crackleTimer = null;
    let isStopped = false;

    const scheduleCrackle = () => {
      if (isStopped) return;
      const delay = 40 + Math.random() * 160;
      crackleTimer = setTimeout(() => {
        if (isStopped) return;
        this.playCampfirePop(ctx, destination);
        scheduleCrackle();
      }, delay);
    };

    scheduleCrackle();

    return () => {
      isStopped = true;
      if (crackleTimer) clearTimeout(crackleTimer);
      try { fireBase.stop(); } catch (_) {}
      fireBase.disconnect();
      fireFilter.disconnect();
      fireGain.disconnect();
    };
  }

  playCampfirePop(ctx, destination) {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const isBigPop = Math.random() > 0.88;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = isBigPop ? 'triangle' : 'sine';
    const freq = isBigPop ? 450 + Math.random() * 300 : 1200 + Math.random() * 1600;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + (isBigPop ? 0.03 : 0.012));

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);

    const amp = isBigPop ? 0.09 : 0.035 + Math.random() * 0.02;
    gain.gain.setValueAtTime(amp, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isBigPop ? 0.035 : 0.015));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + (isBigPop ? 0.04 : 0.02));

    setTimeout(() => {
      try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch (_) {}
    }, 60);
  }

  // Sleep Timer Controller with gentle fade-out
  setSleepTimer(seconds, syncShell = true) {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }

    this.sleepTimerSeconds = seconds;
    this.sleepTimerRemaining = seconds;

    // Update sleep timer preset buttons UI
    document.querySelectorAll('.timer-preset-btn').forEach(btn => {
      const s = parseInt(btn.dataset.timer, 10);
      if (s === seconds) {
        btn.className = 'timer-preset-btn px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/20 text-white shadow-xs';
      } else {
        btn.className = 'timer-preset-btn px-2 py-1 rounded-lg text-[10px] font-semibold text-white/70 hover:text-white transition-all';
      }
    });

    const countdownEl = document.getElementById('soundscape-timer-countdown');

    if (seconds <= 0) {
      if (countdownEl) countdownEl.textContent = '';
      return;
    }

    // Sync shell target if applicable
    if (syncShell && this.sessionManager) {
      this.sessionManager.targetDurationSeconds = seconds;
      this.sessionManager.settings.durationSeconds = seconds;
      const shellTimeText = document.getElementById('game-shell-timer-text');
      if (shellTimeText) {
        const cur = this.sessionManager.getTrueElapsedSeconds();
        const mins = Math.floor(seconds / 60);
        const curMins = Math.floor(cur / 60);
        const curSecs = Math.floor(cur % 60);
        shellTimeText.textContent = `${String(curMins).padStart(2, '0')}:${String(curSecs).padStart(2, '0')} / ${String(mins).padStart(2, '0')}:00`;
      }
    }

    this.updateCountdownDisplay();

    this.sleepTimerInterval = setInterval(() => {
      if (!this.isPlaying) return;

      this.sleepTimerRemaining = Math.max(0, this.sleepTimerRemaining - 1);
      this.updateCountdownDisplay();

      // Trigger gentle 10-second fade out when near zero
      if (this.sleepTimerRemaining === 10 && this.audioCtx && this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0.0001, this.audioCtx.currentTime, 3.5);
      }

      if (this.sleepTimerRemaining <= 0) {
        clearInterval(this.sleepTimerInterval);
        this.sleepTimerInterval = null;
        this.pauseAudio();
        if (countdownEl) countdownEl.textContent = 'Ended';
      }
    }, 1000);
  }

  updateCountdownDisplay() {
    const countdownEl = document.getElementById('soundscape-timer-countdown');
    if (!countdownEl) return;
    if (this.sleepTimerRemaining <= 0) {
      countdownEl.textContent = '';
      return;
    }
    const mins = Math.floor(this.sleepTimerRemaining / 60);
    const secs = this.sleepTimerRemaining % 60;
    countdownEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
  }

  // UI State synchronizers
  updateControlsUi() {
    const playIcon = document.getElementById('soundscape-play-icon');
    const playLabel = document.getElementById('soundscape-play-label');
    const muteIcon = document.getElementById('soundscape-mute-icon');
    const liveDot = document.getElementById('soundscape-live-dot');
    const stateText = document.getElementById('soundscape-audio-state-text');

    if (playIcon) playIcon.textContent = this.isPlaying ? 'pause' : 'play_arrow';
    if (playLabel) playLabel.textContent = this.isPlaying ? 'Pause' : 'Play';
    if (muteIcon) muteIcon.textContent = this.isMuted ? 'volume_off' : 'volume_up';
    
    if (liveDot) {
      liveDot.className = this.isPlaying ? 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse' : 'w-2 h-2 rounded-full bg-slate-500';
    }
    if (stateText) {
      stateText.textContent = this.isPlaying ? 'Playing Live' : 'Paused';
    }
  }

  updateSceneHeaderUi(scene) {
    const titleEl = document.getElementById('soundscape-title');
    const descEl = document.getElementById('soundscape-description');
    const iconEl = document.getElementById('soundscape-badge-icon');

    if (titleEl) titleEl.textContent = scene.name;
    if (descEl) descEl.textContent = scene.description;
    if (iconEl) iconEl.textContent = scene.icon;

    // Highlight active scene button
    document.querySelectorAll('.soundscape-scene-btn').forEach(btn => {
      const isCurrent = btn.dataset.scene === scene.id;
      if (isCurrent) {
        btn.className = 'soundscape-scene-btn px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border border-transparent bg-primary text-white shadow-xs';
      } else {
        btn.className = 'soundscape-scene-btn px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 border border-transparent text-on-surface-variant hover:bg-surface-container';
      }
    });
  }

  // Real-time Canvas Audio Visualizer
  startVisualizerLoop() {
    let phase = 0;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderFrame = () => {
      if (!this.ctx || !this.canvas) return;

      const w = this.displayWidth;
      const h = this.displayHeight;
      const ctx = this.ctx;

      const activeScene = SCENES.find(s => s.id === this.activeSceneId) || SCENES[0];
      const theme = activeScene.theme;

      // Read audio data from AnalyserNode
      let energy = 0;
      let bassAvg = 0;
      if (this.analyser && this.isPlaying && !this.isMuted) {
        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getByteTimeDomainData(this.timeDomainArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
          if (i < 16) bassAvg += this.dataArray[i];
        }
        energy = sum / (this.dataArray.length * 255);
        bassAvg = bassAvg / (16 * 255);
      }

      // Smooth background clear with scene ambient tint
      ctx.fillStyle = theme.ambientBg;
      ctx.fillRect(0, 0, w, h);

      // Central Pulsing Orb
      const cx = w / 2;
      const cy = h / 2 - 20;
      const baseRadius = Math.min(w, h) * 0.16;
      const pulse = prefersReducedMotion ? 0 : (bassAvg * 45 + Math.sin(phase * 0.8) * 4);
      const orbRadius = Math.max(10, baseRadius + pulse);

      const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 1.6);
      orbGrad.addColorStop(0, theme.accent);
      orbGrad.addColorStop(0.35, theme.primary);
      orbGrad.addColorStop(0.7, theme.secondary);
      orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer delicate halo ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = theme.glow;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Mirrored Spectrum Frequency Bars (bottom floating)
      if (this.dataArray && this.isPlaying && !prefersReducedMotion) {
        const barCount = 28;
        const barWidth = Math.max(3, (w * 0.5) / barCount);
        const startX = cx;

        for (let i = 0; i < barCount; i++) {
          const val = (this.dataArray[i * 2] || 0) / 255;
          const barHeight = Math.max(4, val * 65);
          const y = h - 50 - barHeight;

          ctx.fillStyle = theme.primary;
          ctx.globalAlpha = 0.4 + val * 0.5;

          // Right side
          ctx.beginPath();
          ctx.roundRect(startX + (i * (barWidth + 3)), y, barWidth, barHeight, 3);
          ctx.fill();

          // Mirrored Left side
          ctx.beginPath();
          ctx.roundRect(startX - ((i + 1) * (barWidth + 3)), y, barWidth, barHeight, 3);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // Undulating Layered Audio-Reactive Waves
      const waveCount = 3;
      for (let waveIdx = 0; waveIdx < waveCount; waveIdx++) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h);

        const waveBaseY = h * 0.65 + (waveIdx * 35);
        const waveSpeed = prefersReducedMotion ? 0.005 : (0.015 + waveIdx * 0.008);
        const waveAmp = prefersReducedMotion ? 12 : (20 + (waveIdx * 12) + energy * 40);
        const freqScale = 0.006 + (waveIdx * 0.002);

        for (let x = 0; x <= w; x += 12) {
          const y = waveBaseY + Math.sin(x * freqScale + phase * (waveIdx + 1) * waveSpeed) * waveAmp;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, waveBaseY - waveAmp, 0, h);
        grad.addColorStop(0, theme.glow);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      phase += 1;
      this.animId = requestAnimationFrame(renderFrame);
    };

    this.animId = requestAnimationFrame(renderFrame);
  }

  // Complete cleanup and resource teardown
  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }

    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);

    // Stop and disconnect procedural sound nodes
    if (this.currentSoundNode) {
      try { this.currentSoundNode.stop(); } catch (_) {}
      this.currentSoundNode = null;
    }

    if (this.fadingSoundNode) {
      try { this.fadingSoundNode.stop(); } catch (_) {}
      this.fadingSoundNode = null;
    }

    // Close AudioContext completely to ensure no phantom sound plays
    if (this.audioCtx) {
      try {
        if (this.masterGain) this.masterGain.disconnect();
        if (this.analyser) this.analyser.disconnect();
        this.audioCtx.close();
      } catch (_) {}
      this.audioCtx = null;
    }

    this.isPlaying = false;
  }
}

// Standalone mount function per specification
export function mountCalmSoundscapes(container) {
  if (!container) throw new Error('Container element is required to mount Calm Soundscapes');

  const mockSessionManager = {
    status: 'in_progress',
    targetDurationSeconds: 1800,
    getTrueElapsedSeconds: () => 0,
    recordEvent: () => {},
    start: () => {},
    pause: () => {},
    resume: () => {},
    settings: { durationSeconds: 1800 }
  };

  container.innerHTML = renderCalmSoundscapes(mockSessionManager, {});
  const controller = new CalmSoundscapesController(mockSessionManager, {});
  controller.init();

  return {
    unmount: () => {
      controller.destroy();
      container.innerHTML = '';
    }
  };
}
