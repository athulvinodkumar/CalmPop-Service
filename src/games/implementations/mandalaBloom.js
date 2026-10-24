// CalmPop - Mandala Bloom Creative Experience
// Eight-fold radial kaleidoscopic drawing in shifting pastels with
// harmonic pentatonic bell tones, undo/redo, brush controls, and PNG export.

import { audioSynth } from '../audioSynth.js';
import { PrivateStorageManager } from '../privateStorage.js';

const PASTEL_PALETTE = [
  { name: 'Sky Cyan', hex: '#38BDF8' },
  { name: 'Calm Lime', hex: '#C9F246' },
  { name: 'Blossom Rose', hex: '#F472B6' },
  { name: 'Lavender Mist', hex: '#C084FC' },
  { name: 'Mint Leaf', hex: '#4ADE80' },
  { name: 'Warm Peach', hex: '#FB923C' },
  { name: 'Soft Gold', hex: '#FACC15' },
  { name: 'Celestial White', hex: '#FFFFFF' }
];

export function renderMandalaBloom(sessionManager, options = {}) {
  return `
    <div id="mandala-bloom-root" class="relative w-full flex flex-col items-center justify-between min-h-[580px] p-2 sm:p-4 select-none">
      
      <!-- Top Creative Toolbar -->
      <div class="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-surface-container mb-3 text-xs shadow-xs">
        
        <!-- Left: Pastel Colors & Rainbow Shift Mode -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-outline font-semibold uppercase tracking-wider text-[10px] mr-1 hidden sm:inline">Color:</span>
          
          <!-- Shifting Pastels (Rainbow Cycle) Toggle -->
          <button 
            type="button" 
            id="btn-color-shifting" 
            class="px-2.5 py-1 rounded-xl font-bold transition-all bg-gradient-to-r from-pink-400 via-sky-400 to-lime-400 text-slate-900 shadow-xs flex items-center gap-1 ring-2 ring-primary"
            title="Shifting Pastels Mode: Smoothly morphs colors while drawing"
          >
            <span class="material-symbols-outlined text-[14px]">palette</span>
            <span>Morphing</span>
          </button>

          <!-- Fixed Pastel Palette Swatches -->
          ${PASTEL_PALETTE.map(p => `
            <button 
              type="button" 
              class="mandala-color-swatch w-6 h-6 rounded-full border border-black/20 hover:scale-125 transition-transform shadow-2xs"
              style="background-color: ${p.hex};"
              data-hex="${p.hex}"
              title="${p.name}"
            ></button>
          `).join('')}
        </div>

        <!-- Right: Brush, Undo, Redo, Clear, & Export -->
        <div class="flex items-center gap-2">
          
          <!-- Brush Size Slider -->
          <div class="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-xl border border-surface-container">
            <span class="material-symbols-outlined text-[14px] text-outline">brush</span>
            <input 
              type="range" 
              id="mandala-brush-size" 
              min="2" 
              max="24" 
              step="1" 
              value="4" 
              class="w-16 accent-primary cursor-pointer"
              title="Adjust Brush Width"
            />
          </div>

          <!-- Undo Button -->
          <button 
            type="button" 
            id="btn-mandala-undo" 
            class="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center"
            title="Undo Last Stroke"
          >
            <span class="material-symbols-outlined text-[18px]">undo</span>
          </button>

          <!-- Redo Button -->
          <button 
            type="button" 
            id="btn-mandala-redo" 
            class="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center"
            title="Redo Stroke"
          >
            <span class="material-symbols-outlined text-[18px]">redo</span>
          </button>

          <!-- Clear Canvas -->
          <button 
            type="button" 
            id="btn-mandala-clear" 
            class="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-all flex items-center gap-1"
            title="Clear Mandala Canvas"
          >
            <span class="material-symbols-outlined text-[16px]">restart_alt</span>
            <span class="hidden sm:inline">Clear</span>
          </button>

          <!-- Save / Export Artwork -->
          <button 
            type="button" 
            id="btn-mandala-save" 
            class="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold shadow-xs hover:bg-primary-container transition-all flex items-center gap-1.5"
            title="Save Mandala Image"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>Save Artwork</span>
          </button>

        </div>

      </div>

      <!-- Main Mandala Drawing Stage (No extra padding or margins, seamless full canvas) -->
      <div id="mandala-stage-container" class="relative w-full flex-1 min-h-[560px] h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-[#070A12] flex items-center justify-center">
        
        <!-- Interactive 8-Fold Mandala Drawing Canvas (Takes 100% of the entire viewport area) -->
        <canvas 
          id="mandala-bloom-canvas" 
          class="w-full h-full block cursor-crosshair touch-none"
          style="touch-action: none; display: block;"
        ></canvas>

        <!-- Tap Guidance Hint -->
        <div id="mandala-hint" class="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg transition-opacity duration-700 flex items-center gap-2 border border-white/20 z-20">
          <span class="material-symbols-outlined text-[16px] text-cyan-400 animate-pulse">auto_fix_high</span>
          <span>Click or drag anywhere across the canvas — 8-fold radial petals bloom automatically</span>
        </div>

      </div>

      <!-- Bottom Guidance Note -->
      <div class="mt-2 text-center text-outline text-[11px] flex items-center gap-2">
        <span class="material-symbols-outlined text-[14px] text-primary">grain</span>
        <span>Eight-fold kaleidoscopic symmetry with harmonic pentatonic bell tones mapped to canvas radius.</span>
      </div>

    </div>
  `;
}

export class MandalaBloomController {
  constructor(sessionManager, options = {}) {
    this.sessionManager = sessionManager;
    this.options = options;
    
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.lastPoint = null;
    this.hasInteracted = false;

    // Drawing parameters
    this.isShiftingColor = true;
    this.colorHue = 190; // Start at calm cyan
    this.currentColor = '#38BDF8';
    this.brushSize = 4;

    // Canvas dimensions
    this.displayWidth = 800;
    this.displayHeight = 520;
    this.centerX = 400;
    this.centerY = 260;

    // Undo / Redo history stack (stored as offscreen canvas snapshots)
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 20;

    // Audio frequency mapping throttle
    this.lastAudioTime = 0;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.canvas = document.getElementById('mandala-bloom-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.setupCanvasSize();
    this.drawBackgroundGuides();
    this.saveState(); // Initial blank state with guides

    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
    window.addEventListener('resize', this.handleResize);

    this.attachUiListeners();
  }

  setupCanvasSize() {
    if (!this.canvas) return;
    const parent = document.getElementById('mandala-stage-container') || this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2); // High-DPI crisp antialiased rendering
    
    // Accurate pixel dimensions of container
    const width = Math.max(300, Math.floor(parent.clientWidth || rect.width || 800));
    const height = Math.max(360, Math.floor(parent.clientHeight || rect.height || 560));

    this.dpr = dpr;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this.displayWidth = width;
    this.displayHeight = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  drawBackgroundGuides() {
    // Subtle background concentric guidelines spanning the entire canvas
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const cx = this.centerX * dpr;
    const cy = this.centerY * dpr;
    const maxR = Math.hypot(this.centerX, this.centerY) * dpr;

    ctx.save();
    
    // Rich deep celestial backdrop filling entire canvas
    const grad = ctx.createRadialGradient(cx, cy, 20 * dpr, cx, cy, maxR);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.6, '#0B1120');
    grad.addColorStop(1, '#05070D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Concentric guide rings across full width & height
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'; // faint cyan ring
    const ringRadii = [60, 120, 180, 240, 320, 420];
    for (const r of ringRadii) {
      if (r * dpr < maxR) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Radial axis guide rays (8 axes radiating out to canvas borders)
    ctx.strokeStyle = 'rgba(201, 242, 70, 0.05)'; // faint lime axis
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.stroke();
    }

    // Faint center point
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  handleResize() {
    if (!this.canvas) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);

    this.setupCanvasSize();
    this.ctx.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }

  attachUiListeners() {
    // Shifting color button
    const shiftBtn = document.getElementById('btn-color-shifting');
    if (shiftBtn) {
      shiftBtn.addEventListener('click', () => {
        this.isShiftingColor = true;
        shiftBtn.classList.add('ring-2', 'ring-primary');
        document.querySelectorAll('.mandala-color-swatch').forEach(s => s.classList.remove('ring-2', 'ring-white'));
      });
    }

    // Color Swatches
    document.querySelectorAll('.mandala-color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        this.isShiftingColor = false;
        if (shiftBtn) shiftBtn.classList.remove('ring-2', 'ring-primary');
        document.querySelectorAll('.mandala-color-swatch').forEach(s => s.classList.remove('ring-2', 'ring-white'));
        e.currentTarget.classList.add('ring-2', 'ring-white');
        this.currentColor = e.currentTarget.dataset.hex;
      });
    });

    // Brush Size Slider
    const sizeSlider = document.getElementById('mandala-brush-size');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        this.brushSize = parseInt(e.target.value, 10) || 4;
      });
    }

    // Undo / Redo
    const undoBtn = document.getElementById('btn-mandala-undo');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

    const redoBtn = document.getElementById('btn-mandala-redo');
    if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

    // Clear Canvas
    const clearBtn = document.getElementById('btn-mandala-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.drawBackgroundGuides();
        this.saveState();
        this.sessionManager?.recordEvent('mandala_clear');
        audioSynth.playGentleTone(261, 0.6, 'sine', 0.04);
      });
    }

    // Save Artwork
    const saveBtn = document.getElementById('btn-mandala-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveArtwork());
    }
  }

  saveState() {
    if (this.undoStack.length >= this.maxHistory) {
      this.undoStack.shift();
    }
    // Store snapshot in an offscreen canvas for resolution independence
    const snapshotCanvas = document.createElement('canvas');
    snapshotCanvas.width = this.canvas.width;
    snapshotCanvas.height = this.canvas.height;
    const snapCtx = snapshotCanvas.getContext('2d');
    snapCtx.drawImage(this.canvas, 0, 0);

    this.undoStack.push(snapshotCanvas);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 1) {
      const current = this.undoStack.pop();
      this.redoStack.push(current);
      const prev = this.undoStack[this.undoStack.length - 1];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(prev, 0, 0);
      audioSynth.playGentleTone(349, 0.3, 'sine', 0.03);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const next = this.redoStack.pop();
      this.undoStack.push(next);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(next, 0, 0);
      audioSynth.playGentleTone(440, 0.3, 'sine', 0.03);
    }
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    // Accurately map mouse / touch coordinate relative to canvas bounding box
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    return {
      x: Math.max(0, Math.min(this.displayWidth, rawX)),
      y: Math.max(0, Math.min(this.displayHeight, rawY))
    };
  }

  handlePointerDown(e) {
    this.hideHint();
    this.isDrawing = true;
    const pos = this.getPointerPos(e);
    this.lastPoint = pos;
    // Draw initial spot so taps and clicks register immediately anywhere
    this.drawPoint(pos);
    this.playRadialTone(pos);
  }

  handlePointerMove(e) {
    if (!this.isDrawing || !this.lastPoint) return;
    const current = this.getPointerPos(e);

    const dist = Math.hypot(current.x - this.lastPoint.x, current.y - this.lastPoint.y);
    if (dist < 1.5) return;

    this.drawStroke(this.lastPoint, current);
    this.playRadialTone(current);

    this.lastPoint = current;
    this.sessionManager?.recordEvent('mandala_stroke');
  }

  handlePointerUp() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.lastPoint = null;
      this.saveState();
    }
  }

  hideHint() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      const hint = document.getElementById('mandala-hint');
      if (hint) {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 700);
      }
    }
  }

  drawPoint(p) {
    // Single tap/point placement across all 8 radial symmetries
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const cx = this.centerX * dpr;
    const cy = this.centerY * dpr;

    if (this.isShiftingColor) {
      this.colorHue = (this.colorHue + 1.2) % 360;
      this.currentColor = `hsl(${this.colorHue}, 90%, 72%)`;
    }

    ctx.save();
    ctx.fillStyle = this.currentColor;
    ctx.shadowColor = this.currentColor;
    ctx.shadowBlur = Math.min(10, this.brushSize * 1.5) * dpr;

    const x = (p.x - this.centerX) * dpr;
    const y = (p.y - this.centerY) * dpr;
    const radius = (this.brushSize / 2) * dpr;

    const segments = 8;
    const angleStep = (Math.PI * 2) / segments;

    for (let k = 0; k < segments; k++) {
      const angle = k * angleStep;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Direct rotation
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      ctx.beginPath();
      ctx.arc(cx + rx, cy + ry, radius, 0, Math.PI * 2);
      ctx.fill();

      // Reflected mirror
      const mx = x * cos - (-y) * sin;
      const my = x * sin + (-y) * cos;
      ctx.beginPath();
      ctx.arc(cx + mx, cy + my, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawStroke(p0, p1) {
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const cx = this.centerX * dpr;
    const cy = this.centerY * dpr;

    // Shift color if in rainbow morphing mode
    if (this.isShiftingColor) {
      this.colorHue = (this.colorHue + 0.8) % 360;
      this.currentColor = `hsl(${this.colorHue}, 90%, 72%)`;
    }

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = this.brushSize * dpr;
    ctx.strokeStyle = this.currentColor;
    // Crisp clarity: restrained shadow glow with sharp line stroke
    ctx.shadowColor = this.currentColor;
    ctx.shadowBlur = Math.min(8, this.brushSize * 1.5) * dpr;

    // Coordinate vectors relative to center, scaled to internal canvas resolution
    const x0 = (p0.x - this.centerX) * dpr;
    const y0 = (p0.y - this.centerY) * dpr;
    const x1 = (p1.x - this.centerX) * dpr;
    const y1 = (p1.y - this.centerY) * dpr;

    // 8-Fold Radial Kaleidoscopic Symmetry (with reflection across petals = 16-segment symmetry)
    const segments = 8;
    const angleStep = (Math.PI * 2) / segments;

    for (let k = 0; k < segments; k++) {
      const angle = k * angleStep;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // 1. Direct 8-fold rotation
      const rx0 = x0 * cos - y0 * sin;
      const ry0 = x0 * sin + y0 * cos;
      const rx1 = x1 * cos - y1 * sin;
      const ry1 = x1 * sin + y1 * cos;

      ctx.beginPath();
      ctx.moveTo(cx + rx0, cy + ry0);
      ctx.lineTo(cx + rx1, cy + ry1);
      ctx.stroke();

      // 2. Reflected 8-fold mirror
      const mx0 = x0 * cos - (-y0) * sin;
      const my0 = x0 * sin + (-y0) * cos;
      const mx1 = x1 * cos - (-y1) * sin;
      const my1 = x1 * sin + (-y1) * cos;

      ctx.beginPath();
      ctx.moveTo(cx + mx0, cy + my0);
      ctx.lineTo(cx + mx1, cy + my1);
      ctx.stroke();
    }

    ctx.restore();
  }

  playRadialTone(pos) {
    const now = Date.now();
    if (now - this.lastAudioTime < 90) return; // Serene musical pace

    const dx = pos.x - this.centerX;
    const dy = pos.y - this.centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = Math.hypot(this.centerX, this.centerY);
    const ratio = Math.min(dist / Math.max(1, maxRadius), 1.0);

    // Map distance to pentatonic scale: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6
    const pentatonicFrequencies = [
      261.63, 293.66, 329.63, 392.00, 440.00, 
      523.25, 587.33, 659.25, 783.99, 880.00, 1046.50
    ];
    const index = Math.min(Math.floor(ratio * pentatonicFrequencies.length), pentatonicFrequencies.length - 1);
    const freq = pentatonicFrequencies[index];

    // Pan based on horizontal position relative to center (-1 to +1)
    const pan = Math.max(-0.9, Math.min(0.9, dx / Math.max(1, this.centerX)));

    audioSynth.playMandalaHarmonic(freq, pan);
    this.lastAudioTime = now;
  }

  async saveArtwork() {
    try {
      // 1. Create a styled high-resolution export canvas with dark starry backdrop
      const exportCanvas = document.createElement('canvas');
      const pad = 40;
      exportCanvas.width = this.canvas.width + pad * 2;
      exportCanvas.height = this.canvas.height + pad * 2;
      const expCtx = exportCanvas.getContext('2d');

      // Gradient background
      const grad = expCtx.createRadialGradient(
        exportCanvas.width / 2, exportCanvas.height / 2, 20, 
        exportCanvas.width / 2, exportCanvas.height / 2, exportCanvas.width / 2
      );
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(1, '#020617');
      expCtx.fillStyle = grad;
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Draw mandala in center
      expCtx.drawImage(this.canvas, pad, pad);

      // Subtle signature brand watermark
      expCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      expCtx.font = 'bold 14px sans-serif';
      expCtx.textAlign = 'center';
      expCtx.fillText('CalmPop Mandala Bloom', exportCanvas.width / 2, exportCanvas.height - 15);

      // 2. Download as PNG
      const dataUrl = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `CalmPop-Mandala-${Date.now()}.png`;
      a.click();

      // 3. Save privately to employee storage
      await PrivateStorageManager.savePrivateItem('mandala_art', {
        title: 'Mandala Bloom Kaleidoscope',
        savedAt: new Date().toISOString()
      });

      window.showToast?.('Mandala artwork saved and downloaded successfully.', 'download_done');
      audioSynth.playSuccessChime();
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    window.removeEventListener('resize', this.handleResize);
  }
}
