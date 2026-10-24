// CalmPop - Game 11: Worry Balloon Release
// Categorize a worry into one of 4 grounded perspectives, optionally write private thought,
// animate drifting balloon into sky, and provide save/discard controls with zero analytics leaks.

import { PrivateStorageManager } from '../privateStorage.js';
import { audioSynth } from '../audioSynth.js';

const WORRY_CATEGORIES = [
  {
    id: 'can_act',
    title: 'Something I can act on',
    desc: 'Tangible steps exist that I can take when I am ready.',
    icon: 'build_circle',
    color: 'text-emerald-500',
    balloonColor: '#10b981',
    guidance: 'Action brings clarity. What is one small, manageable step you might take later?'
  },
  {
    id: 'revisit_later',
    title: 'Something I can revisit later',
    desc: 'Not urgent right now; better addressed at a scheduled, calm time.',
    icon: 'schedule',
    color: 'text-amber-500',
    balloonColor: '#f59e0b',
    guidance: 'Set this aside for now. You can return to it when you have more energy or time.'
  },
  {
    id: 'cannot_control',
    title: 'Something I cannot control right now',
    desc: 'External circumstances, others’ actions, or past events.',
    icon: 'cloud_off',
    color: 'text-sky-500',
    balloonColor: '#0ea5e9',
    guidance: 'Notice the urge to solve it, and gently release the burden of controlling what cannot be controlled.'
  },
  {
    id: 'discuss_someone',
    title: 'Something I may want to discuss with someone',
    desc: 'Would benefit from a second perspective, collaboration, or support.',
    icon: 'chat',
    color: 'text-violet-500',
    balloonColor: '#8b5cf6',
    guidance: 'You don’t have to carry this alone. Who is a supportive person you could talk to?'
  }
];

export function renderWorryBalloon(sessionManager) {
  return `
    <div id="worry-balloon-app" class="w-full max-w-xl mx-auto space-y-4">
      
      <!-- STAGE 1: CATEGORIZE & WRITE WORRY -->
      <div id="wb-stage-create" class="space-y-4">
        
        <div class="space-y-1">
          <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Worry Balloon Reflection</h2>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Sort a current concern into a grounded category. Releasing the balloon is a symbolic moment of pause, not a guarantee that life’s challenges vanish.
          </p>
        </div>

        <!-- 4 CATEGORY TILES -->
        <div class="space-y-1.5">
          <span class="text-[11px] font-bold text-on-surface block">1. Select a category for this worry:</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${WORRY_CATEGORIES.map((cat, i) => `
              <button 
                type="button" 
                id="wb-cat-${cat.id}"
                onclick="window.worryBalloonInstance?.selectCategory('${cat.id}')"
                class="p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 text-left flex items-start gap-3 transition-all ${i === 0 ? 'ring-2 ring-primary bg-primary/10' : ''}"
              >
                <span class="material-symbols-outlined text-[24px] ${cat.color} flex-shrink-0 mt-0.5">${cat.icon}</span>
                <div>
                  <h3 class="text-xs font-bold text-on-surface">${cat.title}</h3>
                  <p class="text-[11px] text-outline mt-0.5 leading-snug">${cat.desc}</p>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- GUIDANCE PROMPT -->
        <div id="wb-guidance-card" class="p-3 bg-surface-container-low rounded-2xl border border-surface-container/60 text-xs text-on-surface space-y-0.5">
          <p class="font-bold text-primary">Mindful Reflection:</p>
          <p id="wb-guidance-text" class="text-outline text-[11px]">
            Action brings clarity. What is one small, manageable step you might take later?
          </p>
        </div>

        <!-- OPTIONAL PRIVATE WORRY INPUT -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <label for="wb-worry-input" class="font-bold text-on-surface">2. Optional: Write the worry (kept strictly private):</label>
            <span class="text-[10px] text-outline flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px] text-tertiary">lock</span>
              <span>Zero telemetry</span>
            </span>
          </div>
          <textarea 
            id="wb-worry-input" 
            rows="2" 
            placeholder="e.g., Anxious about the client review tomorrow..."
            class="w-full p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          ></textarea>
        </div>

        <!-- ACTIONS: RELEASE BALLOON, SAVE PRIVATELY, DISCARD -->
        <div class="pt-2 flex flex-col sm:flex-row gap-2">
          <button 
            type="button" 
            onclick="window.worryBalloonInstance?.releaseBalloon()"
            class="flex-1 py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[18px]">airplanemode_active</span>
            <span>Release Balloon into Sky</span>
          </button>
          
          <button 
            type="button" 
            onclick="window.worryBalloonInstance?.discardWorry()"
            class="py-3 px-5 rounded-full border border-surface-container bg-surface-container-low text-xs font-semibold text-outline hover:text-error transition-all"
          >
            Discard
          </button>
        </div>

      </div>

      <!-- STAGE 2: BALLOON RELEASE ANIMATION VIEWPORT -->
      <div id="wb-stage-animation" class="hidden relative w-full h-[380px] rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-gradient-to-b from-indigo-900 via-sky-800 to-amber-700/80 flex flex-col items-center justify-center">
        
        <!-- Twinkling stars in twilight sky -->
        <div class="absolute inset-0 pointer-events-none opacity-40">
          <div class="absolute top-6 left-12 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          <div class="absolute top-14 right-20 w-1 h-1 bg-white rounded-full"></div>
          <div class="absolute top-28 left-1/3 w-1.5 h-1.5 bg-amber-200 rounded-full animate-pulse"></div>
        </div>

        <!-- Hot Air / Helium Balloon SVG -->
        <div id="wb-floating-balloon" class="relative transition-all duration-1000 flex flex-col items-center">
          
          <svg viewBox="0 0 120 160" class="w-28 h-36 sm:w-32 sm:h-40 overflow-visible drop-shadow-lg">
            <!-- Balloon Envelope -->
            <path id="wb-balloon-path" d="M 60 10 C 25 10 15 50 35 90 C 45 110 55 120 60 125 C 65 120 75 110 85 90 C 105 50 95 10 60 10 Z" fill="#10b981" />
            <!-- Basket Tethers -->
            <line x1="45" y1="125" x2="52" y2="140" stroke="#f1f5f9" stroke-width="1.5" />
            <line x1="75" y1="125" x2="68" y2="140" stroke="#f1f5f9" stroke-width="1.5" />
            <!-- Small Basket -->
            <rect x="50" y="140" width="20" height="14" rx="3" fill="#d97706" />
          </svg>

          <!-- Label on Balloon -->
          <div id="wb-balloon-tag" class="mt-2 bg-surface-container-lowest/85 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 text-center shadow-md">
            <span id="wb-balloon-label" class="text-[11px] font-bold text-on-surface">Something I can act on</span>
          </div>

        </div>

        <!-- Status message -->
        <div class="absolute bottom-4 inset-x-4 text-center">
          <p id="wb-drift-status" class="text-xs text-white/90 font-medium tracking-wide">
            Gently letting go... Drifting into the open sky.
          </p>
        </div>

      </div>

      <!-- STAGE 3: REFLECTIVE COMPLETION -->
      <div id="wb-stage-success" class="hidden space-y-4 text-center py-4">
        <div class="w-14 h-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
          <span class="material-symbols-outlined text-[32px]">wb_cloudy</span>
        </div>

        <div class="space-y-1">
          <h3 class="font-headline-sm text-lg font-bold text-on-surface">Balloon Released</h3>
          <p class="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            You acknowledged this worry with perspective. Life moves in cycles, and you gave yourself a mindful pause.
          </p>
        </div>

        <div class="flex gap-2 justify-center pt-2 max-w-sm mx-auto">
          <button 
            type="button" 
            onclick="window.worryBalloonInstance?.reset()"
            class="flex-1 py-2.5 rounded-full border border-surface-container bg-surface-container-low text-xs font-semibold text-on-surface"
          >
            Release Another
          </button>
          <button 
            type="button" 
            onclick="window.worryBalloonInstance?.savePrivatelyAndExit()"
            class="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs"
          >
            Save Privately & Exit
          </button>
        </div>
      </div>

    </div>
  `;
}

export class WorryBalloonController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.selectedCatId = 'can_act';
    this.worryText = '';
  }

  init() {
    window.worryBalloonInstance = this;
    this.updateCategoryDisplay();
  }

  selectCategory(catId) {
    this.selectedCatId = catId;
    this.sessionManager.recordEvent('worryCategory', catId);

    WORRY_CATEGORIES.forEach(c => {
      const btn = document.getElementById(`wb-cat-${c.id}`);
      if (btn) {
        if (c.id === catId) {
          btn.className = 'p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 text-left flex items-start gap-3 transition-all ring-2 ring-primary bg-primary/10';
        } else {
          btn.className = 'p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 text-left flex items-start gap-3 transition-all';
        }
      }
    });

    audioSynth.playPop();
    this.updateCategoryDisplay();
  }

  updateCategoryDisplay() {
    const cat = WORRY_CATEGORIES.find(c => c.id === this.selectedCatId);
    if (!cat) return;

    const guidance = document.getElementById('wb-guidance-text');
    if (guidance) guidance.textContent = cat.guidance;
  }

  releaseBalloon() {
    const input = document.getElementById('wb-worry-input');
    this.worryText = input?.value.trim() || '';

    const cat = WORRY_CATEGORIES.find(c => c.id === this.selectedCatId);

    // Switch to animation stage
    document.getElementById('wb-stage-create')?.classList.add('hidden');
    const anim = document.getElementById('wb-stage-animation');
    if (anim) anim.classList.remove('hidden');

    const path = document.getElementById('wb-balloon-path');
    if (path && cat) path.setAttribute('fill', cat.balloonColor);

    const label = document.getElementById('wb-balloon-label');
    if (label && cat) label.textContent = cat.title;

    const balloonEl = document.getElementById('wb-floating-balloon');
    if (balloonEl) {
      balloonEl.style.transition = 'none';
      balloonEl.style.transform = 'translateY(80px) scale(0.9)';
      balloonEl.style.opacity = '1';

      audioSynth.playWaterRipple();

      // Launch balloon smoothly into twilight sky
      setTimeout(() => {
        audioSynth.playChime(523.25);
        balloonEl.style.transition = 'all 3.5s cubic-bezier(0.2, 0.7, 0.2, 1)';
        balloonEl.style.transform = 'translateY(-240px) scale(0.35) rotate(-6deg)';
        balloonEl.style.opacity = '0';
      }, 300);
    }

    setTimeout(() => {
      anim?.classList.add('hidden');
      const succ = document.getElementById('wb-stage-success');
      if (succ) succ.classList.remove('hidden');
      audioSynth.playSuccessChime();
    }, 4200);
  }

  reset() {
    document.getElementById('wb-stage-success')?.classList.add('hidden');
    document.getElementById('wb-stage-animation')?.classList.add('hidden');
    document.getElementById('wb-stage-create')?.classList.remove('hidden');
  }

  async savePrivatelyAndExit() {
    await PrivateStorageManager.savePrivateItem('worry_balloon', {
      category: this.selectedCatId,
      worryText: this.worryText,
      releasedAt: new Date().toISOString()
    });

    window.showToast?.('Reflection saved privately.', 'lock');
    this.sessionManager.complete();
  }

  discardWorry() {
    if (confirm('Discard this worry reflection?')) {
      this.sessionManager.earlyExit();
      window.navigateView?.('employee', 'games');
    }
  }

  destroy() {}
}
