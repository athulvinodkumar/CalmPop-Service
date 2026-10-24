// CalmPop - Zen Sand Interactive Game
// A tactile, serene 3-tine rake sand garden with realistic grooves,
// natural sand texture, Zen stones, wave smoothing, and whispering audio.

import { audioSynth } from '../audioSynth.js';

export function renderZenSand(sessionManager, options = {}) {
  return `
    <div id="zen-sand-root" class="relative w-full h-full flex flex-col items-center justify-between min-h-[560px] p-1 sm:p-2 select-none">
      
      <!-- Top Garden Toolbar -->
      <div class="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-surface-container mb-2 text-xs">
        
        <!-- Left: Tool & Mode Switcher -->
        <div class="flex items-center gap-2">
          <span class="text-outline font-semibold uppercase tracking-wider text-[10px] hidden sm:inline">Tool:</span>
          
          <button 
            type="button" 
            id="zen-tool-rake" 
            class="zen-tool-btn px-3 py-1.5 rounded-xl font-bold transition-all bg-primary text-on-primary shadow-xs flex items-center gap-1.5"
            data-tool="rake"
            title="3-Tine Bamboo Rake"
          >
            <span class="material-symbols-outlined text-[16px]">draw</span>
            <span>3-Tine Rake</span>
          </button>

          <button 
            type="button" 
            id="zen-tool-stone" 
            class="zen-tool-btn px-3 py-1.5 rounded-xl font-medium transition-all text-on-surface-variant hover:bg-surface-container flex items-center gap-1.5"
            data-tool="stone"
            title="Place Zen River Stones"
          >
            <span class="material-symbols-outlined text-[16px]">circle</span>
            <span>Place Stone</span>
          </button>

          <!-- Tine Spacing Selector -->
          <div class="hidden md:flex items-center gap-1 border-l border-surface-container pl-2 ml-1 text-[11px]">
            <span class="text-outline text-[10px]">Tines:</span>
            <button type="button" class="zen-tine-btn px-2 py-0.5 rounded-lg bg-surface-container text-on-surface font-semibold" data-spacing="14">Narrow</button>
            <button type="button" class="zen-tine-btn px-2 py-0.5 rounded-lg text-outline hover:text-on-surface" data-spacing="20">Medium</button>
            <button type="button" class="zen-tine-btn px-2 py-0.5 rounded-lg text-outline hover:text-on-surface" data-spacing="28">Wide</button>
          </div>
        </div>

        <!-- Right: Actions (Wave Smoothing, Reset, Sound) -->
        <div class="flex items-center gap-2">
          
          <!-- Wave Smoothing Action -->
          <button 
            type="button" 
            id="btn-zen-wave-smooth" 
            class="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-800 dark:text-cyan-200 font-bold transition-all flex items-center gap-1.5 border border-cyan-500/30"
            title="Restore sand with a gentle ocean wave"
          >
            <span class="material-symbols-outlined text-[16px] animate-pulse">waves</span>
            <span>Wave Smoothing</span>
          </button>

          <!-- Clear / Reset Sand -->
          <button 
            type="button" 
            id="btn-zen-reset" 
            class="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-all flex items-center gap-1"
            title="Smooth sand completely"
          >
            <span class="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Sand</span>
          </button>
        </div>

      </div>

      <!-- Main Sand Canvas Container with Zero Padding / Margins -->
      <div class="relative w-full max-w-5xl flex-1 min-h-[480px] rounded-2xl p-0 m-0 shadow-2xl border border-surface-container flex items-center justify-center overflow-hidden">
        
        <!-- Inner Canvas Viewport -->
        <div class="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden p-0 m-0 bg-[#DFCDA4]">
          
          <!-- Interactive Sand Garden Canvas -->
          <canvas 
            id="zen-sand-canvas" 
            class="w-full h-full block cursor-crosshair touch-none m-0 p-0"
            style="touch-action: none; display: block;"
          ></canvas>

          <!-- Wave Overlay Canvas (for translucent ocean water wash effect) -->
          <canvas 
            id="zen-wave-canvas" 
            class="absolute inset-0 w-full h-full pointer-events-none m-0 p-0"
            style="touch-action: none; display: block;"
          ></canvas>

          <!-- Subtle Drag Prompt Overlay (Disappears on first interaction) -->
          <div id="zen-sand-hint" class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/40 backdrop-blur-md text-white text-[11px] font-medium px-4 py-1.5 rounded-full shadow-lg transition-opacity duration-700 flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">touch_app</span>
            <span>Drag mouse or touch to rake the sand garden</span>
          </div>

        </div>

      </div>

      <!-- Bottom Guidance Note -->
      <div class="mt-2 text-center text-outline text-[11px] flex items-center gap-2">
        <span class="material-symbols-outlined text-[14px] text-tertiary">spa</span>
        <span>Rake slowly to hear filtered whispering sand friction. Click Wave Smoothing to restore harmony.</span>
      </div>

    </div>
  `;
}

export class ZenSandController {
  constructor(sessionManager, options = {}) {
    this.sessionManager = sessionManager;
    this.options = options;
    
    this.canvas = null;
    this.ctx = null;
    this.waveCanvas = null;
    this.waveCtx = null;
    
    // Offscreen background sand buffer
    this.bgBuffer = null;
    this.bgCtx = null;

    // Rake state
    this.activeTool = 'rake'; // 'rake' | 'stone'
    this.tineSpacing = 20;
    this.isDragging = false;
    this.lastPoint = null;
    this.hasInteracted = false;
    
    // Placed Zen stones
    this.stones = []; // { x, y, radius, color, highlightColor }

    // Wave smoothing animation state
    this.isWaveActive = false;
    this.waveProgress = 0;
    this.waveAnimId = null;

    // Audio throttle
    this.lastAudioTime = 0;

    // Bound listeners for cleanup
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.canvas = document.getElementById('zen-sand-canvas');
    this.waveCanvas = document.getElementById('zen-wave-canvas');
    if (!this.canvas || !this.waveCanvas) return;

    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.waveCtx = this.waveCanvas.getContext('2d');

    // Create offscreen buffer
    this.bgBuffer = document.createElement('canvas');
    this.bgCtx = this.bgBuffer.getContext('2d');

    this.setupResolution();
    this.generateSmoothSand();
    this.render();

    // Preload user sand garden image to fit the canvas background seamlessly
    this.sandImg = new Image();
    this.sandImg.src = '/images/zen-sand-thumbnail.jpg';
    this.sandImg.onload = () => {
      this.generateSmoothSand();
      this.render();
    };

    // Attach listeners
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
    window.addEventListener('resize', this.handleResize);

    this.attachUiListeners();
  }

  setupResolution() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(300, Math.floor(rect.width || 800));
    const height = Math.max(200, Math.floor(rect.height || 460));

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.waveCanvas.width = width * dpr;
    this.waveCanvas.height = height * dpr;
    this.bgBuffer.width = width * dpr;
    this.bgBuffer.height = height * dpr;

    this.ctx.scale(dpr, dpr);
    this.waveCtx.scale(dpr, dpr);
    this.bgCtx.scale(dpr, dpr);

    this.displayWidth = width;
    this.displayHeight = height;
  }

  handleResize() {
    if (!this.canvas) return;
    const oldW = this.displayWidth;
    const oldH = this.displayHeight;
    
    // Save current drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);

    this.setupResolution();
    this.generateSmoothSand();

    // Restore previous artwork scaled
    this.ctx.drawImage(tempCanvas, 0, 0, this.displayWidth, this.displayHeight);
    this.drawStones();
  }

  generateSmoothSand() {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const bg = this.bgCtx;

    if (this.sandImg && this.sandImg.complete && this.sandImg.naturalWidth > 0) {
      const imgRatio = this.sandImg.naturalWidth / this.sandImg.naturalHeight;
      const canvasRatio = w / h;
      let dw, dh, dx, dy;
      if (canvasRatio > imgRatio) {
        dw = w;
        dh = w / imgRatio;
        dx = 0;
        dy = (h - dh) / 2;
      } else {
        dh = h;
        dw = h * imgRatio;
        dx = (w - dw) / 2;
        dy = 0;
      }
      bg.drawImage(this.sandImg, dx, dy, dw, dh);
      return;
    }

    // Warm natural sand base gradient
    const grad = bg.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#E8D7B2');
    grad.addColorStop(0.5, '#DFCCA2');
    grad.addColorStop(1, '#D5BE92');
    bg.fillStyle = grad;
    bg.fillRect(0, 0, w, h);

    // Fine organic sand grain texture
    const imgData = bg.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.7));
    }
    bg.putImageData(imgData, 0, 0);

    // Subtle soft light wash
    const lightGrad = bg.createRadialGradient(w * 0.2, h * 0.2, 20, w * 0.2, h * 0.2, w * 0.8);
    lightGrad.addColorStop(0, 'rgba(255, 252, 240, 0.22)');
    lightGrad.addColorStop(1, 'rgba(160, 130, 90, 0.08)');
    bg.fillStyle = lightGrad;
    bg.fillRect(0, 0, w, h);
  }

  render() {
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    this.ctx.drawImage(this.bgBuffer, 0, 0, this.displayWidth, this.displayHeight);
    this.drawStones();
  }

  attachUiListeners() {
    // Tool buttons
    const rakeBtn = document.getElementById('zen-tool-rake');
    const stoneBtn = document.getElementById('zen-tool-stone');
    if (rakeBtn && stoneBtn) {
      rakeBtn.addEventListener('click', () => {
        this.activeTool = 'rake';
        rakeBtn.className = 'zen-tool-btn px-3 py-1.5 rounded-xl font-bold transition-all bg-primary text-on-primary shadow-xs flex items-center gap-1.5';
        stoneBtn.className = 'zen-tool-btn px-3 py-1.5 rounded-xl font-medium transition-all text-on-surface-variant hover:bg-surface-container flex items-center gap-1.5';
      });
      stoneBtn.addEventListener('click', () => {
        this.activeTool = 'stone';
        stoneBtn.className = 'zen-tool-btn px-3 py-1.5 rounded-xl font-bold transition-all bg-primary text-on-primary shadow-xs flex items-center gap-1.5';
        rakeBtn.className = 'zen-tool-btn px-3 py-1.5 rounded-xl font-medium transition-all text-on-surface-variant hover:bg-surface-container flex items-center gap-1.5';
      });
    }

    // Tine spacing buttons
    document.querySelectorAll('.zen-tine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.zen-tine-btn').forEach(b => {
          b.className = 'zen-tine-btn px-2 py-0.5 rounded-lg text-outline hover:text-on-surface';
        });
        e.currentTarget.className = 'zen-tine-btn px-2 py-0.5 rounded-lg bg-surface-container text-on-surface font-semibold';
        this.tineSpacing = parseInt(e.currentTarget.dataset.spacing, 10) || 20;
      });
    });

    // Wave Smoothing Button
    const waveBtn = document.getElementById('btn-zen-wave-smooth');
    if (waveBtn) {
      waveBtn.addEventListener('click', () => this.triggerWaveSmoothing());
    }

    // Reset Sand Button
    const resetBtn = document.getElementById('btn-zen-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stones = [];
        this.render();
        this.sessionManager?.recordEvent('sand_reset');
        audioSynth.playGentleTone(392, 0.8, 'sine', 0.03);
      });
    }
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  handlePointerDown(e) {
    if (this.isWaveActive) return;
    this.hideHint();
    const pos = this.getPointerPos(e);

    if (this.activeTool === 'stone') {
      this.placeStone(pos.x, pos.y);
      return;
    }

    this.isDragging = true;
    this.lastPoint = pos;
    this.drawTines(pos, pos);
    audioSynth.playSandRakeFriction(1.0);
  }

  handlePointerMove(e) {
    if (!this.isDragging || !this.lastPoint || this.isWaveActive) return;
    const current = this.getPointerPos(e);

    const dx = current.x - this.lastPoint.x;
    const dy = current.y - this.lastPoint.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 3) return;

    this.drawTines(this.lastPoint, current);

    // Whispering sand friction sound (throttled to ~60ms)
    const now = Date.now();
    if (now - this.lastAudioTime > 55) {
      const speed = Math.min(dist / 12, 2.5);
      audioSynth.playSandRakeFriction(speed);
      this.lastAudioTime = now;
    }

    this.lastPoint = current;
    this.sessionManager?.recordEvent('rake_stroke');
  }

  handlePointerUp() {
    this.isDragging = false;
    this.lastPoint = null;
  }

  hideHint() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      const hint = document.getElementById('zen-sand-hint');
      if (hint) {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 700);
      }
    }
  }

  drawTines(p0, p1) {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;

    // Perpendicular vector for the 3 rake tines
    const nx = -dy / len;
    const ny = dx / len;

    const spacing = this.tineSpacing;
    const offsets = [-spacing, 0, spacing];

    offsets.forEach(off => {
      const x0 = p0.x + nx * off;
      const y0 = p0.y + ny * off;
      const x1 = p1.x + nx * off;
      const y1 = p1.y + ny * off;

      this.carveGroove(x0, y0, x1, y1);
    });

    // Redraw stones so grooves pass under them naturally
    if (this.stones.length > 0) {
      this.drawStones();
    }
  }

  carveGroove(x0, y0, x1, y1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Deep Shadow Furrow (inner center of tine)
    ctx.strokeStyle = 'rgba(88, 70, 45, 0.45)';
    ctx.lineWidth = 7.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // 2. Soft Secondary Shadow (depth contour)
    ctx.strokeStyle = 'rgba(125, 100, 68, 0.35)';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // 3. Highlight Ridge (pushed sand ridge on top-left of each groove)
    ctx.strokeStyle = 'rgba(255, 250, 235, 0.38)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x0 - 2, y0 - 2);
    ctx.lineTo(x1 - 2, y1 - 2);
    ctx.stroke();

    ctx.restore();
  }

  placeStone(x, y) {
    const radius = 18 + Math.floor(Math.random() * 16);
    const stonePalettes = [
      { base: '#3D4148', shadow: '#22252A', light: '#5C626C' }, // Basalt
      { base: '#4E5340', shadow: '#2D3025', light: '#737A61' }, // Mossy River Stone
      { base: '#5C5449', shadow: '#353029', light: '#857B6C' }  // Warm Granite
    ];
    const palette = stonePalettes[Math.floor(Math.random() * stonePalettes.length)];

    this.stones.push({ x, y, radius, palette });
    this.drawStones();
    audioSynth.playPop();
    this.sessionManager?.recordEvent('place_stone');
  }

  drawStones() {
    const ctx = this.ctx;
    this.stones.forEach(stone => {
      ctx.save();
      const { x, y, radius, palette } = stone;

      // Cast shadow onto sand
      ctx.beginPath();
      ctx.ellipse(x + 4, y + 6, radius * 1.05, radius * 0.75, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(60, 45, 30, 0.32)';
      ctx.filter = 'blur(4px)';
      ctx.fill();
      ctx.filter = 'none';

      // Stone body gradient
      const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
      grad.addColorStop(0, palette.light);
      grad.addColorStop(0.7, palette.base);
      grad.addColorStop(1, palette.shadow);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Stone subtle specular sheen
      ctx.beginPath();
      ctx.ellipse(x - radius * 0.35, y - radius * 0.35, radius * 0.4, radius * 0.25, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();

      ctx.restore();
    });
  }

  // --- WAVE SMOOTHING ACTION ---
  triggerWaveSmoothing() {
    if (this.isWaveActive) return;
    this.isWaveActive = true;
    this.waveProgress = 0;

    audioSynth.playOceanWaveSmoothing();
    this.sessionManager?.recordEvent('wave_smoothing');

    const totalDuration = 2800; // ms
    const startTime = performance.now();

    // Snapshot current raked sand
    const rakedSnapshot = document.createElement('canvas');
    rakedSnapshot.width = this.canvas.width;
    rakedSnapshot.height = this.canvas.height;
    rakedSnapshot.getContext('2d').drawImage(this.canvas, 0, 0);

    const animateWave = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1.0);
      this.waveProgress = progress;

      // 1. Draw sand transitioning from raked to flat
      this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
      this.ctx.drawImage(rakedSnapshot, 0, 0, this.displayWidth, this.displayHeight);

      // Restore pristine sand behind wave front
      const waveX = progress * (this.displayWidth + 160) - 80;
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(0, 0, Math.max(0, waveX), this.displayHeight);
      this.ctx.clip();
      this.ctx.drawImage(this.bgBuffer, 0, 0, this.displayWidth, this.displayHeight);
      this.ctx.restore();

      // 2. Draw animated ocean wave crest & foam on wave canvas
      const wCtx = this.waveCtx;
      wCtx.clearRect(0, 0, this.displayWidth, this.displayHeight);

      if (progress < 1.0) {
        wCtx.save();
        
        // Translucent ocean water body
        const waveGrad = wCtx.createLinearGradient(waveX - 120, 0, waveX + 30, 0);
        waveGrad.addColorStop(0, 'rgba(180, 235, 250, 0.0)');
        waveGrad.addColorStop(0.6, 'rgba(140, 215, 245, 0.35)');
        waveGrad.addColorStop(0.9, 'rgba(255, 255, 255, 0.65)');
        waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

        wCtx.fillStyle = waveGrad;
        wCtx.beginPath();
        wCtx.moveTo(waveX - 120, 0);
        
        // Dynamic water wave curve
        for (let y = 0; y <= this.displayHeight; y += 15) {
          const waveOffset = Math.sin(y * 0.03 + progress * 8) * 12 + Math.cos(y * 0.07) * 6;
          wCtx.lineTo(waveX + waveOffset, y);
        }
        wCtx.lineTo(0, this.displayHeight);
        wCtx.lineTo(0, 0);
        wCtx.closePath();
        wCtx.fill();

        // Wave foam bubbles
        wCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 18; i++) {
          const fy = (i * 26 + (now * 0.05) % 30) % this.displayHeight;
          const fx = waveX + Math.sin(fy * 0.05) * 8 - Math.random() * 20;
          wCtx.beginPath();
          wCtx.arc(fx, fy, 2 + Math.random() * 3, 0, Math.PI * 2);
          wCtx.fill();
        }

        wCtx.restore();
      }

      // Re-draw stones on top
      this.drawStones();

      if (progress < 1.0) {
        this.waveAnimId = requestAnimationFrame(animateWave);
      } else {
        // Complete wave
        this.waveCtx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        this.render();
        this.isWaveActive = false;
        this.waveAnimId = null;
      }
    };

    this.waveAnimId = requestAnimationFrame(animateWave);
  }

  destroy() {
    if (this.waveAnimId) {
      cancelAnimationFrame(this.waveAnimId);
      this.waveAnimId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    window.removeEventListener('resize', this.handleResize);
  }
}
