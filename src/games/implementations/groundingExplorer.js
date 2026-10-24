// CalmPop - Game 7: Grounding Explorer
// Gentle, self-paced 5-4-3-2-1 sensory grounding exercise in a cozy environment,
// with sensory alternatives, skipping options, and zero device permissions or timed pressure.

import { audioSynth } from '../audioSynth.js';

const GROUNDING_STEPS = [
  {
    step: 5,
    title: '5 Things You Can See',
    prompt: 'Look around your surroundings. Notice 5 distinct colors, patterns, textures, or shapes.',
    icon: 'visibility',
    color: 'text-sky-500',
    suggestions: ['A patch of light on the wall', 'A familiar object on your desk', 'A color that catches your eye', 'The texture of a surface nearby', 'A plant or shadow outside'],
    alternative: 'Alternative: Visualize 5 soothing places you have visited or imagined.'
  },
  {
    step: 4,
    title: '4 Things You Can Feel',
    prompt: 'Notice 4 physical textures or points of contact supporting your body right now.',
    icon: 'touch_app',
    color: 'text-amber-500',
    suggestions: ['The support of your chair beneath you', 'The texture of your clothing', 'Your feet resting firmly on the floor', 'The gentle temperature of the air on your hands'],
    alternative: 'Alternative: Notice 4 comforting physical qualities like warmth, softness, or stability.'
  },
  {
    step: 3,
    title: '3 Things You Can Hear',
    prompt: 'Pause and listen closely. What 3 subtle sounds are present in your environment?',
    icon: 'hearing',
    color: 'text-indigo-500',
    suggestions: ['The soft hum of a computer or ventilation', 'Distant birds or street sounds outside', 'The quiet rhythm of your own breath'],
    alternative: 'Alternative: Recall 3 gentle sounds you find reassuring, like falling rain or ocean waves.'
  },
  {
    step: 2,
    title: '2 Things You Can Smell',
    prompt: 'Gently breathe in. Can you perceive 2 subtle scents around you?',
    icon: 'scents',
    color: 'text-teal-500',
    suggestions: ['The aroma of tea, coffee, or fresh water', 'Clean air or crisp paper nearby'],
    alternative: 'Alternative: Bring to mind 2 favorite comforting scents, such as pine, lavender, or citrus.'
  },
  {
    step: 1,
    title: '1 Thing You Can Taste or Appreciate',
    prompt: 'Notice any lingering taste, or simply acknowledge 1 kind observation about this present moment.',
    icon: 'sentiment_satisfied',
    color: 'text-rose-500',
    suggestions: ['A sip of water or lingering mint', 'A quiet moment of appreciation for taking this pause'],
    alternative: 'Alternative: Name 1 kind thought toward yourself for taking this mindful reset.'
  }
];

export function renderGroundingExplorer(sessionManager) {
  return `
    <div id="grounding-explorer-app" class="w-full max-w-xl mx-auto space-y-4 select-none">
      
      <!-- STEP HEADER & SENSORY NAVIGATION TABS -->
      <div class="flex items-center justify-between text-xs px-1">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <span id="ge-step-title" class="font-bold text-on-surface">5-4-3-2-1 Sensory Grounding</span>
        </div>
        <div class="flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-full border border-surface-container">
          ${[5, 4, 3, 2, 1].map(num => `
            <button 
              type="button" 
              id="ge-tab-${num}"
              onclick="window.groundingInstance?.goToStep(${num})"
              class="w-6 h-6 rounded-full text-[11px] font-bold transition-all ${num === 5 ? 'bg-primary text-white shadow-xs' : 'text-outline hover:text-on-surface'}"
            >
              ${num}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- MAIN SENSORY CARD -->
      <div class="bg-surface-container-low/70 rounded-3xl p-6 sm:p-7 border border-surface-container shadow-xs min-h-[350px] flex flex-col justify-between space-y-4">
        
        <div class="space-y-4">
          
          <!-- Category Header -->
          <div class="flex items-center gap-3">
            <div id="ge-icon-wrap" class="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
              <span id="ge-icon" class="material-symbols-outlined text-[26px]">visibility</span>
            </div>
            <div>
              <h2 id="ge-step-heading" class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                5 Things You Can See
              </h2>
              <p id="ge-step-sub" class="text-xs text-on-surface-variant leading-relaxed">
                Look around your surroundings. Notice 5 distinct colors, patterns, textures, or shapes.
              </p>
            </div>
          </div>

          <!-- Interactive Sensory Observation Checklist (5 clickable items) -->
          <div class="space-y-2" id="ge-checklist-container">
            <!-- Rendered dynamically -->
          </div>

          <!-- Accessible Alternative Banner -->
          <div class="p-3 bg-surface-container-lowest rounded-2xl border border-surface-container/60 text-xs text-outline space-y-1">
            <p id="ge-alt-text" class="italic text-[11px] text-on-surface-variant">
              Alternative: Visualize 5 soothing places you have visited or imagined.
            </p>
          </div>

        </div>

        <!-- FOOTER ACTIONS: SKIP STEP, NEXT -->
        <div class="pt-3 border-t border-surface-container flex items-center justify-between gap-3">
          <button 
            type="button" 
            onclick="window.groundingInstance?.skipCurrentCategory()"
            class="px-3 py-1.5 rounded-full text-xs font-medium text-outline hover:text-on-surface transition-all flex items-center gap-1"
          >
            <span>Skip this sense</span>
            <span class="material-symbols-outlined text-[14px]">fast_forward</span>
          </button>

          <button 
            type="button" 
            id="ge-next-btn"
            onclick="window.groundingInstance?.nextStep()"
            class="px-6 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Next Sense</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

      </div>

      <!-- PRESENT MOMENT HELPER -->
      <div class="text-[11px] text-outline text-center flex items-center justify-center gap-1.5">
        <span class="material-symbols-outlined text-[14px] text-tertiary">spa</span>
        <span>Take your time. Grounding brings your awareness gently back to the here and now.</span>
      </div>

    </div>
  `;
}

export class GroundingExplorerController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.stepIndex = 0; // 0 (5) to 4 (1)
    this.checkedItems = {}; // { [stepNum]: Set of indices }
  }

  init() {
    window.groundingInstance = this;
    [5, 4, 3, 2, 1].forEach(n => { this.checkedItems[n] = new Set(); });
    this.renderCurrentStep();
  }

  getCurrentConfig() {
    return GROUNDING_STEPS[this.stepIndex];
  }

  goToStep(num) {
    const idx = GROUNDING_STEPS.findIndex(s => s.step === num);
    if (idx >= 0) {
      this.stepIndex = idx;
      audioSynth.playPop();
      this.renderCurrentStep();
    }
  }

  renderCurrentStep() {
    const config = this.getCurrentConfig();
    const heading = document.getElementById('ge-step-heading');
    const sub = document.getElementById('ge-step-sub');
    const icon = document.getElementById('ge-icon');
    const iconWrap = document.getElementById('ge-icon-wrap');
    const altText = document.getElementById('ge-alt-text');
    const nextBtn = document.getElementById('ge-next-btn');

    if (heading) heading.textContent = config.title;
    if (sub) sub.textContent = config.prompt;
    if (icon) icon.textContent = config.icon;
    if (iconWrap) {
      iconWrap.className = `w-12 h-12 rounded-2xl bg-surface-container ${config.color} flex items-center justify-center flex-shrink-0`;
    }
    if (altText) altText.textContent = config.alternative;

    if (nextBtn) {
      const span = nextBtn.querySelector('span');
      if (span) span.textContent = this.stepIndex === 4 ? 'Complete Grounding' : 'Next Sense';
    }

    // Update tab indicators
    [5, 4, 3, 2, 1].forEach(n => {
      const tab = document.getElementById(`ge-tab-${n}`);
      if (tab) {
        if (n === config.step) {
          tab.className = 'w-6 h-6 rounded-full text-[11px] font-bold transition-all bg-primary text-white shadow-xs';
        } else {
          tab.className = 'w-6 h-6 rounded-full text-[11px] font-bold transition-all text-outline hover:text-on-surface';
        }
      }
    });

    // Render interactive checklist
    const container = document.getElementById('ge-checklist-container');
    if (!container) return;

    container.innerHTML = config.suggestions.map((sug, i) => {
      const isChecked = this.checkedItems[config.step].has(i);
      return `
        <button 
          type="button" 
          onclick="window.groundingInstance?.toggleCheckItem(${config.step}, ${i})"
          class="w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${isChecked ? 'bg-primary/10 border-primary/40 text-on-surface' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container text-on-surface-variant'}"
        >
          <div class="w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${isChecked ? 'bg-primary text-white border-primary' : 'border-outline text-transparent'}">
            <span class="material-symbols-outlined text-[14px]">check</span>
          </div>
          <span class="text-xs font-medium">${sug}</span>
        </button>
      `;
    }).join('');
  }

  toggleCheckItem(stepNum, index) {
    const set = this.checkedItems[stepNum];
    if (set.has(index)) {
      set.delete(index);
    } else {
      set.add(index);
      audioSynth.playChime(523);
    }
    this.renderCurrentStep();
  }

  nextStep() {
    if (this.stepIndex < 4) {
      this.stepIndex++;
      audioSynth.playPop();
      this.renderCurrentStep();
    } else {
      audioSynth.playSuccessChime();
      this.sessionManager.complete();
    }
  }

  skipCurrentCategory() {
    audioSynth.playPop();
    this.nextStep();
  }

  destroy() {}
}
