// CalmPop - Game 9: Memory Meadow
// Nature-themed memory card matching game with gentle animations,
// adjustable card grids, unlimited attempts, and zero penalties or losing screens.

import { audioSynth } from '../audioSynth.js';

const NATURE_CARDS = [
  { id: 'sun', icon: 'wb_sunny', color: 'text-amber-500', name: 'Sunbeam' },
  { id: 'leaf', icon: 'eco', color: 'text-emerald-500', name: 'Fern' },
  { id: 'water', icon: 'water_drop', color: 'text-cyan-500', name: 'Dewdrop' },
  { id: 'flower', icon: 'local_florist', color: 'text-rose-400', name: 'Blossom' },
  { id: 'tree', icon: 'park', color: 'text-teal-600', name: 'Pine' },
  { id: 'bird', icon: 'flutter', color: 'text-sky-500', name: 'Songbird' },
  { id: 'mushroom', icon: 'psychiatry', color: 'text-violet-500', name: 'Fungi' },
  { id: 'mountain', icon: 'landscape', color: 'text-indigo-400', name: 'Crest' }
];

export function renderMemoryMeadow(sessionManager, initialSettings = {}) {
  const diff = initialSettings.difficulty || 'gentle'; // 'gentle' (4 pairs = 8 cards) | 'standard' (6 pairs = 12 cards) | 'engaging' (8 pairs = 16 cards)

  return `
    <div id="memory-meadow-app" class="w-full max-w-xl mx-auto flex flex-col items-center space-y-4 select-none">
      
      <!-- CONTROLS & DIFFICULTY -->
      <div class="w-full flex items-center justify-between text-xs px-2">
        <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full border border-surface-container">
          <span class="text-outline text-[11px] font-semibold">Grid:</span>
          <button 
            type="button" 
            onclick="window.memoryMeadowInstance?.setDifficulty('gentle')" 
            id="mm-d-gentle"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${diff === 'gentle' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            4 Pairs
          </button>
          <button 
            type="button" 
            onclick="window.memoryMeadowInstance?.setDifficulty('standard')" 
            id="mm-d-standard"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${diff === 'standard' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            6 Pairs
          </button>
          <button 
            type="button" 
            onclick="window.memoryMeadowInstance?.setDifficulty('engaging')" 
            id="mm-d-engaging"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${diff === 'engaging' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            8 Pairs
          </button>
        </div>

        <button 
          type="button"
          onclick="window.memoryMeadowInstance?.shuffleBoard()"
          class="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
        >
          <span class="material-symbols-outlined text-[16px]">shuffle</span>
          <span>Reshuffle</span>
        </button>
      </div>

      <!-- MAIN CARD GRID VIEWPORT -->
      <div class="p-4 bg-surface-container-low/80 rounded-3xl border border-surface-container shadow-inner">
        <div id="mm-card-grid" class="grid gap-2.5 sm:gap-3 transition-all">
          <!-- Cards rendered dynamically -->
        </div>
      </div>

      <!-- STATS DISPLAY: PAIRS MATCHED & TURNS (Informational only) -->
      <div class="w-full flex items-center justify-between px-3 text-xs text-outline">
        <div>Turns: <span id="mm-turns-count" class="font-bold text-on-surface">0</span></div>
        <div class="text-[11px] text-center flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px] text-tertiary">spa</span>
          <span>Flip two cards to discover matching pairs. Unlimited tries.</span>
        </div>
        <div>Matched: <span id="mm-matched-count" class="font-bold text-primary">0</span> / <span id="mm-total-pairs">4</span></div>
      </div>

    </div>
  `;
}

export class MemoryMeadowController {
  constructor(sessionManager, initialSettings = {}) {
    this.sessionManager = sessionManager;
    this.difficulty = initialSettings.difficulty || 'gentle'; // 'gentle' | 'standard' | 'engaging'
    this.cards = [];
    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.totalPairs = 4;
    this.turns = 0;
    this.isLocked = false;
  }

  init() {
    window.memoryMeadowInstance = this;
    this.setDifficulty(this.difficulty, true);
  }

  setDifficulty(diff, isInit = false) {
    this.difficulty = diff;
    if (diff === 'gentle') this.totalPairs = 4;
    else if (diff === 'standard') this.totalPairs = 6;
    else if (diff === 'engaging') this.totalPairs = 8;

    this.sessionManager.recordEvent('difficulty', diff);

    ['gentle', 'standard', 'engaging'].forEach(d => {
      const btn = document.getElementById(`mm-d-${d}`);
      if (btn) {
        btn.className = d === diff
          ? 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs'
          : 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
      }
    });

    const totEl = document.getElementById('mm-total-pairs');
    if (totEl) totEl.textContent = this.totalPairs;

    this.shuffleBoard();
  }

  shuffleBoard() {
    this.turns = 0;
    this.matchedPairs = 0;
    this.flippedIndices = [];
    this.isLocked = false;

    const turnsEl = document.getElementById('mm-turns-count');
    const matchedEl = document.getElementById('mm-matched-count');
    if (turnsEl) turnsEl.textContent = '0';
    if (matchedEl) matchedEl.textContent = '0';

    // Pick pairs
    const selected = NATURE_CARDS.slice(0, this.totalPairs);
    const deck = [...selected, ...selected].map((card, idx) => ({
      ...card,
      uniqueId: idx,
      isFlipped: false,
      isMatched: false
    }));

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.cards = deck;
    this.renderGrid();
  }

  renderGrid() {
    const grid = document.getElementById('mm-card-grid');
    if (!grid) return;

    // Adjust grid columns
    if (this.totalPairs === 4) {
      grid.className = 'grid grid-cols-4 gap-2.5 sm:gap-3 w-72 h-44 sm:w-80 sm:h-48';
    } else if (this.totalPairs === 6) {
      grid.className = 'grid grid-cols-4 gap-2.5 sm:gap-3 w-72 h-64 sm:w-88 sm:h-72';
    } else {
      grid.className = 'grid grid-cols-4 gap-2.5 sm:gap-3 w-72 h-80 sm:w-88 sm:h-96';
    }

    grid.innerHTML = this.cards.map((card, idx) => {
      const showFront = card.isFlipped || card.isMatched;

      return `
        <button 
          type="button" 
          onclick="window.memoryMeadowInstance?.flipCard(${idx})"
          class="relative w-full h-full rounded-2xl border-2 transition-all duration-300 flex items-center justify-center shadow-xs ${showFront ? 'bg-surface-container-lowest border-primary/30 rotate-0' : 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-white/40 hover:scale-102 hover:shadow-md'}"
          ${card.isMatched ? 'disabled' : ''}
        >
          ${showFront ? `
            <span class="material-symbols-outlined text-[28px] sm:text-[32px] ${card.color} animate-popIn">
              ${card.icon}
            </span>
          ` : `
            <span class="material-symbols-outlined text-white/60 text-[20px]">
              eco
            </span>
          `}
        </button>
      `;
    }).join('');
  }

  flipCard(idx) {
    if (this.isLocked || this.sessionManager.status === 'paused') return;
    const card = this.cards[idx];
    if (card.isFlipped || card.isMatched) return;

    card.isFlipped = true;
    this.flippedIndices.push(idx);
    audioSynth.playPop();
    this.renderGrid();

    if (this.flippedIndices.length === 2) {
      this.turns++;
      const turnsEl = document.getElementById('mm-turns-count');
      if (turnsEl) turnsEl.textContent = this.turns;
      this.sessionManager.recordEvent('moves', 1);

      this.checkMatch();
    }
  }

  checkMatch() {
    this.isLocked = true;
    const [i1, i2] = this.flippedIndices;
    const c1 = this.cards[i1];
    const c2 = this.cards[i2];

    if (c1.id === c2.id) {
      // Match found!
      setTimeout(() => {
        c1.isMatched = true;
        c2.isMatched = true;
        this.matchedPairs++;
        const matchedEl = document.getElementById('mm-matched-count');
        if (matchedEl) matchedEl.textContent = this.matchedPairs;

        audioSynth.playChime(523.25);
        this.flippedIndices = [];
        this.isLocked = false;
        this.renderGrid();

        if (this.matchedPairs === this.totalPairs) {
          audioSynth.playSuccessChime();
          this.sessionManager.recordEvent('puzzleCompletions', 1);
          setTimeout(() => this.sessionManager.complete(), 800);
        }
      }, 300);
    } else {
      // No match: softly unflip after brief pause
      setTimeout(() => {
        c1.isFlipped = false;
        c2.isFlipped = false;
        this.flippedIndices = [];
        this.isLocked = false;
        this.renderGrid();
      }, 900);
    }
  }

  destroy() {}
}
