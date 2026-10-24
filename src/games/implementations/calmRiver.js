// CalmPop - Game 4: Calm River
// Tranquil paper boat journey along a winding, scenic river with gentle obstacles,
// changing scenery/lighting, adjustable sensitivity, touch/keyboard steering, and peaceful breathing rhythm.

import { audioSynth } from '../audioSynth.js';

export function renderCalmRiver(sessionManager, initialSettings = {}) {
  const sensitivity = initialSettings.sensitivity || 'normal';

  return `
    <div id="calm-river-app" class="w-full max-w-xl mx-auto flex flex-col items-center space-y-3 select-none">
      
      <!-- TOP SENSITIVITY & BREATHING CUE CONTROLS -->
      <div class="w-full flex flex-wrap items-center justify-between gap-2 px-2 text-xs">
        
        <!-- Steering Sensitivity Selector -->
        <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full border border-surface-container">
          <span class="text-outline text-[11px] font-semibold">Sensitivity:</span>
          <button 
            type="button" 
            onclick="window.calmRiverInstance?.setSensitivity('gentle')" 
            id="cr-s-gentle"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${sensitivity === 'gentle' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            Gentle
          </button>
          <button 
            type="button" 
            onclick="window.calmRiverInstance?.setSensitivity('normal')" 
            id="cr-s-normal"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${sensitivity === 'normal' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            Normal
          </button>
          <button 
            type="button" 
            onclick="window.calmRiverInstance?.setSensitivity('responsive')" 
            id="cr-s-responsive"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${sensitivity === 'responsive' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            Swift
          </button>
        </div>

        <!-- Visual Breathing Cue Toggle -->
        <button 
          type="button" 
          id="cr-breath-toggle"
          onclick="window.calmRiverInstance?.toggleBreathingCue()" 
          class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-primary hover:bg-surface-container-high transition-all"
        >
          <span class="material-symbols-outlined text-[16px]">air</span>
          <span id="cr-breath-label">Breathing Cue: On</span>
        </button>

      </div>

      <!-- MAIN RIVER CANVAS VIEWPORT -->
      <div class="relative w-full h-[400px] sm:h-[450px] rounded-3xl overflow-hidden border border-surface-container shadow-md bg-gradient-to-b from-sky-100 via-teal-50 to-emerald-100">
        
        <canvas id="calm-river-canvas" class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>

        <!-- Visual Breathing Rhythm Overlay Banner -->
        <div id="cr-breathing-cue-banner" class="absolute top-3 left-1/2 -translate-x-1/2 bg-surface-container-lowest/80 backdrop-blur-md px-4 py-1 rounded-full border border-surface-container shadow-xs pointer-events-none transition-opacity duration-700">
          <span id="cr-breathing-cue-text" class="text-xs font-bold text-primary tracking-wide">Breathe in gently...</span>
        </div>

        <!-- Mobile Touch Left/Right On-Screen Controls -->
        <div class="md:hidden absolute bottom-4 inset-x-4 flex justify-between pointer-events-none">
          <button 
            type="button" 
            id="cr-btn-left"
            class="pointer-events-auto w-14 h-14 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-container shadow-md flex items-center justify-center text-primary active:scale-95"
          >
            <span class="material-symbols-outlined text-[28px]">arrow_back</span>
          </button>
          <button 
            type="button" 
            id="cr-btn-right"
            class="pointer-events-auto w-14 h-14 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-container shadow-md flex items-center justify-center text-primary active:scale-95"
          >
            <span class="material-symbols-outlined text-[28px]">arrow_forward</span>
          </button>
        </div>

      </div>

      <!-- BOTTOM CONTROL HINT -->
      <div class="text-[11px] text-outline text-center flex items-center gap-2">
        <span class="material-symbols-outlined text-[14px] text-tertiary">keyboard</span>
        <span>Steer with Left/Right Arrow keys, A/D, or drag across the water. Obstacles gently glide past with no penalty.</span>
      </div>

    </div>
  `;
}

export class CalmRiverController {
  constructor(sessionManager, initialSettings = {}) {
    this.sessionManager = sessionManager;
    this.sensitivitySetting = initialSettings.sensitivity || 'normal';
    this.sensitivityMultiplier = 1.0;
    this.showBreathingCue = true;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    
    // Boat state
    this.boat = {
      x: 0.5, // 0 to 1
      y: 0.78,
      vx: 0,
      width: 38,
      height: 48,
      angle: 0
    };

    // Scenery & obstacles
    this.obstacles = [];
    this.ripples = [];
    this.foliage = [];
    this.distanceTraveled = 0;
    this.keys = { left: false, right: false };

    // Breathing cue timer
    this.breathCycle = 0;
    this.lastTime = performance.now();
  }

  init() {
    window.calmRiverInstance = this;
    this.canvas = document.getElementById('calm-river-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.setSensitivity(this.sensitivitySetting);
    this.resizeCanvas();

    // Generate initial gentle obstacles (lily pads, lotus blossoms, smooth river pebbles)
    for (let i = 0; i < 7; i++) {
      this.obstacles.push(this.createObstacle(Math.random() * -600));
    }

    // Attach listeners
    this.attachInputs();
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  setSensitivity(s) {
    this.sensitivitySetting = s;
    if (s === 'gentle') this.sensitivityMultiplier = 0.6;
    else if (s === 'normal') this.sensitivityMultiplier = 1.0;
    else if (s === 'responsive') this.sensitivityMultiplier = 1.6;

    this.sessionManager.recordEvent('sensitivity', s);

    ['gentle', 'normal', 'responsive'].forEach(k => {
      const btn = document.getElementById(`cr-s-${k}`);
      if (btn) {
        btn.className = k === s
          ? 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs'
          : 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
      }
    });
  }

  toggleBreathingCue() {
    this.showBreathingCue = !this.showBreathingCue;
    const banner = document.getElementById('cr-breathing-cue-banner');
    const label = document.getElementById('cr-breath-label');
    if (banner) banner.style.opacity = this.showBreathingCue ? '1' : '0';
    if (label) label.textContent = `Breathing Cue: ${this.showBreathingCue ? 'On' : 'Off'}`;
  }

  createObstacle(y) {
    const types = ['lily', 'lotus', 'pebble', 'leaf'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      x: 0.15 + Math.random() * 0.7,
      y: y,
      type,
      size: 20 + Math.random() * 15,
      rotation: Math.random() * Math.PI * 2
    };
  }

  attachInputs() {
    this.keydownHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    };
    this.keyupHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);

    // Pointer / Mouse / Touch drag on canvas
    let isDragging = false;
    this.canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      this.handlePointerMove(e);
    });
    window.addEventListener('pointerup', () => { isDragging = false; });
    this.canvas.addEventListener('pointermove', (e) => {
      if (isDragging) this.handlePointerMove(e);
    });

    // Mobile buttons
    const bLeft = document.getElementById('cr-btn-left');
    const bRight = document.getElementById('cr-btn-right');
    if (bLeft) {
      bLeft.addEventListener('pointerdown', () => { this.keys.left = true; });
      bLeft.addEventListener('pointerup', () => { this.keys.left = false; });
    }
    if (bRight) {
      bRight.addEventListener('pointerdown', () => { this.keys.right = true; });
      bRight.addEventListener('pointerup', () => { this.keys.right = false; });
    }
  }

  handlePointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const targetX = (e.clientX - rect.left) / rect.width;
    const diff = targetX - this.boat.x;
    this.boat.x += diff * 0.15 * this.sensitivityMultiplier;
    this.boat.x = Math.max(0.12, Math.min(0.88, this.boat.x));
  }

  loop(timestamp) {
    if (this.sessionManager.status !== 'paused') {
      const dt = (timestamp - this.lastTime) / 1000;
      this.update(dt || 0.016);
      this.draw();
    }
    this.lastTime = timestamp;
    this.animId = requestAnimationFrame(this.loop);
  }

  update(dt) {
    // Steer boat
    const speed = 0.55 * this.sensitivityMultiplier;
    if (this.keys.left) {
      this.boat.vx -= speed * dt;
      this.boat.angle = -0.15;
    } else if (this.keys.right) {
      this.boat.vx += speed * dt;
      this.boat.angle = 0.15;
    } else {
      this.boat.vx *= 0.88;
      this.boat.angle *= 0.85;
    }

    this.boat.x += this.boat.vx * dt;
    this.boat.x = Math.max(0.12, Math.min(0.88, this.boat.x));

    // Scroll obstacles
    const riverFlowSpeed = 70; // px per sec
    const rect = this.canvas.getBoundingClientRect();
    const height = rect.height || 450;
    const width = rect.width || 500;

    for (let obs of this.obstacles) {
      obs.y += riverFlowSpeed * dt;

      // Check soft collision / proximity: spawns water ripple, no punishment
      const obsScreenX = obs.x * width;
      const boatScreenX = this.boat.x * width;
      const boatScreenY = this.boat.y * height;
      const dist = Math.hypot(obsScreenX - boatScreenX, obs.y - boatScreenY);

      if (dist < obs.size + 15 && !obs.hasRippled) {
        obs.hasRippled = true;
        this.ripples.push({ x: obsScreenX, y: obs.y, r: 5, alpha: 0.7 });
        audioSynth.playWaterRipple();
        // Gentle nudge
        this.boat.x += (boatScreenX > obsScreenX ? 0.02 : -0.02);
      }

      // Recycle obstacle to top
      if (obs.y > height + 50) {
        obs.y = -60;
        obs.x = 0.15 + Math.random() * 0.7;
        obs.hasRippled = false;
      }
    }

    // Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.r += 24 * dt;
      rip.alpha -= 0.6 * dt;
      if (rip.alpha <= 0) this.ripples.splice(i, 1);
    }

    // Add gentle wake ripple behind boat occasionally
    if (Math.random() < 0.1) {
      this.ripples.push({
        x: this.boat.x * width,
        y: this.boat.y * height + 18,
        r: 3,
        alpha: 0.5
      });
    }

    // Breathing cue rhythm (4s in, 6s out = 10s cycle)
    this.breathCycle += dt;
    const cycleTime = this.breathCycle % 10;
    const textEl = document.getElementById('cr-breathing-cue-text');
    if (textEl && this.showBreathingCue) {
      if (cycleTime < 4) {
        textEl.textContent = 'Breathe in gently...';
        textEl.className = 'text-xs font-bold text-primary tracking-wide';
      } else {
        textEl.textContent = 'Breathe out slowly...';
        textEl.className = 'text-xs font-bold text-secondary tracking-wide';
      }
    }
  }

  draw() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!this.ctx || w === 0) return;

    // Time of day gradient based on session elapsed progress
    const progress = Math.min(1, this.sessionManager.getTrueElapsedSeconds() / Math.max(1, this.sessionManager.targetDurationSeconds));
    
    // Smooth river water gradient
    const waterGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    if (progress < 0.4) {
      // Morning fresh cyan
      waterGrad.addColorStop(0, '#d1f4ff');
      waterGrad.addColorStop(0.5, '#a3e8ff');
      waterGrad.addColorStop(1, '#6ad5fc');
    } else if (progress < 0.75) {
      // Warm afternoon golden glow
      waterGrad.addColorStop(0, '#fef3c7');
      waterGrad.addColorStop(0.5, '#7dd3fc');
      waterGrad.addColorStop(1, '#0284c7');
    } else {
      // Twilight serene dusk
      waterGrad.addColorStop(0, '#ddd6fe');
      waterGrad.addColorStop(0.5, '#38bdf8');
      waterGrad.addColorStop(1, '#0f172a');
    }
    this.ctx.fillStyle = waterGrad;
    this.ctx.fillRect(0, 0, w, h);

    // River banks (curved gentle green banks)
    this.ctx.fillStyle = '#647e00';
    this.ctx.beginPath();
    this.ctx.ellipse(0, h / 2, 40, h / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(w, h / 2, 40, h / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw ripples
    for (const rip of this.ripples) {
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.ellipse(rip.x, rip.y, rip.r * 1.5, rip.r * 0.7, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw obstacles (lily pads, lotus blossoms, leaves)
    for (const obs of this.obstacles) {
      const ox = obs.x * w;
      const oy = obs.y;

      this.ctx.save();
      this.ctx.translate(ox, oy);
      this.ctx.rotate(obs.rotation);

      if (obs.type === 'lily') {
        // Green round lily pad with a notch
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obs.size, 0.3, Math.PI * 2 - 0.3);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#059669';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      } else if (obs.type === 'lotus') {
        // Pink/white lotus petal flower on water
        this.ctx.fillStyle = '#f472b6';
        for (let i = 0; i < 6; i++) {
          this.ctx.beginPath();
          this.ctx.ellipse(0, -obs.size * 0.5, obs.size * 0.35, obs.size * 0.6, (i * Math.PI) / 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.fillStyle = '#fef08a';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obs.size * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (obs.type === 'leaf') {
        // Floating autumn leaf
        this.ctx.fillStyle = '#f97316';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, obs.size * 0.7, obs.size * 0.35, 0, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Smooth river pebble
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, obs.size * 0.6, obs.size * 0.45, 0.4, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // Draw the Paper Boat
    const bx = this.boat.x * w;
    const by = this.boat.y * h;

    this.ctx.save();
    this.ctx.translate(bx, by);
    this.ctx.rotate(this.boat.angle);

    // Boat shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 10, 24, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Origami Paper Boat Hull (White & Primary Crisp Folds)
    // Left hull fold
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 16);
    this.ctx.lineTo(-24, 4);
    this.ctx.lineTo(0, 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Right hull fold
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 16);
    this.ctx.lineTo(24, 4);
    this.ctx.lineTo(0, 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.stroke();

    // Center Sail (Triangular origami sail)
    this.ctx.fillStyle = '#006191';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -22);
    this.ctx.lineTo(-14, 2);
    this.ctx.lineTo(0, 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#18B9ED';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -22);
    this.ctx.lineTo(14, 2);
    this.ctx.lineTo(0, 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
  }
}
