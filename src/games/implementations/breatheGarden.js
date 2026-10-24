// CalmPop - Game 1: Breathe Garden
// Guided breathing experience (4s inhale, 6s exhale, no breath-holding)
// with expanding luminous orb, unfurling leaves, blooming flowers, and fireflies.

import { audioSynth } from '../audioSynth.js';

export function renderBreatheGarden(sessionManager, initialSettings = {}) {
  const isGuided = initialSettings.guided !== false;
  
  return `
    <div id="breathe-garden-app" class="w-full flex flex-col items-center justify-center max-w-xl mx-auto space-y-6 text-center select-none">
      
      <!-- GUIDED / UNGUIDED MODE TOGGLE -->
      <div class="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container text-xs">
        <span class="text-outline text-[11px] font-semibold">Mode:</span>
        <button 
          id="bg-mode-guided-btn"
          type="button" 
          onclick="window.breatheGardenInstance?.setMode(true)"
          class="px-3 py-1 rounded-full text-xs font-semibold transition-all ${isGuided ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
        >
          Guided
        </button>
        <button 
          id="bg-mode-unguided-btn"
          type="button" 
          onclick="window.breatheGardenInstance?.setMode(false)"
          class="px-3 py-1 rounded-full text-xs font-semibold transition-all ${!isGuided ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
        >
          Unguided
        </button>
      </div>

      <!-- INSTRUCTION PROMPT DISPLAY -->
      <div class="min-h-[64px] flex flex-col items-center justify-center space-y-1">
        <h2 id="bg-instruction-title" class="font-headline-lg text-2xl sm:text-3xl font-bold text-primary transition-opacity duration-500">
          Breathe in gently.
        </h2>
        <p id="bg-instruction-sub" class="text-xs sm:text-sm text-outline transition-opacity duration-500">
          Follow the light as it expands (4 seconds inhale, 6 seconds exhale)
        </p>
      </div>

      <!-- CENTRAL LUMINOUS GARDEN & ORB SVG CANVAS -->
      <div class="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
        
        <!-- Ambient Garden Background Glow -->
        <div id="bg-garden-glow" class="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/10 via-primary/10 to-lime-400/10 blur-2xl transition-all duration-1000 scale-90"></div>

        <!-- SVG Garden Graphic with Growth & Blooming Stages -->
        <svg id="bg-garden-svg" viewBox="0 0 320 320" class="w-full h-full relative z-10 overflow-visible">
          <defs>
            <!-- Luminous Orb Gradient -->
            <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#18B9ED" stop-opacity="0.95" />
              <stop offset="60%" stop-color="#006191" stop-opacity="0.75" />
              <stop offset="100%" stop-color="#C9F246" stop-opacity="0.2" />
            </radialGradient>
            <!-- Leaf Gradient -->
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C9F246" />
              <stop offset="100%" stop-color="#4e6400" />
            </linearGradient>
            <!-- Petal Gradient -->
            <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#3ac9fe" stop-opacity="0.7" />
            </linearGradient>
            <!-- Glow Filter -->
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Outer Guide Ring -->
          <circle cx="160" cy="160" r="130" fill="none" stroke="#e5e2e1" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.6"/>
          
          <!-- Garden Stem & Vine (Grows with session progress) -->
          <g id="bg-plant-stem" opacity="0.8">
            <path d="M 160 270 Q 155 220 160 160" fill="none" stroke="#4e6400" stroke-width="4" stroke-linecap="round"/>
            <path d="M 160 270 Q 170 230 160 160" fill="none" stroke="#647e00" stroke-width="2.5" stroke-linecap="round"/>
          </g>

          <!-- Lower Leaves (Unfurl with progress) -->
          <g id="bg-plant-leaves" class="transition-transform duration-700">
            <!-- Left Leaf 1 -->
            <path id="leaf-1" d="M 158 230 C 130 220 120 200 135 190 C 150 200 156 220 158 230" fill="url(#leafGrad)" opacity="0.8" transform-origin="158 230"/>
            <!-- Right Leaf 1 -->
            <path id="leaf-2" d="M 162 215 C 190 205 200 185 185 175 C 170 185 164 205 162 215" fill="url(#leafGrad)" opacity="0.8" transform-origin="162 215"/>
            <!-- Left Leaf 2 -->
            <path id="leaf-3" d="M 158 185 C 135 170 125 150 142 145 C 152 155 156 175 158 185" fill="url(#leafGrad)" opacity="0" transform-origin="158 185"/>
            <!-- Right Leaf 2 -->
            <path id="leaf-4" d="M 162 175 C 185 160 195 140 178 135 C 168 145 164 165 162 175" fill="url(#leafGrad)" opacity="0" transform-origin="162 175"/>
          </g>

          <!-- Central Pulsing Luminous Orb (Scales 1.0 -> 1.55 on Inhale, 1.55 -> 1.0 on Exhale) -->
          <circle 
            id="bg-breathing-orb" 
            cx="160" 
            cy="160" 
            r="48" 
            fill="url(#orbGradient)" 
            filter="url(#softGlow)"
            class="transition-all ease-in-out cursor-pointer"
            style="transform-origin: 160px 160px; transform: scale(1);"
          />

          <!-- Orb Inner Core -->
          <circle cx="160" cy="160" r="22" fill="#ffffff" opacity="0.85" filter="url(#softGlow)" pointer-events="none" />

          <!-- Blooming Flower Petals around Orb (Appear as garden transforms) -->
          <g id="bg-flower-petals" opacity="0" class="transition-opacity duration-1000" transform-origin="160 160">
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(0 160 160)"/>
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(45 160 160)"/>
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(90 160 160)"/>
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(135 160 160)"/>
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(180 160 160)"/>
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(225 160 160)"/>
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(270 160 160)"/>
            <ellipse cx="160" cy="100" rx="14" ry="24" fill="url(#petalGrad)" transform="rotate(315 160 160)"/>
          </g>

          <!-- Floating Fireflies (Drift gently) -->
          <g id="bg-fireflies">
            <circle id="ff-1" cx="90" cy="120" r="3" fill="#C9F246" opacity="0" filter="url(#softGlow)"/>
            <circle id="ff-2" cx="240" cy="110" r="2.5" fill="#18B9ED" opacity="0" filter="url(#softGlow)"/>
            <circle id="ff-3" cx="110" cy="220" r="3" fill="#ffffff" opacity="0" filter="url(#softGlow)"/>
            <circle id="ff-4" cx="220" cy="240" r="2.5" fill="#C9F246" opacity="0" filter="url(#softGlow)"/>
            <circle id="ff-5" cx="160" cy="70" r="3.5" fill="#3ac9fe" opacity="0" filter="url(#softGlow)"/>
          </g>
        </svg>

        <!-- Current Cycle Countdown Pill -->
        <div class="absolute bottom-2 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded-full border border-surface-container shadow-xs z-20">
          <span id="bg-phase-seconds" class="font-mono text-xs font-bold text-primary">4s</span>
        </div>
      </div>

      <!-- GENTLE REMINDER CARD -->
      <div class="p-3.5 bg-surface-container-low/70 rounded-2xl border border-surface-container/60 text-xs text-outline max-w-md mx-auto leading-relaxed">
        <p class="flex items-center justify-center gap-1.5 text-on-surface font-semibold mb-0.5">
          <span class="material-symbols-outlined text-primary text-[16px]">info</span>
          <span>Timing cues for natural relaxation</span>
        </p>
        <p>
          You can stop at any time and return to natural breathing if the exercise feels uncomfortable. Prompts are timing cues only and do not measure physiological response.
        </p>
      </div>

      <!-- COMPLETED CYCLES STAT -->
      <div class="text-[11px] text-outline">
        Completed breathing cycles: <span id="bg-completed-cycles" class="font-bold text-on-surface">0</span>
      </div>

    </div>
  `;
}

export class BreatheGardenController {
  constructor(sessionManager, initialSettings = {}) {
    this.sessionManager = sessionManager;
    this.isGuided = initialSettings.guided !== false;
    this.phase = 'inhale'; // 'inhale' (4s) | 'exhale' (6s)
    this.phaseTimeLeft = 4;
    this.cycleCount = 0;
    this.active = false;
    this.loopTimer = null;
    this.tickTimer = null;
  }

  init() {
    window.breatheGardenInstance = this;
    this.startCycle();
  }

  setMode(guided) {
    this.isGuided = guided;
    const guidedBtn = document.getElementById('bg-mode-guided-btn');
    const unguidedBtn = document.getElementById('bg-mode-unguided-btn');
    const title = document.getElementById('bg-instruction-title');
    const sub = document.getElementById('bg-instruction-sub');

    if (guidedBtn && unguidedBtn) {
      if (this.isGuided) {
        guidedBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs';
        unguidedBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
        if (title) title.classList.remove('opacity-0');
        if (sub) sub.classList.remove('opacity-0');
      } else {
        unguidedBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold transition-all bg-primary text-white shadow-xs';
        guidedBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold transition-all text-on-surface-variant hover:text-on-surface';
        if (title) title.classList.add('opacity-0');
        if (sub) sub.classList.add('opacity-0');
      }
    }
  }

  startCycle() {
    this.active = true;
    this.runInhale();
  }

  runInhale() {
    if (!this.active || this.sessionManager.status === 'paused') return;

    this.phase = 'inhale';
    this.phaseTimeLeft = 4;

    const orb = document.getElementById('bg-breathing-orb');
    const title = document.getElementById('bg-instruction-title');
    const sub = document.getElementById('bg-instruction-sub');
    const secBadge = document.getElementById('bg-phase-seconds');

    if (title && this.isGuided) {
      title.textContent = 'Breathe in gently.';
      title.className = 'font-headline-lg text-2xl sm:text-3xl font-bold text-primary transition-opacity duration-500';
    }
    if (sub && this.isGuided) {
      sub.textContent = 'Follow the light as it expands (4 seconds)';
    }

    if (orb) {
      orb.style.transition = 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)';
      orb.style.transform = 'scale(1.55)';
    }

    if (this.isGuided) {
      audioSynth.playBreatheInTone();
    }

    this.startSecondsCountdown(4, () => {
      this.runExhale();
    });
  }

  runExhale() {
    if (!this.active || this.sessionManager.status === 'paused') return;

    this.phase = 'exhale';
    this.phaseTimeLeft = 6;

    const orb = document.getElementById('bg-breathing-orb');
    const title = document.getElementById('bg-instruction-title');
    const sub = document.getElementById('bg-instruction-sub');

    if (title && this.isGuided) {
      title.textContent = 'Breathe out slowly.';
      title.className = 'font-headline-lg text-2xl sm:text-3xl font-bold text-secondary transition-opacity duration-500';
    }
    if (sub && this.isGuided) {
      sub.textContent = 'Release gently as the light contracts (6 seconds)';
    }

    if (orb) {
      orb.style.transition = 'transform 6s cubic-bezier(0.4, 0, 0.2, 1)';
      orb.style.transform = 'scale(1)';
    }

    if (this.isGuided) {
      audioSynth.playBreatheOutTone();
    }

    this.startSecondsCountdown(6, () => {
      this.cycleCount++;
      const cyclesEl = document.getElementById('bg-completed-cycles');
      if (cyclesEl) cyclesEl.textContent = this.cycleCount;

      this.sessionManager.recordEvent('cyclesCompleted', 1);
      this.updateGardenEvolution();

      // Continue next cycle
      this.runInhale();
    });
  }

  startSecondsCountdown(seconds, onFinish) {
    clearInterval(this.tickTimer);
    let s = seconds;
    const secBadge = document.getElementById('bg-phase-seconds');
    if (secBadge) secBadge.textContent = `${s}s`;

    this.tickTimer = setInterval(() => {
      if (this.sessionManager.status === 'paused') return;
      s--;
      if (secBadge && s >= 0) secBadge.textContent = `${s}s`;
      if (s <= 0) {
        clearInterval(this.tickTimer);
        onFinish();
      }
    }, 1000);
  }

  updateGardenEvolution() {
    // Evolve garden visual based on elapsed session duration
    const progress = Math.min(1, this.sessionManager.getTrueElapsedSeconds() / Math.max(1, this.sessionManager.targetDurationSeconds));
    
    // Unfurl higher leaves
    const leaf3 = document.getElementById('leaf-3');
    const leaf4 = document.getElementById('leaf-4');
    if (leaf3 && progress > 0.25) leaf3.setAttribute('opacity', '0.85');
    if (leaf4 && progress > 0.40) leaf4.setAttribute('opacity', '0.85');

    // Bloom petals
    const petals = document.getElementById('bg-flower-petals');
    if (petals && progress > 0.5) {
      petals.style.opacity = String(Math.min(1, (progress - 0.5) * 2));
    }

    // Fireflies appear
    for (let i = 1; i <= 5; i++) {
      const ff = document.getElementById(`ff-${i}`);
      if (ff && progress > (i * 0.15)) {
        ff.setAttribute('opacity', '0.8');
      }
    }

    // Garden glow expands
    const glow = document.getElementById('bg-garden-glow');
    if (glow) {
      glow.style.transform = `scale(${1 + progress * 0.3})`;
    }
  }

  destroy() {
    this.active = false;
    clearInterval(this.tickTimer);
    clearTimeout(this.loopTimer);
  }
}
