// CalmPop - Calm Keys Interactive Auditory Experience
// Diatonic C Major (including F and B) & Pentatonic Chimes with serene
// overtone shimmer, gentle sequence exploration, and visual ripple feedback.

import { audioSynth } from '../audioSynth.js';

const DIATONIC_KEYS = [
  { id: 'C4', note: 'C4', name: 'Do', freq: 261.63, keyBinding: 'A', pentatonic: true, color: 'from-sky-400 to-blue-500' },
  { id: 'D4', note: 'D4', name: 'Re', freq: 293.66, keyBinding: 'S', pentatonic: true, color: 'from-cyan-400 to-sky-500' },
  { id: 'E4', note: 'E4', name: 'Mi', freq: 329.63, keyBinding: 'D', pentatonic: true, color: 'from-teal-400 to-emerald-500' },
  { id: 'F4', note: 'F4', name: 'Fa', freq: 349.23, keyBinding: 'F', pentatonic: false, color: 'from-emerald-400 to-green-500' },
  { id: 'G4', note: 'G4', name: 'Sol', freq: 392.00, keyBinding: 'G', pentatonic: true, color: 'from-amber-400 to-yellow-500' },
  { id: 'A4', note: 'A4', name: 'La', freq: 440.00, keyBinding: 'H', pentatonic: true, color: 'from-orange-400 to-amber-500' },
  { id: 'B4', note: 'B4', name: 'Ti', freq: 493.88, keyBinding: 'J', pentatonic: false, color: 'from-rose-400 to-pink-500' },
  { id: 'C5', note: 'C5', name: 'Do', freq: 523.25, keyBinding: 'K', pentatonic: true, color: 'from-sky-500 to-primary' },
  { id: 'D5', note: 'D5', name: 'Re', freq: 587.33, keyBinding: 'L', pentatonic: true, color: 'from-cyan-500 to-sky-600' },
  { id: 'E5', note: 'E5', name: 'Mi', freq: 659.25, keyBinding: ';', pentatonic: true, color: 'from-teal-500 to-emerald-600' }
];

const GENTLE_SEQUENCES = [
  { id: 'dawn', title: 'Dawn Awakening', notes: ['C4', 'E4', 'G4', 'C5'], desc: 'Gentle morning ascent' },
  { id: 'river', title: 'Serene River', notes: ['E4', 'G4', 'A4', 'G4', 'E4'], desc: 'Flowing natural cadence' },
  { id: 'twilight', title: 'Twilight Glow', notes: ['A4', 'G4', 'E4', 'D4', 'C4'], desc: 'Soothing descending release' },
  { id: 'shimmer', title: 'Harmonic Meadow', notes: ['C4', 'F4', 'A4', 'C5', 'E5'], desc: 'Lush peaceful warmth' }
];

export function renderCalmKeys(sessionManager, options = {}) {
  return `
    <div id="calm-keys-root" class="relative w-full flex flex-col items-center justify-between min-h-[560px] p-2 sm:p-4 select-none">
      
      <!-- Top Instrument Controls Toolbar -->
      <div class="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-surface-container mb-3 text-xs">
        
        <!-- Left: Scale Mode Filter -->
        <div class="flex items-center gap-2">
          <span class="text-outline font-semibold uppercase tracking-wider text-[10px]">Scale:</span>
          
          <button 
            type="button" 
            id="btn-scale-all" 
            class="scale-mode-btn px-3 py-1.5 rounded-xl font-bold transition-all bg-primary text-on-primary shadow-xs"
            data-scale="diatonic"
          >
            Diatonic C Major (with F & B)
          </button>

          <button 
            type="button" 
            id="btn-scale-pentatonic" 
            class="scale-mode-btn px-3 py-1.5 rounded-xl font-medium transition-all text-on-surface-variant hover:bg-surface-container"
            data-scale="pentatonic"
          >
            Pentatonic Chimes
          </button>
        </div>

        <!-- Right: Volume Slider & Sound Toggle -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-surface-container">
            <span class="material-symbols-outlined text-[16px] text-outline">volume_up</span>
            <input 
              type="range" 
              id="keys-volume-slider" 
              min="0.01" 
              max="0.15" 
              step="0.01" 
              value="0.08" 
              class="w-16 sm:w-20 accent-primary cursor-pointer"
              title="Adjust Chime Volume"
            />
          </div>

          <!-- Sequences Mode Toggle -->
          <button 
            type="button" 
            id="btn-toggle-sequences" 
            class="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-all flex items-center gap-1.5"
            title="Explore Guided Melodies"
          >
            <span class="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
            <span>Gentle Sequences</span>
          </button>
        </div>

      </div>

      <!-- Optional Gentle Sequences Drawer / Selector -->
      <div id="keys-sequences-drawer" class="hidden w-full max-w-4xl bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container shadow-xs mb-3 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 font-bold text-on-surface">
            <span class="material-symbols-outlined text-primary text-[18px]">music_note</span>
            <span>Gentle Melodic Phrases (No Pressure, No Scores)</span>
          </div>
          <span class="text-outline text-[11px]">Click to listen or play along with glowing keys</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          ${GENTLE_SEQUENCES.map(seq => `
            <button 
              type="button"
              onclick="window.activeKeysController?.playSequence('${seq.id}')"
              class="seq-card p-2.5 rounded-xl bg-surface-container-low hover:bg-primary/10 border border-surface-container text-left transition-all group"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">${seq.title}</span>
                <span class="material-symbols-outlined text-[16px] text-outline group-hover:text-primary">play_arrow</span>
              </div>
              <p class="text-[10px] text-outline mt-0.5">${seq.desc}</p>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Main Visual Instrument Stage -->
      <div class="relative w-full max-w-4xl flex-1 min-h-[400px] rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-surface-container-lowest via-surface-container-low/40 to-surface-container-lowest shadow-xl border border-surface-container flex flex-col justify-between overflow-hidden">
        
        <!-- Ripple Rings & Particle Canvas -->
        <canvas id="keys-visual-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-0"></canvas>

        <!-- Current Harmonic Note Info Display -->
        <div class="relative z-10 text-center py-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-surface-container text-xs shadow-xs">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span id="keys-current-note-name" class="font-bold text-on-surface">Pure Bell Harmonics</span>
            <span id="keys-current-note-freq" class="text-outline font-mono text-[11px]">Diatonic C Major</span>
          </div>
        </div>

        <!-- Chime Bars Stage (The 10 Diatonic / Pentatonic Keys) -->
        <div class="relative z-10 w-full flex items-end justify-center gap-2 sm:gap-3 py-6 px-1 overflow-x-auto no-scrollbar">
          ${DIATONIC_KEYS.map((k, idx) => {
            // Natural graduated height for chime bars (higher pitch = shorter bar)
            const heightPx = 280 - idx * 14;
            return `
              <div 
                id="key-bar-${k.id}"
                data-key-id="${k.id}"
                data-freq="${k.freq}"
                data-pentatonic="${k.pentatonic}"
                class="key-chime-bar flex-1 max-w-[72px] min-w-[32px] sm:min-w-[48px] rounded-2xl flex flex-col justify-between items-center p-2 sm:p-2.5 cursor-pointer shadow-md hover:shadow-lg transition-all duration-150 transform hover:-translate-y-1 active:translate-y-1 bg-gradient-to-b from-white via-slate-50 to-slate-200 border border-slate-300/80 group"
                style="height: ${heightPx}px;"
                tabindex="0"
                role="button"
                aria-label="Play ${k.note} (${k.name})"
              >
                <!-- Top Accent Jewel / Indicator -->
                <div class="w-3 h-3 rounded-full bg-gradient-to-tr ${k.color} shadow-xs group-hover:scale-125 transition-transform"></div>

                <!-- Center Note & Solfege -->
                <div class="text-center py-2">
                  <span class="font-headline-sm text-sm sm:text-base font-extrabold text-slate-700 group-hover:text-primary transition-colors block">
                    ${k.note}
                  </span>
                  <span class="text-[10px] text-slate-500 font-medium block">
                    ${k.name}
                  </span>
                </div>

                <!-- Bottom Keyboard Shortcut Pill -->
                <div class="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-2xs">
                  ${k.keyBinding}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Bottom Keyboard Guidance -->
        <div class="relative z-10 text-center text-outline text-[11px] flex items-center justify-center gap-3">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">touch_app</span>
            <span>Click, tap, or press keys <span class="font-mono font-bold">A–L</span></span>
          </span>
          <span>•</span>
          <span>Pure bell overtones with exponential decay</span>
        </div>

      </div>

    </div>
  `;
}

export class CalmKeysController {
  constructor(sessionManager, options = {}) {
    this.sessionManager = sessionManager;
    this.options = options;
    
    this.scaleMode = 'diatonic'; // 'diatonic' | 'pentatonic'
    this.volume = 0.08;
    this.particles = [];
    this.animId = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.canvas = document.getElementById('keys-visual-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.setupCanvasSize();
      this.startParticleLoop();
    }

    this.attachListeners();
    window.activeKeysController = this;
  }

  setupCanvasSize() {
    if (!this.canvas) return;
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

  attachListeners() {
    // Key click & touch
    document.querySelectorAll('.key-chime-bar').forEach(bar => {
      const playAction = (e) => {
        e.preventDefault();
        const id = bar.dataset.keyId;
        const keyObj = DIATONIC_KEYS.find(k => k.id === id);
        if (keyObj) this.playKey(keyObj, bar);
      };

      bar.addEventListener('pointerdown', playAction);
      bar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          playAction(e);
        }
      });
    });

    // Keyboard bindings (A-L, ;)
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);

    // Volume slider
    const volSlider = document.getElementById('keys-volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        this.volume = parseFloat(e.target.value) || 0.08;
      });
    }

    // Scale mode buttons
    const allBtn = document.getElementById('btn-scale-all');
    const pentBtn = document.getElementById('btn-scale-pentatonic');
    if (allBtn && pentBtn) {
      allBtn.addEventListener('click', () => {
        this.scaleMode = 'diatonic';
        allBtn.className = 'scale-mode-btn px-3 py-1.5 rounded-xl font-bold transition-all bg-primary text-on-primary shadow-xs';
        pentBtn.className = 'scale-mode-btn px-3 py-1.5 rounded-xl font-medium transition-all text-on-surface-variant hover:bg-surface-container';
        this.updateKeyDimming();
      });

      pentBtn.addEventListener('click', () => {
        this.scaleMode = 'pentatonic';
        pentBtn.className = 'scale-mode-btn px-3 py-1.5 rounded-xl font-bold transition-all bg-primary text-on-primary shadow-xs';
        allBtn.className = 'scale-mode-btn px-3 py-1.5 rounded-xl font-medium transition-all text-on-surface-variant hover:bg-surface-container';
        this.updateKeyDimming();
      });
    }

    // Toggle Sequences drawer
    const seqToggle = document.getElementById('btn-toggle-sequences');
    const seqDrawer = document.getElementById('keys-sequences-drawer');
    if (seqToggle && seqDrawer) {
      seqToggle.addEventListener('click', () => {
        seqDrawer.classList.toggle('hidden');
      });
    }
  }

  updateKeyDimming() {
    document.querySelectorAll('.key-chime-bar').forEach(bar => {
      const isPent = bar.dataset.pentatonic === 'true';
      if (this.scaleMode === 'pentatonic' && !isPent) {
        bar.style.opacity = '0.35';
        bar.style.filter = 'grayscale(0.7)';
      } else {
        bar.style.opacity = '1';
        bar.style.filter = 'none';
      }
    });
  }

  handleKeyDown(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const pressed = e.key.toUpperCase();
    const keyObj = DIATONIC_KEYS.find(k => k.keyBinding.toUpperCase() === pressed);
    if (keyObj) {
      const bar = document.getElementById(`key-bar-${keyObj.id}`);
      this.playKey(keyObj, bar);
    }
  }

  playKey(keyObj, barElement) {
    // 1. Play pure acoustic bell synthesis
    audioSynth.playCalmBell(keyObj.freq, 2.6, true, this.volume);

    // 2. Visual feedback on bar
    if (barElement) {
      barElement.classList.add('ring-4', 'ring-primary/40', 'bg-primary/10', '-translate-y-2');
      setTimeout(() => {
        barElement.classList.remove('ring-4', 'ring-primary/40', 'bg-primary/10', '-translate-y-2');
      }, 240);

      // Spawn ripples and harmonic particles from the top of the bar
      const rect = barElement.getBoundingClientRect();
      const canvasRect = this.canvas?.getBoundingClientRect();
      if (canvasRect) {
        const x = rect.left - canvasRect.left + rect.width / 2;
        const y = rect.top - canvasRect.top + 20;
        this.spawnHarmonicRipple(x, y);
      }
    }

    // 3. Update info display
    const nameEl = document.getElementById('keys-current-note-name');
    const freqEl = document.getElementById('keys-current-note-freq');
    if (nameEl) nameEl.textContent = `${keyObj.note} (${keyObj.name})`;
    if (freqEl) freqEl.textContent = `${keyObj.freq.toFixed(1)} Hz • Diatonic Overtone`;

    this.sessionManager?.recordEvent('key_played');
  }

  spawnHarmonicRipple(x, y) {
    // Expanding harmonic ring
    this.particles.push({
      type: 'ring',
      x,
      y,
      radius: 8,
      maxRadius: 75,
      alpha: 0.8,
      color: 'rgba(24, 185, 237,'
    });

    // Ascending sparkle orbs
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        type: 'sparkle',
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.2 - Math.random() * 2,
        size: 3 + Math.random() * 3,
        alpha: 0.9,
        color: Math.random() > 0.5 ? 'rgba(24, 185, 237,' : 'rgba(201, 242, 70,'
      });
    }
  }

  startParticleLoop() {
    const loop = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        if (p.type === 'ring') {
          p.radius += 1.8;
          p.alpha -= 0.02;
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = `${p.color} ${Math.max(0, p.alpha)})`;
          this.ctx.lineWidth = 2.5;
          this.ctx.stroke();
          this.ctx.restore();
        } else if (p.type === 'sparkle') {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.016;
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = `${p.color} ${Math.max(0, p.alpha)})`;
          this.ctx.shadowColor = 'rgba(24, 185, 237, 0.5)';
          this.ctx.shadowBlur = 8;
          this.ctx.fill();
          this.ctx.restore();
        }

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  playSequence(seqId) {
    const seq = GENTLE_SEQUENCES.find(s => s.id === seqId);
    if (!seq) return;

    seq.notes.forEach((noteName, idx) => {
      setTimeout(() => {
        const keyObj = DIATONIC_KEYS.find(k => k.id === noteName);
        if (keyObj) {
          const bar = document.getElementById(`key-bar-${keyObj.id}`);
          this.playKey(keyObj, bar);
        }
      }, idx * 550);
    });
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
    window.activeKeysController = null;
  }
}
