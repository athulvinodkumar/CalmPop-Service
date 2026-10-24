// CalmPop - Game 6: Emotion Weather Report
// Build a personal weather landscape with fog, sunshine, wind, rain, and clouds,
// context tags, and private notes. Displays neutral descriptions without moralizing or stereotyping emotions.

import { PrivateStorageManager } from '../privateStorage.js';
import { audioSynth } from '../audioSynth.js';

const WEATHER_ELEMENTS = [
  { id: 'sunshine', label: 'Sunshine', icon: 'wb_sunny', desc: 'Warm, clear illumination', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'clouds', label: 'Clouds', icon: 'cloud', desc: 'Gentle, drifting cloud cover', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { id: 'rain', label: 'Rain', icon: 'rainy', desc: 'Soft, steady rainfall', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'wind', label: 'Wind', icon: 'air', desc: 'Active, breezy air currents', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { id: 'fog', label: 'Fog', icon: 'foggy', desc: 'Quiet, enveloping mist', color: 'text-slate-400', bg: 'bg-slate-400/10' }
];

const CONTEXT_TAGS = [
  'Workload Pacing', 'Sleep & Rest', 'Team Dynamics', 'Personal Life',
  'Deadlines & Focus', 'Creative Energy', 'Physical Energy', 'Transitions'
];

export function renderEmotionWeather(sessionManager) {
  return `
    <div id="emotion-weather-app" class="w-full max-w-xl mx-auto space-y-4">
      
      <!-- WEATHER ELEMENT SELECTION TILES -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-on-surface">1. Choose weather elements present right now:</span>
          <span class="text-outline text-[11px]">Select any that resonate</span>
        </div>
        <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
          ${WEATHER_ELEMENTS.map(el => `
            <button 
              type="button" 
              id="ew-btn-${el.id}"
              onclick="window.emotionWeatherInstance?.toggleElement('${el.id}')"
              class="p-2 sm:p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container/70 flex flex-col items-center gap-1 transition-all"
            >
              <span class="material-symbols-outlined text-[24px] ${el.color}">${el.icon}</span>
              <span class="text-[10px] font-bold text-on-surface">${el.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- INTERACTIVE WEATHER SCENE CANVAS / PREVIEW -->
      <div class="relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 flex items-center justify-center transition-all duration-700" id="ew-sky-backdrop">
        
        <!-- Sun layer -->
        <div id="ew-layer-sunshine" class="absolute top-4 right-6 w-20 h-20 rounded-full bg-amber-400/80 blur-md transition-opacity duration-700 opacity-0 animate-pulse"></div>

        <!-- Clouds layer -->
        <div id="ew-layer-clouds" class="absolute top-8 inset-x-8 flex justify-around transition-opacity duration-700 opacity-0 pointer-events-none">
          <span class="material-symbols-outlined text-white/90 text-[64px] drop-shadow-md">cloud</span>
          <span class="material-symbols-outlined text-white/80 text-[48px] drop-shadow-md mt-2">cloud</span>
        </div>

        <!-- Rain layer -->
        <div id="ew-layer-rain" class="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] transition-opacity duration-700 opacity-0 pointer-events-none flex items-center justify-around">
          <span class="material-symbols-outlined text-blue-400/70 text-[32px] animate-bounce">grain</span>
          <span class="material-symbols-outlined text-blue-400/70 text-[32px] animate-bounce delay-100">grain</span>
          <span class="material-symbols-outlined text-blue-400/70 text-[32px] animate-bounce delay-200">grain</span>
        </div>

        <!-- Wind layer -->
        <div id="ew-layer-wind" class="absolute inset-0 flex items-center justify-center transition-opacity duration-700 opacity-0 pointer-events-none">
          <span class="material-symbols-outlined text-teal-600/50 text-[56px] animate-spin" style="animation-duration: 8s;">air</span>
        </div>

        <!-- Fog layer -->
        <div id="ew-layer-fog" class="absolute inset-0 bg-slate-200/50 backdrop-blur-sm transition-opacity duration-700 opacity-0 pointer-events-none"></div>

        <!-- Rolling hills base -->
        <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-emerald-600 to-emerald-400/80 rounded-t-[50%] opacity-80"></div>

        <!-- Neutral Scene Summary Tag -->
        <div class="relative z-10 bg-surface-container-lowest/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-surface-container shadow-xs text-center max-w-sm">
          <p id="ew-summary-text" class="text-xs font-semibold text-on-surface">
            Select elements to observe your landscape.
          </p>
        </div>

      </div>

      <!-- CONTEXT TAGS SELECTION -->
      <div class="space-y-1.5">
        <span class="text-xs font-bold text-on-surface block">2. Optional Context Tags:</span>
        <div class="flex flex-wrap gap-1.5">
          ${CONTEXT_TAGS.map(tag => `
            <button 
              type="button" 
              onclick="window.emotionWeatherInstance?.toggleTag('${tag}', this)"
              class="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container/60 text-[11px] font-medium text-on-surface-variant transition-all"
            >
              ${tag}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- PRIVATE NOTE TEXTAREA -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <label for="ew-private-note" class="font-bold text-on-surface">3. Optional Private Note:</label>
          <span class="text-[10px] text-outline flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-tertiary">lock</span>
            <span>Private & never sent to analytics</span>
          </span>
        </div>
        <textarea 
          id="ew-private-note" 
          rows="2" 
          placeholder="Any personal observations about today's climate? (e.g., Heavy meetings today, but looking forward to quiet evening...)"
          class="w-full p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        ></textarea>
      </div>

      <!-- SAVE / DISCARD ACTIONS -->
      <div class="pt-2 flex items-center justify-between gap-3 border-t border-surface-container/60">
        <button 
          type="button" 
          onclick="window.emotionWeatherInstance?.discardReport()"
          class="px-4 py-2 rounded-full text-xs font-semibold text-outline hover:text-error transition-all"
        >
          Discard
        </button>

        <button 
          type="button" 
          onclick="window.emotionWeatherInstance?.saveReport()"
          class="px-6 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[16px]">check</span>
          <span>Save Scene Privately</span>
        </button>
      </div>

    </div>
  `;
}

export class EmotionWeatherController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.selectedElements = new Set();
    this.selectedTags = new Set();
  }

  init() {
    window.emotionWeatherInstance = this;
    this.updateScene();
  }

  toggleElement(id) {
    if (this.selectedElements.has(id)) {
      this.selectedElements.delete(id);
    } else {
      this.selectedElements.add(id);
    }

    const btn = document.getElementById(`ew-btn-${id}`);
    if (btn) {
      if (this.selectedElements.has(id)) {
        btn.classList.add('bg-primary/15', 'border-primary', 'shadow-xs');
      } else {
        btn.classList.remove('bg-primary/15', 'border-primary', 'shadow-xs');
      }
    }

    audioSynth.playPop();
    this.sessionManager.recordEvent('weatherElementsCount', this.selectedElements.size);
    this.updateScene();
  }

  toggleTag(tag, btn) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
      btn.classList.remove('bg-primary', 'text-white', 'shadow-xs');
    } else {
      this.selectedTags.add(tag);
      btn.classList.add('bg-primary', 'text-white', 'shadow-xs');
    }
    audioSynth.playPop();
  }

  updateScene() {
    WEATHER_ELEMENTS.forEach(el => {
      const layer = document.getElementById(`ew-layer-${el.id}`);
      if (layer) {
        layer.style.opacity = this.selectedElements.has(el.id) ? '1' : '0';
      }
    });

    const backdrop = document.getElementById('ew-sky-backdrop');
    const summary = document.getElementById('ew-summary-text');

    if (this.selectedElements.size === 0) {
      if (summary) summary.textContent = 'Select weather elements above to describe your present atmosphere.';
      if (backdrop) backdrop.className = 'relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 flex items-center justify-center transition-all duration-700';
      return;
    }

    // Compose neutral description based only on factual choices
    const items = Array.from(this.selectedElements).map(id => {
      const found = WEATHER_ELEMENTS.find(w => w.id === id);
      return found?.label.toLowerCase();
    });

    if (summary) {
      summary.textContent = `Current landscape reflects: ${items.join(', ')}. All weather patterns are natural and valid.`;
    }

    // Neutral backdrop adjustment
    if (backdrop) {
      if (this.selectedElements.has('rain') || this.selectedElements.has('fog')) {
        backdrop.className = 'relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-gradient-to-b from-slate-400 via-slate-300 to-emerald-100 flex items-center justify-center transition-all duration-700';
      } else if (this.selectedElements.has('sunshine')) {
        backdrop.className = 'relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-gradient-to-b from-amber-200 via-sky-100 to-emerald-100 flex items-center justify-center transition-all duration-700';
      } else {
        backdrop.className = 'relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden border border-surface-container shadow-inner bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 flex items-center justify-center transition-all duration-700';
      }
    }
  }

  async saveReport() {
    const noteInput = document.getElementById('ew-private-note');
    const privateNote = noteInput?.value.trim() || '';

    await PrivateStorageManager.savePrivateItem('weather_report', {
      elements: Array.from(this.selectedElements),
      tags: Array.from(this.selectedTags),
      privateNote: privateNote,
      recordedAt: new Date().toISOString()
    });

    audioSynth.playSuccessChime();
    window.showToast?.('Weather scene saved privately.', 'lock');
    this.sessionManager.complete();
  }

  discardReport() {
    if (confirm('Discard this weather report?')) {
      this.sessionManager.earlyExit();
      window.navigateView?.('employee', 'games');
    }
  }

  destroy() {}
}
