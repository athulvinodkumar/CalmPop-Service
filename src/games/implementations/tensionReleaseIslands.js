// CalmPop - Game 8: Tension Release Islands
// Progressive relaxation and gentle body area island-hopping.
// Offers both gentle squeeze-and-release and passive mindful awareness modes,
// with skip options and zero physiological tension claims.

import { audioSynth } from '../audioSynth.js';

const ISLANDS = [
  {
    id: 'hands',
    name: 'Palms & Fingers Haven',
    icon: 'front_hand',
    color: 'text-amber-500',
    bg: 'from-amber-400/20 to-orange-300/10',
    activeInstruction: 'Gently clench both hands into soft fists for 5 seconds... Now release completely, letting your fingers uncurl and rest loose like open blossoms.',
    passiveInstruction: 'Rest your hands on your lap or desk. Simply notice any warmth, cool air, or tingling in the palms without changing anything.'
  },
  {
    id: 'shoulders',
    name: 'Shoulder Sanctuary',
    icon: 'accessibility_new',
    color: 'text-sky-500',
    bg: 'from-sky-400/20 to-cyan-300/10',
    activeInstruction: 'Slowly raise your shoulders up toward your ears for 4 seconds... Now drop them completely down, exhaling and letting gravity support you.',
    passiveInstruction: 'Allow your shoulders to soften away from your ears. Imagine warm sunlight gently warming the tops of your shoulders.'
  },
  {
    id: 'face',
    name: 'Serene Meadow (Face & Jaw)',
    icon: 'face',
    color: 'text-rose-500',
    bg: 'from-rose-400/20 to-pink-300/10',
    activeInstruction: 'Gently scrunch your nose and press your lips together softly for 3 seconds... Now release, letting your jaw unclench and your forehead smooth out.',
    passiveInstruction: 'Let the tongue rest gently away from the roof of the mouth. Allow your brow and the muscles around your eyes to soften like smooth water.'
  },
  {
    id: 'arms',
    name: 'Tranquil Shore (Arms)',
    icon: 'fitness_center',
    color: 'text-indigo-500',
    bg: 'from-indigo-400/20 to-blue-300/10',
    activeInstruction: 'Gently bend your elbows and tighten your forearm muscles for 4 seconds... Now release your arms down, letting them feel pleasantly heavy.',
    passiveInstruction: 'Notice the weight of your arms resting naturally by your side. Let any holding or bracing softly melt away.'
  },
  {
    id: 'legs',
    name: 'Grounded Bay (Legs & Feet)',
    icon: 'nordic_walking',
    color: 'text-emerald-500',
    bg: 'from-emerald-400/20 to-teal-300/10',
    activeInstruction: 'Press your feet gently flat against the floor for 4 seconds... Now relax your calves and thighs, feeling steady ground beneath you.',
    passiveInstruction: 'Sense the firm support of the floor beneath the soles of your feet. Trust the ground to hold you securely in this moment.'
  }
];

export function renderTensionReleaseIslands(sessionManager) {
  return `
    <div id="tension-islands-app" class="w-full max-w-xl mx-auto space-y-4 select-none">
      
      <!-- CONTROLS: PASSIVE VS ACTIVE CONTRACTION MODE -->
      <div class="flex items-center justify-between text-xs px-1">
        <span class="font-bold text-on-surface">Hop between relaxation islands:</span>
        <div class="flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-full border border-surface-container">
          <span class="text-[10px] text-outline font-semibold">Technique:</span>
          <button 
            type="button" 
            id="ti-mode-passive"
            onclick="window.tensionIslandsInstance?.setTechnique('passive')"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs"
          >
            Gentle Awareness
          </button>
          <button 
            type="button" 
            id="ti-mode-active"
            onclick="window.tensionIslandsInstance?.setTechnique('active')"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface"
          >
            Squeeze & Release
          </button>
        </div>
      </div>

      <!-- ISLAND MAP CAROUSEL TILES -->
      <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
        ${ISLANDS.map((island, idx) => `
          <button 
            type="button" 
            id="ti-island-${island.id}"
            onclick="window.tensionIslandsInstance?.selectIsland(${idx})"
            class="p-2 sm:p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 flex flex-col items-center gap-1 transition-all ${idx === 0 ? 'ring-2 ring-primary bg-primary/10' : ''}"
          >
            <span class="material-symbols-outlined text-[24px] ${island.color}">${island.icon}</span>
            <span class="text-[10px] font-bold text-on-surface truncate w-full text-center">${island.id}</span>
          </button>
        `).join('')}
      </div>

      <!-- MAIN ISLAND RELAXATION VIEWPORT -->
      <div id="ti-island-viewport" class="relative bg-gradient-to-tr from-amber-400/20 to-orange-300/10 rounded-3xl p-6 sm:p-8 border border-surface-container shadow-sm min-h-[300px] flex flex-col justify-between space-y-4 transition-all duration-500">
        
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div id="ti-icon-wrap" class="w-12 h-12 rounded-2xl bg-surface-container-lowest text-amber-500 flex items-center justify-center flex-shrink-0 shadow-xs">
              <span id="ti-main-icon" class="material-symbols-outlined text-[28px]">front_hand</span>
            </div>
            <div>
              <span id="ti-island-subtitle" class="text-[10px] uppercase font-bold text-primary tracking-wide">Island 1 of 5</span>
              <h2 id="ti-island-title" class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                Palms & Fingers Haven
              </h2>
            </div>
          </div>

          <!-- Instruction Text Banner -->
          <div class="p-4 sm:p-5 bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl border border-surface-container/70 shadow-xs space-y-2">
            <p id="ti-instruction-text" class="text-xs sm:text-sm text-on-surface leading-relaxed font-medium">
              Rest your hands on your lap or desk. Simply notice any warmth, cool air, or tingling in the palms without changing anything.
            </p>
          </div>
        </div>

        <!-- FOOTER PROGRESSION & SKIP CONTROLS -->
        <div class="pt-3 border-t border-surface-container/60 flex items-center justify-between gap-3">
          <button 
            type="button" 
            onclick="window.tensionIslandsInstance?.skipIsland()"
            class="px-3 py-1.5 rounded-full text-xs font-medium text-outline hover:text-on-surface transition-all flex items-center gap-1"
          >
            <span>Skip this area</span>
            <span class="material-symbols-outlined text-[14px]">fast_forward</span>
          </button>

          <button 
            type="button" 
            id="ti-next-btn"
            onclick="window.tensionIslandsInstance?.nextIsland()"
            class="px-6 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Next Island</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

      </div>

      <!-- SENSORY DISCLAIMER -->
      <div class="text-[11px] text-outline text-center">
        Progressive body relaxation is for gentle comfort. Skip any area that feels uncomfortable.
      </div>

    </div>
  `;
}

export class TensionReleaseIslandsController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.currentIndex = 0;
    this.technique = 'passive'; // 'passive' (awareness) or 'active' (squeeze & release)
  }

  init() {
    window.tensionIslandsInstance = this;
    this.renderIsland();
  }

  setTechnique(mode) {
    this.technique = mode;
    const bPassive = document.getElementById('ti-mode-passive');
    const bActive = document.getElementById('ti-mode-active');
    if (bPassive && bActive) {
      if (mode === 'passive') {
        bPassive.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs';
        bActive.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
      } else {
        bActive.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs';
        bPassive.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
      }
    }
    audioSynth.playPop();
    this.renderIsland();
  }

  selectIsland(idx) {
    this.currentIndex = idx;
    audioSynth.playPop();
    this.renderIsland();
  }

  renderIsland() {
    const island = ISLANDS[this.currentIndex];
    const title = document.getElementById('ti-island-title');
    const sub = document.getElementById('ti-island-subtitle');
    const icon = document.getElementById('ti-main-icon');
    const text = document.getElementById('ti-instruction-text');
    const viewport = document.getElementById('ti-island-viewport');
    const nextBtn = document.getElementById('ti-next-btn');

    if (title) title.textContent = island.name;
    if (sub) sub.textContent = `Island ${this.currentIndex + 1} of 5`;
    if (icon) {
      icon.textContent = island.icon;
      icon.className = `material-symbols-outlined text-[28px] ${island.color}`;
    }
    if (text) {
      text.textContent = this.technique === 'active' ? island.activeInstruction : island.passiveInstruction;
    }
    if (viewport) {
      viewport.className = `relative bg-gradient-to-tr ${island.bg} rounded-3xl p-6 sm:p-8 border border-surface-container shadow-sm min-h-[300px] flex flex-col justify-between space-y-4 transition-all duration-500`;
    }

    if (nextBtn) {
      const span = nextBtn.querySelector('span');
      if (span) span.textContent = this.currentIndex === ISLANDS.length - 1 ? 'Finish Journey' : 'Next Island';
    }

    // Highlight active island icon
    ISLANDS.forEach((isl, i) => {
      const btn = document.getElementById(`ti-island-${isl.id}`);
      if (btn) {
        if (i === this.currentIndex) {
          btn.className = 'p-2 sm:p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 flex flex-col items-center gap-1 transition-all ring-2 ring-primary bg-primary/10';
        } else {
          btn.className = 'p-2 sm:p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 flex flex-col items-center gap-1 transition-all';
        }
      }
    });

    this.sessionManager.recordEvent('islandVisited', island.id);
  }

  nextIsland() {
    if (this.currentIndex < ISLANDS.length - 1) {
      this.currentIndex++;
      audioSynth.playPop();
      this.renderIsland();
    } else {
      audioSynth.playSuccessChime();
      this.sessionManager.complete();
    }
  }

  skipIsland() {
    audioSynth.playWaterRipple();
    this.nextIsland();
  }

  destroy() {}
}
