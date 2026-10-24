// CalmPop - Game 2: Focus Flow
// Relaxing, tactile symbol matching puzzle with smooth cascades,
// undo, hints, adjustable complexity, and zero stress timers or failure states.

import { audioSynth } from '../audioSynth.js';

const SYMBOLS = [
  { id: 'lotus', icon: 'spa', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', name: 'Lotus' },
  { id: 'ripple', icon: 'water_drop', color: 'text-cyan-500', bg: 'bg-cyan-50 border-cyan-200', name: 'Water' },
  { id: 'sun', icon: 'wb_sunny', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', name: 'Sunbeam' },
  { id: 'leaf', icon: 'eco', color: 'text-lime-600', bg: 'bg-lime-50 border-lime-200', name: 'Leaf' },
  { id: 'star', icon: 'auto_awesome', color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-200', name: 'Star' },
  { id: 'moon', icon: 'nightlight', color: 'text-violet-500', bg: 'bg-violet-50 border-violet-200', name: 'Moon' }
];

export function renderFocusFlow(sessionManager, initialSettings = {}) {
  const complexity = initialSettings.complexity || 'gentle'; // 'gentle' (4 symbols) | 'engaging' (6 symbols)

  return `
    <div id="focus-flow-app" class="w-full flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 select-none">
      
      <!-- CONTROLS & STATS BAR -->
      <div class="w-full flex flex-wrap items-center justify-between gap-2 px-2">
        
        <!-- Complexity Selector -->
        <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full border border-surface-container text-xs">
          <span class="text-outline text-[11px] font-semibold">Complexity:</span>
          <button 
            type="button" 
            onclick="window.focusFlowInstance?.setComplexity('gentle')" 
            id="ff-c-gentle"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${complexity === 'gentle' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            Gentle (4)
          </button>
          <button 
            type="button" 
            onclick="window.focusFlowInstance?.setComplexity('engaging')" 
            id="ff-c-engaging"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${complexity === 'engaging' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            Engaging (6)
          </button>
        </div>

        <!-- Action Buttons: Hint & Undo -->
        <div class="flex items-center gap-2">
          <button 
            type="button"
            onclick="window.focusFlowInstance?.provideHint()"
            class="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            title="Highlight a possible match"
          >
            <span class="material-symbols-outlined text-amber-500 text-[16px]">lightbulb</span>
            <span>Hint</span>
          </button>

          <button 
            type="button"
            onclick="window.focusFlowInstance?.undoMove()"
            id="ff-undo-btn"
            class="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-40"
            title="Undo previous move"
            disabled
          >
            <span class="material-symbols-outlined text-[16px]">undo</span>
            <span>Undo</span>
          </button>
        </div>

      </div>

      <!-- MAIN PUZZLE GRID (6x6) -->
      <div class="relative p-3 bg-surface-container-low/80 rounded-3xl border border-surface-container/80 shadow-inner">
        <div 
          id="focus-flow-grid" 
          class="grid grid-cols-6 gap-2 sm:gap-2.5 w-72 h-72 sm:w-96 sm:h-96"
        >
          <!-- Grid cells dynamically generated -->
        </div>
      </div>

      <!-- BOTTOM STATS: MOVES & MATCHES (No punishment, purely informational) -->
      <div class="w-full flex items-center justify-between px-3 text-xs text-outline">
        <div>
          Moves: <span id="ff-moves-count" class="font-bold text-on-surface">0</span>
        </div>
        <div class="text-[11px] text-outline text-center flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
          <span>Swap adjacent tiles to line up 3 or more symbols</span>
        </div>
        <div>
          Matches: <span id="ff-matches-count" class="font-bold text-primary">0</span>
        </div>
      </div>

    </div>
  `;
}

export class FocusFlowController {
  constructor(sessionManager, initialSettings = {}) {
    this.sessionManager = sessionManager;
    this.rows = 6;
    this.cols = 6;
    this.complexity = initialSettings.complexity || 'gentle'; // 'gentle' (4 symbols) or 'engaging' (6)
    this.grid = [];
    this.selectedCell = null;
    this.isAnimating = false;
    this.moves = 0;
    this.matches = 0;
    this.history = []; // Array of previous board snapshots for Undo
  }

  init() {
    window.focusFlowInstance = this;
    this.buildBoard();
    this.renderBoard();
  }

  getActiveSymbols() {
    return this.complexity === 'gentle' ? SYMBOLS.slice(0, 4) : SYMBOLS;
  }

  setComplexity(level) {
    if (this.complexity === level) return;
    this.complexity = level;
    this.sessionManager.recordEvent('difficulty', level);

    const bGentle = document.getElementById('ff-c-gentle');
    const bEngaging = document.getElementById('ff-c-engaging');
    if (bGentle && bEngaging) {
      if (level === 'gentle') {
        bGentle.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs';
        bEngaging.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
      } else {
        bEngaging.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs';
        bGentle.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
      }
    }

    this.history = [];
    this.updateUndoButton();
    this.buildBoard();
    this.renderBoard();
  }

  buildBoard() {
    const active = this.getActiveSymbols();
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        let sym;
        do {
          sym = active[Math.floor(Math.random() * active.length)];
        } while (
          (r >= 2 && row[c - 1]?.id === sym.id && row[c - 2]?.id === sym.id) ||
          (r >= 2 && this.grid[r - 1]?.[c]?.id === sym.id && this.grid[r - 2]?.[c]?.id === sym.id)
        );
        row.push(sym);
      }
      this.grid.push(row);
    }
  }

  renderBoard() {
    const container = document.getElementById('focus-flow-grid');
    if (!container) return;

    container.innerHTML = '';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const item = this.grid[r][c];
        const isSelected = this.selectedCell && this.selectedCell.r === r && this.selectedCell.c === c;

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.className = `
          relative rounded-2xl flex items-center justify-center border-2 transition-all duration-200 shadow-xs
          ${item.bg} ${isSelected ? 'ring-4 ring-primary scale-105 z-10' : 'hover:scale-102 hover:shadow-md'}
        `;
        cell.innerHTML = `
          <span class="material-symbols-outlined text-[24px] sm:text-[28px] ${item.color} transition-transform pointer-events-none">
            ${item.icon}
          </span>
        `;

        cell.onclick = () => this.handleCellClick(r, c);
        container.appendChild(cell);
      }
    }
  }

  handleCellClick(r, c) {
    if (this.isAnimating || this.sessionManager.status === 'paused') return;

    if (!this.selectedCell) {
      // First selection
      this.selectedCell = { r, c };
      audioSynth.playPop();
      this.renderBoard();
      return;
    }

    // Second selection
    const prev = this.selectedCell;
    const isAdjacent = (Math.abs(prev.r - r) + Math.abs(prev.c - c)) === 1;

    if (!isAdjacent) {
      // Re-select new cell
      this.selectedCell = { r, c };
      audioSynth.playPop();
      this.renderBoard();
      return;
    }

    // Try swap
    this.selectedCell = null;
    this.executeSwap(prev.r, prev.c, r, c);
  }

  executeSwap(r1, c1, r2, c2) {
    // Save snapshot for undo
    this.pushHistorySnapshot();

    this.isAnimating = true;
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;

    this.moves++;
    const movesEl = document.getElementById('ff-moves-count');
    if (movesEl) movesEl.textContent = this.moves;
    this.sessionManager.recordEvent('moves', 1);

    this.renderBoard();

    // Check matches
    const matches = this.findMatches();
    if (matches.length > 0) {
      audioSynth.playChime(440);
      setTimeout(() => this.processMatches(matches), 250);
    } else {
      // In this relaxing game, we allow moves freely or softly revert
      audioSynth.playWaterRipple();
      this.isAnimating = false;
    }
  }

  findMatches() {
    const matchedCoords = new Set();

    // Horizontal
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 2; c++) {
        const id = this.grid[r][c].id;
        if (this.grid[r][c + 1].id === id && this.grid[r][c + 2].id === id) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r},${c + 1}`);
          matchedCoords.add(`${r},${c + 2}`);
        }
      }
    }

    // Vertical
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 2; r++) {
        const id = this.grid[r][c].id;
        if (this.grid[r + 1][c].id === id && this.grid[r + 2][c].id === id) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r + 1},${c}`);
          matchedCoords.add(`${r + 2},${c}`);
        }
      }
    }

    return Array.from(matchedCoords).map(str => {
      const [r, c] = str.split(',').map(Number);
      return { r, c };
    });
  }

  processMatches(matches) {
    this.matches += matches.length;
    const matchesEl = document.getElementById('ff-matches-count');
    if (matchesEl) matchesEl.textContent = this.matches;
    this.sessionManager.recordEvent('puzzleCompletions', 1);

    // Animate cleared cells
    const active = this.getActiveSymbols();
    matches.forEach(({ r, c }) => {
      this.grid[r][c] = null;
    });

    this.renderBoard();

    // Cascade down
    setTimeout(() => {
      for (let c = 0; c < this.cols; c++) {
        let emptyRow = this.rows - 1;
        for (let r = this.rows - 1; r >= 0; r--) {
          if (this.grid[r][c] !== null) {
            if (emptyRow !== r) {
              this.grid[emptyRow][c] = this.grid[r][c];
              this.grid[r][c] = null;
            }
            emptyRow--;
          }
        }
        // Fill top empty cells with random active symbols
        for (let r = emptyRow; r >= 0; r--) {
          this.grid[r][c] = active[Math.floor(Math.random() * active.length)];
        }
      }

      this.renderBoard();

      // Check cascading combos
      const cascadeMatches = this.findMatches();
      if (cascadeMatches.length > 0) {
        audioSynth.playChime(523.25);
        setTimeout(() => this.processMatches(cascadeMatches), 300);
      } else {
        this.isAnimating = false;
      }
    }, 200);
  }

  provideHint() {
    if (this.isAnimating) return;
    this.sessionManager.recordEvent('hintsUsed', 1);
    audioSynth.playGentleTone(600, 0.4);

    // Look for any potential swap that yields a match
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const directions = [[0, 1], [1, 0]];
        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < this.rows && nc < this.cols) {
            // Test swap
            const t = this.grid[r][c];
            this.grid[r][c] = this.grid[nr][nc];
            this.grid[nr][nc] = t;

            const m = this.findMatches();
            // Swap back
            this.grid[nr][nc] = this.grid[r][c];
            this.grid[r][c] = t;

            if (m.length > 0) {
              this.highlightHintCells(r, c, nr, nc);
              return;
            }
          }
        }
      }
    }
  }

  highlightHintCells(r1, c1, r2, c2) {
    const container = document.getElementById('focus-flow-grid');
    if (!container) return;
    const cells = container.querySelectorAll('button');
    cells.forEach(cell => {
      const cr = Number(cell.dataset.r);
      const cc = Number(cell.dataset.c);
      if ((cr === r1 && cc === c1) || (cr === r2 && cc === c2)) {
        cell.classList.add('ring-4', 'ring-amber-400', 'animate-pulse');
        setTimeout(() => {
          cell.classList.remove('ring-4', 'ring-amber-400', 'animate-pulse');
        }, 1500);
      }
    });
  }

  pushHistorySnapshot() {
    const snapshot = this.grid.map(row => [...row]);
    this.history.push({ grid: snapshot, moves: this.moves, matches: this.matches });
    if (this.history.length > 10) this.history.shift();
    this.updateUndoButton();
  }

  undoMove() {
    if (this.history.length === 0 || this.isAnimating) return;
    const last = this.history.pop();
    this.grid = last.grid.map(row => [...row]);
    this.moves = Math.max(0, this.moves - 1);
    const movesEl = document.getElementById('ff-moves-count');
    if (movesEl) movesEl.textContent = this.moves;

    this.sessionManager.recordEvent('undoCount', 1);
    audioSynth.playWaterRipple();
    this.updateUndoButton();
    this.renderBoard();
  }

  updateUndoButton() {
    const undoBtn = document.getElementById('ff-undo-btn');
    if (undoBtn) {
      undoBtn.disabled = this.history.length === 0;
    }
  }

  destroy() {
    this.grid = [];
  }
}
