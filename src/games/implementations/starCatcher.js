// CalmPop - Star Catcher Interactive Focus Game
// Soft drifting celestial stars with stardust bursts, crystalline chime sparkles,
// light ethereal visuals matching CalmPop branding, and zero stressful penalties.

import { audioSynth } from '../audioSynth.js';

export function renderStarCatcher(sessionManager, options = {}) {
  return `
    <div id="star-catcher-root" class="relative w-full flex flex-col items-center justify-between min-h-[560px] p-2 sm:p-4 select-none">
      
      <!-- Top Focus Toolbar -->
      <div class="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-surface-container mb-3 text-xs">
        
        <!-- Left: Mindful Non-competitive Counter -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-surface-container shadow-xs">
            <span class="material-symbols-outlined text-primary text-[18px]">stars</span>
            <span class="text-outline text-[11px]">Stars Guided:</span>
            <span id="star-catcher-count" class="font-bold text-sm font-mono text-primary">0</span>
          </div>

          <!-- Star Field Density -->
          <div class="hidden sm:flex items-center gap-1 text-[11px]">
            <span class="text-outline text-[10px]">Flow:</span>
            <button type="button" class="star-density-btn px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-semibold" data-density="40">Calm</button>
            <button type="button" class="star-density-btn px-2.5 py-1 rounded-lg text-outline hover:text-on-surface" data-density="70">Abundant</button>
          </div>
        </div>

        <!-- Right: Pause & Release All Actions -->
        <div class="flex items-center gap-2">
          
          <!-- Pause / Float Toggle -->
          <button 
            type="button" 
            id="btn-star-pause" 
            class="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-all flex items-center gap-1.5"
            title="Pause Star Motion"
          >
            <span id="star-pause-icon" class="material-symbols-outlined text-[16px]">pause</span>
            <span id="star-pause-text">Pause Drift</span>
          </button>

          <!-- Stardust Cascade (Sparkle all active stars gently) -->
          <button 
            type="button" 
            id="btn-star-cascade" 
            class="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-all flex items-center gap-1.5 border border-primary/20"
            title="Release soft celestial sparkle across the garden"
          >
            <span class="material-symbols-outlined text-[16px]">sparkles</span>
            <span>Stardust Cascade</span>
          </button>
        </div>

      </div>

      <!-- Main Celestial Canvas Stage -->
      <div class="relative w-full max-w-4xl flex-1 min-h-[460px] rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-[#EBF5FB] via-[#E0F2FE] to-[#D5EBF9] shadow-xl border border-sky-200/80 flex items-center justify-center overflow-hidden">
        
        <!-- Ambient Glowing Nebulae -->
        <div class="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-blue-300/25 blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-lime-300/15 blur-3xl pointer-events-none"></div>

        <!-- Interactive Stars Canvas -->
        <canvas 
          id="star-catcher-canvas" 
          class="relative z-10 w-full h-full block rounded-2xl cursor-pointer touch-none"
          style="touch-action: none;"
        ></canvas>

        <!-- Tap Guidance Hint -->
        <div id="star-catcher-hint" class="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-white/70 backdrop-blur-md text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-md transition-opacity duration-700 flex items-center gap-2 border border-white/60 z-20">
          <span class="material-symbols-outlined text-[16px] text-primary animate-bounce">touch_app</span>
          <span>Click or tap drifting stars to release delicate stardust bursts</span>
        </div>

      </div>

      <!-- Bottom Guidance Note -->
      <div class="mt-3 text-center text-outline text-[11px] flex items-center gap-2">
        <span class="material-symbols-outlined text-[14px] text-cyan-600">auto_awesome</span>
        <span>A serene, open playground without timers, penalties, or competitive pressure.</span>
      </div>

    </div>
  `;
}

export class StarCatcherController {
  constructor(sessionManager, options = {}) {
    this.sessionManager = sessionManager;
    this.options = options;
    
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.particles = [];
    this.starsCaught = 0;
    this.targetStarCount = 45;
    this.isPaused = false;
    this.hasInteracted = false;
    this.animId = null;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.canvas = document.getElementById('star-catcher-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.setupCanvasSize();
    this.initStars();
    this.startLoop();

    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('resize', this.handleResize);

    this.attachUiListeners();
  }

  setupCanvasSize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(300, Math.floor(rect.width || 800));
    const height = Math.max(200, Math.floor(rect.height || 460));

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  handleResize() {
    this.setupCanvasSize();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < this.targetStarCount; i++) {
      this.stars.push(this.createStar(Math.random() * this.displayWidth, Math.random() * this.displayHeight));
    }
  }

  createStar(x, y) {
    const starColors = [
      { core: '#FFFFFF', glow: 'rgba(24, 185, 237, 0.45)', outer: 'rgba(24, 185, 237, 0.15)' }, // Cyan Glow
      { core: '#FFFFFF', glow: 'rgba(0, 97, 145, 0.35)', outer: 'rgba(0, 97, 145, 0.10)' },   // Primary Blue
      { core: '#FFFDF0', glow: 'rgba(201, 242, 70, 0.45)', outer: 'rgba(201, 242, 70, 0.12)' }, // Lime Sparkle
      { core: '#FFFFFF', glow: 'rgba(224, 242, 254, 0.60)', outer: 'rgba(224, 242, 254, 0.20)' } // Pure Starlight
    ];
    const color = starColors[Math.floor(Math.random() * starColors.length)];

    return {
      x,
      y,
      baseRadius: 3.5 + Math.random() * 4.5,
      radius: 4,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -0.2 - Math.random() * 0.45, // Gentle upward drift
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.03 + Math.random() * 0.03,
      points: Math.random() > 0.4 ? 4 : 5, // 4-point or 5-point star
      color,
      twinkle: Math.random()
    };
  }

  attachUiListeners() {
    // Density Selector
    document.querySelectorAll('.star-density-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.star-density-btn').forEach(b => {
          b.className = 'star-density-btn px-2.5 py-1 rounded-lg text-outline hover:text-on-surface';
        });
        e.currentTarget.className = 'star-density-btn px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-semibold';
        this.targetStarCount = parseInt(e.currentTarget.dataset.density, 10) || 45;
        this.adjustStarCount();
      });
    });

    // Pause button
    const pauseBtn = document.getElementById('btn-star-pause');
    const pauseIcon = document.getElementById('star-pause-icon');
    const pauseText = document.getElementById('star-pause-text');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        if (pauseIcon) pauseIcon.textContent = this.isPaused ? 'play_arrow' : 'pause';
        if (pauseText) pauseText.textContent = this.isPaused ? 'Resume Drift' : 'Pause Drift';
      });
    }

    // Stardust Cascade button
    const cascadeBtn = document.getElementById('btn-star-cascade');
    if (cascadeBtn) {
      cascadeBtn.addEventListener('click', () => {
        this.triggerCascade();
      });
    }
  }

  adjustStarCount() {
    while (this.stars.length < this.targetStarCount) {
      this.stars.push(this.createStar(Math.random() * this.displayWidth, this.displayHeight + 20));
    }
    if (this.stars.length > this.targetStarCount) {
      this.stars.splice(this.targetStarCount);
    }
  }

  handlePointerDown(e) {
    this.hideHint();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check hit star with generous touch target radius (min 28px)
    let hitIndex = -1;
    let closestDist = Infinity;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const dist = Math.hypot(s.x - x, s.y - y);
      if (dist < 32 && dist < closestDist) {
        closestDist = dist;
        hitIndex = i;
      }
    }

    if (hitIndex !== -1) {
      const star = this.stars[hitIndex];
      this.burstStar(star, hitIndex);
    } else {
      // Gentle ripple if tapping empty space
      this.spawnSoftRipple(x, y);
      audioSynth.playGentleTone(784, 0.4, 'sine', 0.02);
    }
  }

  burstStar(star, index) {
    // 1. Remove and respawn star
    this.stars.splice(index, 1);
    this.stars.push(this.createStar(Math.random() * this.displayWidth, this.displayHeight + 25));

    // 2. Play celestial chime sparkle
    const freq = 660 + Math.random() * 880;
    audioSynth.playStarSparkle(freq);

    // 3. Increment counter
    this.starsCaught++;
    const countEl = document.getElementById('star-catcher-count');
    if (countEl) countEl.textContent = this.starsCaught;

    // 4. Spawn 32-40 stardust particles
    const particleCount = 35;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.2;
      this.particles.push({
        x: star.x,
        y: star.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 1.5 + Math.random() * 3.5,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        color: Math.random() > 0.4 ? 'rgba(24, 185, 237,' : 'rgba(201, 242, 70,'
      });
    }

    // Expanding glow shockwave
    this.particles.push({
      type: 'shockwave',
      x: star.x,
      y: star.y,
      radius: star.radius * 2,
      maxRadius: 60,
      alpha: 0.8,
      color: 'rgba(255, 255, 255,'
    });

    this.sessionManager?.recordEvent('star_caught');
  }

  spawnSoftRipple(x, y) {
    this.particles.push({
      type: 'shockwave',
      x,
      y,
      radius: 4,
      maxRadius: 40,
      alpha: 0.5,
      color: 'rgba(24, 185, 237,'
    });
  }

  triggerCascade() {
    // Sparkle 6 random stars simultaneously
    const count = Math.min(6, this.stars.length);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (this.stars.length > 0) {
          const randIdx = Math.floor(Math.random() * this.stars.length);
          const s = this.stars[randIdx];
          this.burstStar(s, randIdx);
        }
      }, i * 160);
    }
  }

  hideHint() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      const hint = document.getElementById('star-catcher-hint');
      if (hint) {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 700);
      }
    }
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  update() {
    if (!this.isPaused) {
      // Update star positions
      this.stars.forEach(s => {
        s.pulsePhase += s.pulseSpeed;
        s.radius = s.baseRadius + Math.sin(s.pulsePhase) * 1.5;

        // Subtle organic sine floating
        s.x += s.vx + Math.sin(s.pulsePhase * 0.5) * 0.25;
        s.y += s.vy;

        // Wrap around smoothly
        if (s.y < -30) {
          s.y = this.displayHeight + 20;
          s.x = Math.random() * this.displayWidth;
        }
        if (s.x < -30) s.x = this.displayWidth + 20;
        if (s.x > this.displayWidth + 30) s.x = -20;
      });
    }

    // Update stardust particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.type === 'shockwave') {
        p.radius += 2.2;
        p.alpha -= 0.025;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // subtle gravity
        p.alpha -= p.decay;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);

    // 1. Draw subtle constellation lines between nearby stars
    ctx.save();
    ctx.strokeStyle = 'rgba(24, 185, 237, 0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < this.stars.length; i++) {
      for (let j = i + 1; j < this.stars.length; j++) {
        const dx = this.stars[i].x - this.stars[j].x;
        const dy = this.stars[i].y - this.stars[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(this.stars[i].x, this.stars[i].y);
          ctx.lineTo(this.stars[j].x, this.stars[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // 2. Draw Stars
    this.stars.forEach(s => {
      ctx.save();
      
      // Outer soft glow aura
      const aura = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, s.radius * 3.5);
      aura.addColorStop(0, s.color.glow);
      aura.addColorStop(1, s.color.outer);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Sharp central 4/5-point star diamond
      ctx.fillStyle = s.color.core;
      ctx.beginPath();
      const points = s.points;
      const step = Math.PI / points;
      const outerR = s.radius;
      const innerR = s.radius * 0.45;
      for (let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? outerR : innerR;
        const a = i * step + s.pulsePhase * 0.2;
        const x = s.x + Math.cos(a) * r;
        const y = s.y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.shadowColor = s.color.glow;
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.restore();
    });

    // 3. Draw Stardust Particles & Shockwaves
    this.particles.forEach(p => {
      ctx.save();
      if (p.type === 'shockwave') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${p.color} ${Math.max(0, p.alpha)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${Math.max(0, p.alpha)})`;
        ctx.shadowColor = 'rgba(24, 185, 237, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.restore();
    });
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    }
    window.removeEventListener('resize', this.handleResize);
  }
}
