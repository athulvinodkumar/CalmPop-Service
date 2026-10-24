// CalmPop - Game 5: Inkstorm
// Creative fluid ink painting canvas with brush styles, watercolor palettes,
// pressure-sensitive stylus/mouse/touch painting, undo/redo, eraser, and private artwork saving.

import { PrivateStorageManager } from '../privateStorage.js';
import { audioSynth } from '../audioSynth.js';

const INK_PALETTE = [
  { name: 'Calm Navy', hex: '#006191' },
  { name: 'Sky Cyan', hex: '#18B9ED' },
  { name: 'Meadow Lime', hex: '#C9F246' },
  { name: 'Forest Teal', hex: '#0d9488' },
  { name: 'Sunset Amber', hex: '#f59e0b' },
  { name: 'Lavender Mist', hex: '#8b5cf6' },
  { name: 'Petal Rose', hex: '#ec4899' },
  { name: 'Night Obsidian', hex: '#1e293b' },
  { name: 'Pure White', hex: '#ffffff' }
];

export function renderInkstorm(sessionManager) {
  return `
    <div id="inkstorm-app" class="w-full max-w-xl mx-auto flex flex-col items-center space-y-3 select-none">
      
      <!-- TOOLBAR: BRUSHES, SIZE, ERASER, UNDO, REDO -->
      <div class="w-full flex flex-wrap items-center justify-between gap-2 p-2 bg-surface-container-low/80 rounded-2xl border border-surface-container text-xs">
        
        <!-- Palette Colors -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          ${INK_PALETTE.map((c, i) => `
            <button 
              type="button" 
              onclick="window.inkstormInstance?.setColor('${c.hex}')"
              class="w-6 h-6 rounded-full border-2 border-white shadow-xs transition-transform hover:scale-115 flex-shrink-0 ${i === 0 ? 'ring-2 ring-primary scale-110' : ''}"
              style="background-color: ${c.hex};"
              title="${c.name}"
              aria-label="${c.name}"
            ></button>
          `).join('')}
        </div>

        <!-- Brush Sizes & Eraser -->
        <div class="flex items-center gap-2">
          
          <!-- Size Slider -->
          <div class="flex items-center gap-1">
            <span class="text-[10px] text-outline font-semibold">Size:</span>
            <input 
              id="ink-size-slider" 
              type="range" 
              min="3" 
              max="45" 
              value="14" 
              oninput="window.inkstormInstance?.setBrushSize(this.value)"
              class="w-16 sm:w-20 cursor-pointer"
            />
          </div>

          <!-- Eraser Toggle -->
          <button 
            type="button" 
            id="ink-eraser-btn"
            onclick="window.inkstormInstance?.toggleEraser()" 
            class="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center"
            title="Eraser"
          >
            <span class="material-symbols-outlined text-[18px]">ink_eraser</span>
          </button>

          <!-- Undo -->
          <button 
            type="button" 
            onclick="window.inkstormInstance?.undo()" 
            class="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center"
            title="Undo"
          >
            <span class="material-symbols-outlined text-[18px]">undo</span>
          </button>

          <!-- Redo -->
          <button 
            type="button" 
            onclick="window.inkstormInstance?.redo()" 
            class="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center"
            title="Redo"
          >
            <span class="material-symbols-outlined text-[18px]">redo</span>
          </button>

          <!-- Clear Canvas -->
          <button 
            type="button" 
            onclick="window.inkstormInstance?.clearCanvas()" 
            class="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-[11px] font-semibold text-outline hover:text-error transition-all"
          >
            Clear
          </button>

        </div>

      </div>

      <!-- MAIN PAINTING CANVAS -->
      <div class="relative w-full h-[380px] sm:h-[430px] rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-slate-900">
        <canvas id="inkstorm-canvas" class="w-full h-full block touch-none cursor-crosshair"></canvas>
      </div>

      <!-- BOTTOM ACTIONS: SAVE PRIVATELY, DOWNLOAD, DISCARD -->
      <div class="w-full flex items-center justify-between px-2 text-xs">
        <div class="text-[11px] text-outline flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px] text-tertiary">palette</span>
          <span>Freeform creative expression. Private to your account.</span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button"
            onclick="window.inkstormInstance?.downloadArtwork()"
            class="px-3 py-1.5 rounded-full border border-surface-container bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>Export</span>
          </button>

          <button 
            type="button"
            onclick="window.inkstormInstance?.saveArtworkPrivately()"
            class="px-4 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">lock</span>
            <span>Save Privately</span>
          </button>
        </div>
      </div>

    </div>
  `;
}

export class InkstormController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.currentColor = '#006191';
    this.brushSize = 14;
    this.isEraser = false;
    this.strokesCount = 0;
    this.history = [];
    this.redoStack = [];
  }

  init() {
    window.inkstormInstance = this;
    this.canvas = document.getElementById('inkstorm-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    this.renderStormyInitialCanvas();
    this.saveSnapshot();
    this.attachEvents();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  renderStormyInitialCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Atmospheric stormy backdrop: dark cloudy mist
    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Soft misty clouds to transform into serene landscape
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 6; i++) {
      this.ctx.beginPath();
      this.ctx.arc(w * (0.2 + i * 0.15), h * 0.45, 60 + i * 10, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  setColor(hex) {
    this.currentColor = hex;
    this.isEraser = false;
    const eraserBtn = document.getElementById('ink-eraser-btn');
    if (eraserBtn) eraserBtn.classList.remove('bg-primary', 'text-white');

    // Update color selection ring
    const buttons = document.querySelectorAll('#inkstorm-app [aria-label]');
    buttons.forEach(b => {
      if (b.style.backgroundColor && b.style.backgroundColor.toLowerCase() === hex.toLowerCase()) {
        b.classList.add('ring-2', 'ring-primary', 'scale-110');
      } else {
        b.classList.remove('ring-2', 'ring-primary', 'scale-110');
      }
    });
  }

  setBrushSize(val) {
    this.brushSize = parseInt(val, 10) || 14;
  }

  toggleEraser() {
    this.isEraser = !this.isEraser;
    const eraserBtn = document.getElementById('ink-eraser-btn');
    if (eraserBtn) {
      if (this.isEraser) {
        eraserBtn.classList.add('bg-primary', 'text-white');
      } else {
        eraserBtn.classList.remove('bg-primary', 'text-white');
      }
    }
  }

  attachEvents() {
    let lastX = 0;
    let lastY = 0;

    const startDraw = (e) => {
      this.isDrawing = true;
      const pos = this.getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      this.drawInkPoint(pos.x, pos.y, e.pressure || 0.5);
    };

    const drawMove = (e) => {
      if (!this.isDrawing) return;
      const pos = this.getPos(e);
      const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.6;
      this.drawInkLine(lastX, lastY, pos.x, pos.y, pressure);
      lastX = pos.x;
      lastY = pos.y;
    };

    const stopDraw = () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.strokesCount++;
        this.sessionManager.recordEvent('strokesCount', 1);
        this.saveSnapshot();
      }
    };

    this.canvas.addEventListener('pointerdown', startDraw);
    this.canvas.addEventListener('pointermove', drawMove);
    window.addEventListener('pointerup', stopDraw);
    window.addEventListener('pointercancel', stopDraw);
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  drawInkPoint(x, y, pressure) {
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const radius = Math.max(2, (this.brushSize * pressure) / 2);

    if (this.isEraser) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = this.currentColor;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawInkLine(x1, y1, x2, y2, pressure) {
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const width = Math.max(2, this.brushSize * pressure);

    if (this.isEraser) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = width * 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = width;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  saveSnapshot() {
    if (!this.canvas) return;
    const dataUrl = this.canvas.toDataURL();
    this.history.push(dataUrl);
    if (this.history.length > 20) this.history.shift();
    this.redoStack = [];
  }

  undo() {
    if (this.history.length <= 1) return;
    const current = this.history.pop();
    this.redoStack.push(current);
    const prev = this.history[this.history.length - 1];
    this.restoreSnapshot(prev);
    audioSynth.playWaterRipple();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const next = this.redoStack.pop();
    this.history.push(next);
    this.restoreSnapshot(next);
    audioSynth.playWaterRipple();
  }

  restoreSnapshot(dataUrl) {
    const img = new Image();
    img.onload = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);
      this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = dataUrl;
  }

  clearCanvas() {
    if (confirm('Clear the canvas? You can undo if needed.')) {
      const rect = this.canvas.getBoundingClientRect();
      this.renderStormyInitialCanvas();
      this.saveSnapshot();
      audioSynth.playWaterRipple();
    }
  }

  downloadArtwork() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `calmpop-inkstorm-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
    window.showToast?.('Artwork exported to your device.', 'download');
  }

  async saveArtworkPrivately() {
    if (!this.canvas) return;
    const dataUrl = this.canvas.toDataURL('image/png');
    await PrivateStorageManager.savePrivateItem('inkstorm_art', {
      imageData: dataUrl,
      strokes: this.strokesCount,
      timestamp: Date.now()
    });
    audioSynth.playSuccessChime();
    window.showToast?.('Artwork saved privately to your CalmPop account.', 'lock');
  }

  destroy() {}
}
