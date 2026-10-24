// CalmPop - Mandala Bloom Creative Experience
// Built faithful to zero-syntax-gray.vercel.app reference implementation:
// 8-way radial symmetry kaleidoscopic drawing in shifting pastels (#0f0a1c background),
// pentatonic audio chimes (playPentatonicNote / playMandalaHarmonic),
// dynamic hue indicator, undo/redo, brush size control, clear canvas, and PNG save.

import { audioSynth } from '../audioSynth.js';
import { PrivateStorageManager } from '../privateStorage.js';

export function renderMandalaBloom(sessionManager, options = {}) {
  return `
    <div id="mandala-bloom-root" class="w-full h-full flex flex-col items-center justify-between p-2 sm:p-4 bg-purple-950/20 select-none min-h-[560px]">
      
      <!-- Top Sleek Floating Toolbar (Matching zero-syntax-gray.vercel.app) -->
      <div class="w-full max-w-2xl flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-purple-950/40 backdrop-blur-md border border-purple-500/20 text-xs text-purple-200 shadow-lg">
        
        <!-- Left: 8-Way Radial Symmetry Tag & Live Current Stroke Hue Indicator -->
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px] text-purple-400">explore</span>
          <span class="font-medium text-purple-100">8-Way Radial Symmetry</span>
          <span 
            id="mandala-hue-indicator" 
            class="w-3.5 h-3.5 rounded-full transition-colors border border-white/20 shadow-xs" 
            style="background-color: hsl(260, 85%, 68%);" 
            title="Current Stroke Hue"
          ></span>
        </div>

        <!-- Center / Right: Creative Controls (Brush Size, Undo, Redo, Clear, Save) -->
        <div class="flex items-center gap-1.5 flex-wrap">
          
          <!-- Mode Toggle (Morphing vs Fixed) -->
          <button 
            type="button" 
            id="btn-color-shifting" 
            class="hidden" 
            data-active="true"
          ></button>

          <!-- Brush Size Slider -->
          <div class="flex items-center gap-1.5 bg-purple-900/40 px-2 py-1 rounded-xl border border-purple-500/30 text-[11px]">
            <span class="material-symbols-outlined text-[13px] text-purple-300">brush</span>
            <input 
              type="range" 
              id="mandala-brush-size" 
              min="1.5" 
              max="16" 
              step="0.5" 
              value="2.5" 
              class="w-14 accent-purple-400 cursor-pointer" 
              title="Brush Size" 
            />
          </div>

          <!-- Undo Button -->
          <button 
            type="button" 
            id="btn-mandala-undo" 
            class="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition active:scale-95 flex items-center justify-center" 
            title="Undo Last Stroke"
          >
            <span class="material-symbols-outlined text-[16px]">undo</span>
          </button>

          <!-- Redo Button -->
          <button 
            type="button" 
            id="btn-mandala-redo" 
            class="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition active:scale-95 flex items-center justify-center" 
            title="Redo Stroke"
          >
            <span class="material-symbols-outlined text-[16px]">redo</span>
          </button>

          <!-- Clear Canvas Button (Exact style from reference) -->
          <button 
            type="button" 
            id="btn-mandala-clear" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition active:scale-95 font-medium"
            title="Clear Canvas"
          >
            <span class="material-symbols-outlined text-[15px]">refresh</span>
            <span>Clear Canvas</span>
          </button>

          <!-- Save Artwork -->
          <button 
            type="button" 
            id="btn-mandala-save" 
            class="p-1.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 text-purple-100 border border-purple-400/40 transition active:scale-95 flex items-center justify-center" 
            title="Save Mandala Image"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
          </button>

        </div>

      </div>

      <!-- Main Seamless Canvas Stage Container (Exact style from reference: w-full max-w-2xl border border-purple-500/30 shadow-2xl rounded-3xl overflow-hidden) -->
      <div 
        id="mandala-stage-container" 
        class="flex-1 w-full max-w-2xl relative my-3 rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl min-h-[440px] flex items-center justify-center bg-[#0f0a1c]"
      >
        <!-- The interactive canvas fills 100% of stage container with zero gaps -->
        <canvas 
          id="mandala-bloom-canvas" 
          class="w-full h-full cursor-crosshair touch-none select-none block"
          style="touch-action: none; display: block;"
        ></canvas>
      </div>

      <!-- Bottom Guidance Note (Exact wording from zero-syntax-gray.vercel.app) -->
      <p class="text-xs text-purple-200/60 text-center pb-2">
        Draw anywhere. 8 mirrored strokes bloom simultaneously in shifting pastel light.
      </p>

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
    this.currentHue = 260; // Reference starts at 260° (vibrant purple-violet)
    this.lastAudioTime = 0;
    this.brushSize = 2.5;

    // Undo / Redo history stack (snapshots of canvas)
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 20;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.canvas = document.getElementById('mandala-bloom-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.setupAndRenderGuides();
    this.saveState(); // Initial clear state with guides

    // Pointer events on canvas
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointerleave', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);

    window.addEventListener('resize', this.handleResize);

    this.attachUiListeners();
  }

  // Draw reference background guide lines: 8 rays + 3 concentric circles (0.3, 0.6, 0.9)
  drawGuides(ctx, cx, cy, radius) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // 8 radial rays
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();
    }

    // 3 concentric circles: 30%, 60%, 90%
    [radius * 0.3, radius * 0.6, radius * 0.9].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  }

  // Setup resolution matching the exact parent dimensions with DPR support
  setupAndRenderGuides() {
    const canvas = this.canvas;
    if (!canvas) return;
    const ctx = this.ctx;
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width || 672));
    const h = Math.max(300, Math.floor(rect.height || 480));

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0f0a1c'; // Reference exact background color
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.45;
    this.drawGuides(ctx, cx, cy, radius);

    this.displayWidth = w;
    this.displayHeight = h;
    this.centerX = cx;
    this.centerY = cy;
    this.guideRadius = radius;
  }

  handleResize() {
    if (!this.canvas) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);

    this.setupAndRenderGuides();
    this.ctx.drawImage(tempCanvas, 0, 0, this.displayWidth, this.displayHeight);
  }

  getPointerPos(e) {
    if (!this.canvas) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  handlePointerDown(e) {
    this.isDrawing = true;
    this.lastPoint = this.getPointerPos(e);
  }

  handlePointerMove(e) {
    if (!this.isDrawing || !this.lastPoint) return;
    const current = this.getPointerPos(e);
    this.drawMirroredStroke(this.lastPoint, current);
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

  // Mirrored drawing algorithm from zero-syntax-gray.vercel.app reference:
  // Shifts hue by +0.8° each step, translates to center, draws 8 rotations and reflections with shadow blur 8
  drawMirroredStroke(from, to) {
    const canvas = this.canvas;
    if (!canvas) return;
    const ctx = this.ctx;
    if (!ctx) return;

    const cx = this.centerX;
    const cy = this.centerY;
    const dx0 = from.x - cx;
    const dy0 = from.y - cy;
    const dx1 = to.x - cx;
    const dy1 = to.y - cy;

    // Shift hue smoothly
    this.currentHue = (this.currentHue + 0.8) % 360;
    this.updateHueIndicator(Math.round(this.currentHue));

    const color = `hsl(${this.currentHue}, 85%, 68%)`;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = color;
    ctx.lineWidth = this.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8; // Glowing neon petal halo

    for (let e = 0; e < 8; e++) {
      const angle = (e * Math.PI) / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Direct 8-fold ray
      const rx0 = dx0 * cos - dy0 * sin;
      const ry0 = dx0 * sin + dy0 * cos;
      const rx1 = dx1 * cos - dy1 * sin;
      const ry1 = dx1 * sin + dy1 * cos;

      ctx.beginPath();
      ctx.moveTo(rx0, ry0);
      ctx.lineTo(rx1, ry1);
      ctx.stroke();

      // Reflected 8-fold ray
      const mx0 = dx0 * cos + dy0 * sin;
      const my0 = dx0 * sin - dy0 * cos;
      const mx1 = dx1 * cos + dy1 * sin;
      const my1 = dx1 * sin - dy1 * cos;

      ctx.beginPath();
      ctx.moveTo(mx0, my0);
      ctx.lineTo(mx1, my1);
      ctx.stroke();
    }

    ctx.restore();

    // Pentatonic chime playback throttled to 110ms (from reference bundle)
    const now = Date.now();
    if (now - this.lastAudioTime > 110) {
      const noteIndex = Math.floor((this.currentHue / 45) % 8);
      this.playPentatonicNote(noteIndex, 4);
      this.lastAudioTime = now;
    }
  }

  // Harmonic pentatonic bell tone matching reference implementation:
  // Frequencies: [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25]
  playPentatonicNote(index, octave = 4) {
    if (audioSynth.isMuted) return;
    try {
      audioSynth.init();
      const ctx = audioSynth.ctx;
      if (!ctx) return;

      const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const baseFreq = pentatonicScale[index % pentatonicScale.length] || 261.63;
      const freq = baseFreq * Math.pow(2, octave - 4);

      const now = ctx.currentTime;
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const gain = ctx.createGain();

      oscA.type = 'sine';
      oscA.frequency.setValueAtTime(freq, now);

      oscB.type = 'triangle';
      oscB.frequency.setValueAtTime(freq * 2.002, now); // Micro-detuned shimmer overtone

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      oscA.connect(gain);
      oscB.connect(gain);
      gain.connect(ctx.destination);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + 1.4);
      oscB.stop(now + 1.4);
    } catch {}
  }

  updateHueIndicator(hue) {
    const indicator = document.getElementById('mandala-hue-indicator');
    if (indicator) {
      indicator.style.backgroundColor = `hsl(${hue}, 85%, 68%)`;
    }
  }

  saveState() {
    if (!this.canvas) return;
    if (this.undoStack.length >= this.maxHistory) {
      this.undoStack.shift();
    }
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
      const dpr = window.devicePixelRatio || 1;
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(prev, 0, 0);
      this.ctx.restore();
      audioSynth.playGentleTone?.(349, 0.3, 'sine', 0.03);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const next = this.redoStack.pop();
      this.undoStack.push(next);
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(next, 0, 0);
      this.ctx.restore();
      audioSynth.playGentleTone?.(440, 0.3, 'sine', 0.03);
    }
  }

  clearCanvas() {
    audioSynth.playBubblePop?.(0.9);
    this.setupAndRenderGuides();
    this.saveState();
    this.sessionManager?.recordEvent('mandala_clear');
  }

  attachUiListeners() {
    // Clear canvas button
    const clearBtn = document.getElementById('btn-mandala-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearCanvas());
    }

    // Brush size slider
    const sizeSlider = document.getElementById('mandala-brush-size');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        this.brushSize = parseFloat(e.target.value) || 2.5;
      });
    }

    // Undo / Redo
    const undoBtn = document.getElementById('btn-mandala-undo');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

    const redoBtn = document.getElementById('btn-mandala-redo');
    if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

    // Save Artwork
    const saveBtn = document.getElementById('btn-mandala-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveArtwork());
    }
  }

  async saveArtwork() {
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.canvas.width;
      exportCanvas.height = this.canvas.height;
      const expCtx = exportCanvas.getContext('2d');

      // Draw mandala artwork
      expCtx.drawImage(this.canvas, 0, 0);

      // Subtle watermark in footer
      expCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      expCtx.font = 'bold 13px sans-serif';
      expCtx.textAlign = 'center';
      expCtx.fillText('CalmPop • Mandala Bloom', exportCanvas.width / 2, exportCanvas.height - 18);

      const dataUrl = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `CalmPop-Mandala-${Date.now()}.png`;
      a.click();

      await PrivateStorageManager.savePrivateItem('mandala_art', {
        title: 'Mandala Bloom Kaleidoscope',
        savedAt: new Date().toISOString()
      });

      window.showToast?.('Mandala artwork saved and downloaded successfully.', 'download_done');
      audioSynth.playSuccessChime?.();
    } catch (e) {
      console.error('Save artwork error:', e);
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
      this.canvas.removeEventListener('pointermove', this.handlePointerMove);
      this.canvas.removeEventListener('pointerup', this.handlePointerUp);
      this.canvas.removeEventListener('pointerleave', this.handlePointerUp);
      this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    }
    window.removeEventListener('resize', this.handleResize);
  }
}
