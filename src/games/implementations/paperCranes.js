// CalmPop - Game 10: Paper Cranes
// Fold a virtual origami paper crane representing one small, realistic self-care or workday action.
// Animate folding & gentle flight, with optional scheduling and private saving.

import { PrivateStorageManager } from '../privateStorage.js';
import { audioSynth } from '../audioSynth.js';

const CRANE_CATEGORIES = [
  { id: 'small_task', label: 'Start a small task', icon: 'task_alt', examples: ['Draft the outline for tomorrow’s document', 'Reply to one waiting email', 'Organize desktop workspace'] },
  { id: 'take_break', label: 'Take a break', icon: 'coffee', examples: ['Drink a glass of cool water', 'Step outside for 5 minutes of fresh air', 'Stretch shoulders and wrists'] },
  { id: 'ask_help', label: 'Ask for help', icon: 'handshake', examples: ['Ask a teammate for a 10-minute sync', 'Request clarification on project scope', 'Delegate a subtask'] },
  { id: 'prepare_tomorrow', label: 'Prepare for tomorrow', icon: 'event', examples: ['List top 2 priorities for tomorrow morning', 'Close out today’s browser tabs', 'Set out a clean notebook'] },
  { id: 'enjoyable', label: 'Do something enjoyable', icon: 'celebration', examples: ['Listen to a favorite uplifting song', 'Read an interesting article for 10 minutes', 'Send a kind note to a friend'] }
];

const ORIGAMI_PATTERNS = [
  { id: 'cyan_serene', name: 'Sky Cyan', hex: '#18B9ED', bg: 'from-cyan-400 to-blue-500' },
  { id: 'lime_spring', name: 'Meadow Lime', hex: '#C9F246', bg: 'from-lime-300 to-emerald-500' },
  { id: 'cherry_blossom', name: 'Blossom Rose', hex: '#f472b6', bg: 'from-rose-300 to-pink-500' },
  { id: 'twilight_gold', name: 'Sunset Amber', hex: '#fbbf24', bg: 'from-amber-300 to-orange-500' },
  { id: 'lavender_calm', name: 'Lavender Mist', hex: '#a78bfa', bg: 'from-violet-300 to-indigo-500' }
];

export function renderPaperCranes(sessionManager) {
  return `
    <div id="paper-cranes-app" class="w-full max-w-xl mx-auto space-y-4">
      
      <!-- STAGE 1: CHOOSE CATEGORY & ACTION -->
      <div id="pc-stage-create" class="space-y-4">
        
        <div class="space-y-1">
          <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Fold a Paper Crane for One Small Action</h2>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Dedicate an origami crane to one kind, manageable step. No pressure, no obligations.
          </p>
        </div>

        <!-- Category Buttons -->
        <div class="space-y-1.5">
          <span class="text-[11px] font-bold text-on-surface block">1. Select Action Category:</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${CRANE_CATEGORIES.map((cat, i) => `
              <button 
                type="button" 
                id="pc-cat-${cat.id}"
                onclick="window.paperCranesInstance?.selectCategory('${cat.id}')"
                class="p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 text-left flex items-center gap-2.5 transition-all ${i === 0 ? 'ring-2 ring-primary bg-primary/10' : ''}"
              >
                <span class="material-symbols-outlined text-primary text-[20px]">${cat.icon}</span>
                <span class="text-xs font-semibold text-on-surface">${cat.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Example Action Suggestions -->
        <div class="space-y-1">
          <span class="text-[10px] text-outline uppercase font-semibold block">Quick suggestions:</span>
          <div id="pc-suggestions" class="flex flex-wrap gap-1.5">
            <!-- Rendered based on selected category -->
          </div>
        </div>

        <!-- Custom Action Input -->
        <div class="space-y-1">
          <label for="pc-action-input" class="text-[11px] font-semibold text-outline block">Your small action:</label>
          <input 
            id="pc-action-input"
            type="text"
            placeholder="e.g., Drink a warm cup of herbal tea after this call"
            class="w-full p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <!-- Origami Paper Pattern Picker -->
        <div class="space-y-1.5">
          <span class="text-[11px] font-bold text-on-surface block">2. Choose Origami Paper Pattern:</span>
          <div class="flex items-center gap-2.5">
            ${ORIGAMI_PATTERNS.map((p, i) => `
              <button 
                type="button"
                id="pc-pat-${p.id}"
                onclick="window.paperCranesInstance?.selectPattern('${p.id}')"
                class="w-8 h-8 rounded-full border-2 border-white shadow-xs transition-transform hover:scale-115 flex-shrink-0 ${i === 0 ? 'ring-2 ring-primary scale-110' : ''}"
                style="background-color: ${p.hex};"
                title="${p.name}"
              ></button>
            `).join('')}
          </div>
        </div>

        <!-- Fold Button -->
        <div class="pt-2">
          <button 
            type="button"
            onclick="window.paperCranesInstance?.startFoldingAnimation()"
            class="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">folded_hands</span>
            <span>Fold & Release Crane</span>
          </button>
        </div>

      </div>

      <!-- STAGE 2: ORIGAMI FOLDING & FLIGHT ANIMATION -->
      <div id="pc-stage-animation" class="hidden relative w-full h-[360px] rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 flex flex-col items-center justify-center">
        
        <div id="pc-origami-crane" class="relative transition-all duration-1000 flex flex-col items-center justify-center">
          
          <!-- Origami Crane SVG Graphic -->
          <svg viewBox="0 0 160 160" class="w-32 h-32 sm:w-40 sm:h-40 overflow-visible drop-shadow-md">
            <!-- Left Wing -->
            <polygon id="pc-left-wing" points="80,80 10,40 60,95" fill="#18B9ED" class="transition-transform duration-700 origin-center"/>
            <!-- Right Wing -->
            <polygon id="pc-right-wing" points="80,80 150,40 100,95" fill="#006191" class="transition-transform duration-700 origin-center"/>
            <!-- Center Body Fold -->
            <polygon points="80,45 60,95 80,120 100,95" fill="#C9F246" />
            <!-- Head / Beak -->
            <polygon points="80,45 65,30 75,55" fill="#006191" />
            <!-- Tail -->
            <polygon points="80,120 80,145 75,125" fill="#18B9ED" />
          </svg>

          <!-- Crane Action Note Banner Attached to Crane -->
          <div id="pc-crane-banner" class="mt-2 bg-surface-container-lowest/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-surface-container shadow-xs text-center max-w-xs transition-opacity duration-500">
            <span id="pc-banner-text" class="text-xs font-bold text-on-surface">"Drink a warm cup of herbal tea"</span>
          </div>

        </div>

        <!-- Animation Phase Instruction -->
        <div class="absolute bottom-4 inset-x-4 text-center">
          <p id="pc-anim-status" class="text-xs font-semibold text-primary animate-pulse">
            Folding crisp paper creases...
          </p>
        </div>

      </div>

      <!-- STAGE 3: FLIGHT COMPLETION & SCHEDULING (OPTIONAL) -->
      <div id="pc-stage-success" class="hidden space-y-4 text-center py-4">
        <div class="w-14 h-14 rounded-3xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center mx-auto shadow-xs">
          <span class="material-symbols-outlined text-[32px]">flutter</span>
        </div>

        <div class="space-y-1">
          <h3 class="font-headline-sm text-lg font-bold text-on-surface">Your Paper Crane Took Flight</h3>
          <p class="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            It carries your small action peacefully into the sky. No pressure, you can take this step whenever you are ready.
          </p>
        </div>

        <div class="p-4 bg-surface-container-low rounded-2xl border border-surface-container text-xs text-left max-w-md mx-auto space-y-3">
          <div>
            <span class="text-[10px] text-outline uppercase font-bold block">Your Action:</span>
            <p id="pc-final-action-text" class="font-bold text-on-surface mt-0.5 text-sm"></p>
          </div>

          <!-- Optional Scheduling Toggle -->
          <div class="pt-2 border-t border-surface-container/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-on-surface">Optional reminder for later:</span>
              <span class="text-[10px] text-outline">Optional</span>
            </div>
            <div class="flex items-center gap-2">
              <input 
                id="pc-schedule-time" 
                type="time" 
                class="p-2 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none"
              />
              <span class="text-[11px] text-outline">or whenever you take your next break</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-center pt-2 max-w-md mx-auto">
          <button 
            type="button" 
            onclick="window.paperCranesInstance?.resetCreate()"
            class="flex-1 py-2.5 rounded-full border border-surface-container bg-surface-container-low text-xs font-semibold text-on-surface"
          >
            Fold Another Crane
          </button>
          <button 
            type="button" 
            onclick="window.paperCranesInstance?.finishSession()"
            class="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs"
          >
            Save Privately & Exit
          </button>
        </div>

      </div>

    </div>
  `;
}

export class PaperCranesController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.selectedCatId = 'small_task';
    this.selectedPatternId = 'cyan_serene';
    this.actionText = '';
  }

  init() {
    window.paperCranesInstance = this;
    this.renderSuggestions();
  }

  selectCategory(catId) {
    this.selectedCatId = catId;
    this.sessionManager.recordEvent('craneActionCategory', catId);

    CRANE_CATEGORIES.forEach(c => {
      const btn = document.getElementById(`pc-cat-${c.id}`);
      if (btn) {
        if (c.id === catId) {
          btn.className = 'p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 text-left flex items-center gap-2.5 transition-all ring-2 ring-primary bg-primary/10';
        } else {
          btn.className = 'p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 text-left flex items-center gap-2.5 transition-all';
        }
      }
    });

    audioSynth.playPop();
    this.renderSuggestions();
  }

  renderSuggestions() {
    const container = document.getElementById('pc-suggestions');
    if (!container) return;

    const cat = CRANE_CATEGORIES.find(c => c.id === this.selectedCatId);
    if (!cat) return;

    container.innerHTML = cat.examples.map(ex => `
      <button 
        type="button" 
        onclick="window.paperCranesInstance?.pickSuggestion('${ex.replace(/'/g, "\\'")}')"
        class="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface-variant transition-all border border-surface-container/60"
      >
        "${ex}"
      </button>
    `).join('');
  }

  pickSuggestion(text) {
    const input = document.getElementById('pc-action-input');
    if (input) input.value = text;
    audioSynth.playPop();
  }

  selectPattern(patId) {
    this.selectedPatternId = patId;
    this.sessionManager.recordEvent('origamiPattern', patId);

    ORIGAMI_PATTERNS.forEach(p => {
      const btn = document.getElementById(`pc-pat-${p.id}`);
      if (btn) {
        if (p.id === patId) {
          btn.classList.add('ring-2', 'ring-primary', 'scale-110');
        } else {
          btn.classList.remove('ring-2', 'ring-primary', 'scale-110');
        }
      }
    });
    audioSynth.playPop();
  }

  startFoldingAnimation() {
    const input = document.getElementById('pc-action-input');
    this.actionText = input?.value.trim() || 'Take a refreshing 5-minute pause';

    // Transition to stage 2
    document.getElementById('pc-stage-create')?.classList.add('hidden');
    const animStage = document.getElementById('pc-stage-animation');
    if (animStage) animStage.classList.remove('hidden');

    const bannerText = document.getElementById('pc-banner-text');
    if (bannerText) bannerText.textContent = `"${this.actionText}"`;

    const statusEl = document.getElementById('pc-anim-status');
    const craneEl = document.getElementById('pc-origami-crane');
    const leftWing = document.getElementById('pc-left-wing');
    const rightWing = document.getElementById('pc-right-wing');

    // Color wings with selected pattern
    const pattern = ORIGAMI_PATTERNS.find(p => p.id === this.selectedPatternId);
    if (pattern && leftWing && rightWing) {
      leftWing.setAttribute('fill', pattern.hex);
    }

    // Step 1: Folding rustle sound & paper crease
    audioSynth.playPaperRustle();
    if (statusEl) statusEl.textContent = 'Folding crisp paper creases...';
    if (craneEl) craneEl.style.transform = 'scale(0.85) rotate(-5deg)';

    setTimeout(() => {
      // Step 2: Wings unfold
      audioSynth.playPaperRustle();
      if (statusEl) statusEl.textContent = 'Unfurling origami wings...';
      if (craneEl) craneEl.style.transform = 'scale(1.1) rotate(0deg)';
      if (leftWing) leftWing.style.transform = 'scaleY(1.2)';
      if (rightWing) rightWing.style.transform = 'scaleY(1.2)';
    }, 1200);

    setTimeout(() => {
      // Step 3: Crane takes flight into the sky!
      audioSynth.playChime(600);
      if (statusEl) statusEl.textContent = 'Your crane takes flight into the serene sky!';
      if (craneEl) {
        craneEl.style.transition = 'all 2.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
        craneEl.style.transform = 'translateY(-220px) scale(0.4) rotate(12deg)';
        craneEl.style.opacity = '0';
      }
    }, 2400);

    setTimeout(() => {
      // Step 4: Show success screen
      animStage?.classList.add('hidden');
      const succ = document.getElementById('pc-stage-success');
      if (succ) succ.classList.remove('hidden');
      const actionTxt = document.getElementById('pc-final-action-text');
      if (actionTxt) actionTxt.textContent = `"${this.actionText}"`;
      audioSynth.playSuccessChime();
    }, 4800);
  }

  resetCreate() {
    document.getElementById('pc-stage-success')?.classList.add('hidden');
    document.getElementById('pc-stage-animation')?.classList.add('hidden');
    const create = document.getElementById('pc-stage-create');
    if (create) create.classList.remove('hidden');

    const craneEl = document.getElementById('pc-origami-crane');
    if (craneEl) {
      craneEl.style.transition = 'none';
      craneEl.style.transform = 'none';
      craneEl.style.opacity = '1';
    }
  }

  async finishSession() {
    const timeInput = document.getElementById('pc-schedule-time');
    const scheduledTime = timeInput?.value || null;

    await PrivateStorageManager.savePrivateItem('paper_crane', {
      category: this.selectedCatId,
      action: this.actionText,
      pattern: this.selectedPatternId,
      scheduledTime: scheduledTime,
      createdAt: new Date().toISOString()
    });

    window.showToast?.('Paper crane and action saved privately.', 'lock');
    this.sessionManager.complete();
  }

  destroy() {}
}
