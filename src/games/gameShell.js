// CalmPop - Common Reusable Game Shell Component
// Provides full-screen or spacious frame, top controls, session timer, progress bar,
// sound mute toggle, pause/resume, exit confirmation, optional check-ins, and completion modal.

import { audioSynth } from './audioSynth.js';

export class GameShell {
  constructor(options = {}) {
    this.containerId = options.containerId || 'game-content-area';
    this.game = options.game; // Game metadata: { id, title, description, typicalDuration, category }
    this.sessionManager = options.sessionManager;
    this.onExit = options.onExit || (() => window.navigateView('employee', 'games'));
    this.durationOptions = options.durationOptions || [120, 180, 300]; // 2m, 3m, 5m
    this.selectedDuration = options.defaultDuration || 180;
    this.supportsDurationConfig = options.supportsDurationConfig !== false;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check-in state
    this.preCheckInDone = false;
  }

  renderShell(gameInnerHtml = '') {
    const isMuted = audioSynth.isMuted;
    const durMinutes = Math.round(this.selectedDuration / 60);

    return `
      <div id="calmpop-game-shell" class="w-full max-w-5xl mx-auto flex flex-col min-h-[80vh] bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm overflow-hidden transition-all duration-300">
        
        <!-- TOP CONTROL BAR -->
        <header class="px-5 py-4 border-b border-surface-container/80 flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/50 backdrop-blur-sm">
          
          <!-- Left: Exit Button & Title Info -->
          <div class="flex items-center gap-3 min-w-0">
            <button 
              id="game-shell-exit-btn"
              type="button"
              onclick="window.activeGameShell?.handleExitRequest()"
              class="p-2 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center shadow-xs"
              title="Exit Activity"
              aria-label="Exit Activity"
            >
              <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] tracking-wide uppercase">
                  ${this.game.category || 'Relaxation'}
                </span>
                <span id="game-status-badge" class="px-2 py-0.5 rounded-full bg-surface-container text-outline text-[10px] font-semibold">
                  Ready
                </span>
              </div>
              <h1 class="font-headline-sm text-base sm:text-lg font-bold text-on-surface truncate">
                ${this.game.title}
              </h1>
            </div>
          </div>

          <!-- Center: Timer & Progress Bar -->
          <div class="flex items-center gap-3 bg-surface-container-lowest px-4 py-1.5 rounded-full border border-surface-container shadow-xs">
            <span class="material-symbols-outlined text-primary text-[18px]">timer</span>
            <span id="game-shell-timer-text" class="font-mono text-xs font-bold text-on-surface tracking-wider">
              00:00 / ${this.formatTime(this.selectedDuration)}
            </span>
            <div class="w-16 sm:w-24 h-2 bg-surface-container rounded-full overflow-hidden">
              <div id="game-shell-progress-bar" class="h-full bg-primary transition-all duration-300 rounded-full" style="width: 0%"></div>
            </div>
          </div>

          <!-- Right: Audio, Restart, Pause/Resume, & Controls -->
          <div class="flex items-center gap-2">
            
            <!-- Audio Mute Toggle -->
            <button 
              id="game-shell-audio-btn"
              type="button"
              onclick="window.activeGameShell?.toggleAudio()"
              class="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center"
              title="Toggle Calm Soundscape"
              aria-label="Toggle Sound"
            >
              <span id="game-shell-audio-icon" class="material-symbols-outlined text-[18px]">
                ${isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>

            <!-- Restart Button -->
            <button 
              id="game-shell-restart-btn"
              type="button"
              onclick="window.activeGameShell?.handleRestartRequest()"
              class="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center"
              title="Restart Activity"
              aria-label="Restart Activity"
            >
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>

            <!-- Pause / Resume Primary Button -->
            <button 
              id="game-shell-pause-btn"
              type="button"
              onclick="window.activeGameShell?.togglePauseResume()"
              class="px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span id="game-shell-pause-icon" class="material-symbols-outlined text-[16px]">pause</span>
              <span id="game-shell-pause-label">Pause</span>
            </button>

          </div>

        </header>

        <!-- SUBHEADER / DURATION SELECTOR (Shown if configurable) -->
        ${this.supportsDurationConfig ? `
          <div id="game-shell-config-bar" class="px-5 py-2.5 bg-surface-container-low/30 border-b border-surface-container/50 flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-outline">schedule</span>
              <span>Session Target:</span>
              <div class="inline-flex rounded-xl bg-surface-container p-0.5" role="radiogroup" aria-label="Duration selector">
                ${this.durationOptions.map(dur => `
                  <button 
                    type="button"
                    onclick="window.activeGameShell?.setDuration(${dur})"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${this.selectedDuration === dur ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
                  >
                    ${Math.round(dur / 60)} min
                  </button>
                `).join('')}
              </div>
            </div>
            <div class="text-[11px] text-outline flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">spa</span>
              <span>Pause or stop anytime. You set your own pace.</span>
            </div>
          </div>
        ` : ''}

        <!-- MAIN INTERACTIVE GAME AREA -->
        <main id="game-interactive-viewport" class="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[460px] overflow-hidden focus:outline-none" tabindex="0">
          ${gameInnerHtml}
        </main>

        <!-- FOOTER HINT & ACCESSIBILITY BAR -->
        <footer class="px-5 py-3 border-t border-surface-container/60 bg-surface-container-low/40 flex flex-wrap items-center justify-between text-[11px] text-outline gap-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
            <span id="game-shell-footer-tip">${this.game.description || 'Take your time. No scoring, no rush.'}</span>
          </div>
          <div class="flex items-center gap-4">
            <span>Non-clinical relaxation experience</span>
            <button type="button" onclick="window.activeGameShell?.showHelpDialog()" class="underline hover:text-on-surface">Instructions</button>
          </div>
        </footer>

      </div>

      <!-- MODAL: EXIT CONFIRMATION DIALOG -->
      <dialog id="game-exit-confirm-modal" class="modal-dialog">
        <div class="modal-card max-w-sm w-full bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-2xl text-center space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-[28px]">logout</span>
          </div>
          <h3 class="font-headline-sm text-base font-bold text-on-surface">Exit this activity?</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Your elapsed session time will be saved. You can return to CalmPop games anytime.
          </p>
          <div class="flex gap-2 pt-2">
            <button 
              type="button" 
              onclick="document.getElementById('game-exit-confirm-modal').close()" 
              class="flex-1 py-2.5 rounded-full border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface"
            >
              Keep Playing
            </button>
            <button 
              type="button" 
              onclick="window.activeGameShell?.confirmExit()" 
              class="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs"
            >
              Exit to Library
            </button>
          </div>
        </div>
      </dialog>

      <!-- MODAL: RESTART CONFIRMATION DIALOG -->
      <dialog id="game-restart-confirm-modal" class="modal-dialog">
        <div class="modal-card max-w-sm w-full bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-2xl text-center space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-[28px]">restart_alt</span>
          </div>
          <h3 class="font-headline-sm text-base font-bold text-on-surface">Restart activity?</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            This will start a fresh, relaxing session from the beginning.
          </p>
          <div class="flex gap-2 pt-2">
            <button 
              type="button" 
              onclick="document.getElementById('game-restart-confirm-modal').close()" 
              class="flex-1 py-2.5 rounded-full border border-surface-container bg-surface-container-low text-xs font-semibold text-on-surface"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onclick="window.activeGameShell?.confirmRestart()" 
              class="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs"
            >
              Restart
            </button>
          </div>
        </div>
      </dialog>

      <!-- MODAL: INSTRUCTIONS / HELP DIALOG -->
      <dialog id="game-help-modal" class="modal-dialog">
        <div class="modal-card max-w-md w-full bg-surface-container-lowest p-6 sm:p-7 rounded-3xl border border-surface-container shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-surface-container">
            <h3 class="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">info</span>
              <span>${this.game.title} — Guide</span>
            </h3>
            <button type="button" onclick="document.getElementById('game-help-modal').close()" class="p-1 rounded-xl hover:bg-surface-container text-outline">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="text-xs text-on-surface-variant leading-relaxed space-y-3">
            <p>${this.game.instructions || this.game.description}</p>
            <div class="p-3 bg-surface-container-low rounded-2xl border border-surface-container/60 space-y-1">
              <p class="font-bold text-on-surface">Gentle Reminder</p>
              <p class="text-[11px] text-outline">
                CalmPop activities are designed for mindful pacing between workday tasks. There are no wrong answers, no scores to beat, and no timers forcing you to rush. Stop or pause whenever you wish.
              </p>
            </div>
          </div>
          <div class="pt-2">
            <button 
              type="button" 
              onclick="document.getElementById('game-help-modal').close()" 
              class="w-full py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs"
            >
              Got it
            </button>
          </div>
        </div>
      </dialog>

      <!-- MODAL: GENTLE COMPLETION SCREEN -->
      <dialog id="game-completion-modal" class="modal-dialog">
        <div class="modal-card max-w-md w-full bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container shadow-2xl text-center space-y-5">
          <div class="w-16 h-16 rounded-3xl bg-tertiary-fixed/30 text-tertiary-container flex items-center justify-center mx-auto shadow-xs">
            <span class="material-symbols-outlined text-[36px]">sparkles</span>
          </div>
          
          <div class="space-y-1.5">
            <h3 class="font-headline-sm text-xl font-bold text-on-surface">Moment of Calm Complete</h3>
            <p class="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
              You took time to pause and recharge. Notice how your body and breath feel right now.
            </p>
          </div>

          <div class="p-4 bg-surface-container-low rounded-2xl border border-surface-container/60 flex items-center justify-around text-xs">
            <div>
              <span class="text-[10px] text-outline uppercase block font-semibold">Activity</span>
              <span class="font-bold text-on-surface">${this.game.title}</span>
            </div>
            <div class="w-px h-8 bg-surface-container"></div>
            <div>
              <span class="text-[10px] text-outline uppercase block font-semibold">Time Spent</span>
              <span id="game-completion-time-text" class="font-bold text-primary font-mono text-sm">--:--</span>
            </div>
          </div>

          <!-- Optional Post-Game Check-in (Skippable) -->
          <div class="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container text-left space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface">Optional check-in: How are you feeling now?</span>
              <span class="text-[10px] text-outline">Optional</span>
            </div>
            <div class="flex justify-between items-center gap-1.5" id="completion-checkin-emojis">
              ${[
                { label: 'Peaceful', icon: 'sentiment_very_satisfied', val: 'peaceful' },
                { label: 'Relieved', icon: 'sentiment_satisfied', val: 'relieved' },
                { label: 'Steady', icon: 'sentiment_neutral', val: 'steady' },
                { label: 'Thoughtful', icon: 'psychology', val: 'thoughtful' },
                { label: 'Still Busy', icon: 'sentiment_dissatisfied', val: 'still_busy' }
              ].map(item => `
                <button 
                  type="button"
                  onclick="window.activeGameShell?.handleCheckInPost('${item.val}', this)"
                  class="flex-1 py-2 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-all flex flex-col items-center gap-1 border border-transparent hover:border-primary/30"
                  title="${item.label}"
                >
                  <span class="material-symbols-outlined text-[20px] text-primary">${item.icon}</span>
                  <span class="text-[9px] text-outline font-medium truncate">${item.label}</span>
                </button>
              `).join('')}
            </div>
            <p id="completion-checkin-msg" class="text-[10px] text-outline text-center hidden">
              Thank you for checking in.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button 
              type="button" 
              onclick="window.activeGameShell?.confirmRestart()" 
              class="flex-1 py-2.5 rounded-full border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface transition-all"
            >
              Play Again
            </button>
            <button 
              type="button" 
              onclick="window.activeGameShell?.confirmExit()" 
              class="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all"
            >
              Return to Games
            </button>
          </div>
        </div>
      </dialog>
    `;
  }

  attachListeners() {
    window.activeGameShell = this;

    // Listen to session manager ticks
    if (this.sessionManager) {
      this.sessionManager.onTick = (elapsedSec, targetSec, progress) => {
        this.updateTimerDisplay(elapsedSec, targetSec, progress);
      };

      this.sessionManager.onStatusChange = (status) => {
        this.updateStatusBadge(status);
      };

      this.sessionManager.onComplete = (summary) => {
        this.showCompletionModal(summary);
      };
    }
  }

  updateTimerDisplay(elapsedSec, targetSec, progress) {
    const timerText = document.getElementById('game-shell-timer-text');
    const progressBar = document.getElementById('game-shell-progress-bar');
    
    if (timerText) {
      timerText.textContent = `${this.formatTime(elapsedSec)} / ${this.formatTime(targetSec)}`;
    }
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, progress * 100)}%`;
    }
  }

  updateStatusBadge(status) {
    const badge = document.getElementById('game-status-badge');
    const pauseLabel = document.getElementById('game-shell-pause-label');
    const pauseIcon = document.getElementById('game-shell-pause-icon');

    if (!badge) return;

    if (status === 'in_progress') {
      badge.textContent = 'Active';
      badge.className = 'px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-tertiary font-semibold text-[10px]';
      if (pauseLabel) pauseLabel.textContent = 'Pause';
      if (pauseIcon) pauseIcon.textContent = 'pause';
    } else if (status === 'paused') {
      badge.textContent = 'Paused';
      badge.className = 'px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 font-semibold text-[10px]';
      if (pauseLabel) pauseLabel.textContent = 'Resume';
      if (pauseIcon) pauseIcon.textContent = 'play_arrow';
    } else if (status === 'completed') {
      badge.textContent = 'Completed';
      badge.className = 'px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold text-[10px]';
    }
  }

  setDuration(seconds) {
    this.selectedDuration = seconds;
    if (this.sessionManager) {
      this.sessionManager.targetDurationSeconds = seconds;
      this.sessionManager.settings.durationSeconds = seconds;
    }
    // Re-render config bar or update label
    const timerText = document.getElementById('game-shell-timer-text');
    if (timerText) {
      const cur = this.sessionManager ? this.sessionManager.getTrueElapsedSeconds() : 0;
      timerText.textContent = `${this.formatTime(cur)} / ${this.formatTime(seconds)}`;
    }
    const btns = document.querySelectorAll('#game-shell-config-bar button');
    btns.forEach(btn => {
      const isSelected = btn.textContent.trim().startsWith(String(Math.round(seconds / 60)));
      if (isSelected) {
        btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all bg-primary text-white shadow-xs';
      } else {
        btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all text-on-surface-variant hover:text-on-surface';
      }
    });
  }

  togglePauseResume() {
    if (!this.sessionManager) return;
    if (this.sessionManager.status === 'in_progress') {
      this.sessionManager.pause();
    } else if (this.sessionManager.status === 'paused') {
      this.sessionManager.resume();
    } else if (this.sessionManager.status === 'initialized') {
      this.sessionManager.start();
    }
  }

  toggleAudio() {
    const isMuted = audioSynth.toggleMute();
    const icon = document.getElementById('game-shell-audio-icon');
    if (icon) {
      icon.textContent = isMuted ? 'volume_off' : 'volume_up';
    }
    if (!isMuted) {
      audioSynth.playChime();
    }
  }

  handleExitRequest() {
    const modal = document.getElementById('game-exit-confirm-modal');
    if (modal) modal.showModal();
  }

  confirmExit() {
    const modal = document.getElementById('game-exit-confirm-modal');
    if (modal) modal.close();
    const compModal = document.getElementById('game-completion-modal');
    if (compModal) compModal.close();

    if (this.sessionManager) {
      this.sessionManager.earlyExit();
    }
    this.onExit();
  }

  handleRestartRequest() {
    const modal = document.getElementById('game-restart-confirm-modal');
    if (modal) modal.showModal();
  }

  confirmRestart() {
    const modal = document.getElementById('game-restart-confirm-modal');
    if (modal) modal.close();
    const compModal = document.getElementById('game-completion-modal');
    if (compModal) compModal.close();

    if (this.sessionManager) {
      this.sessionManager.restart();
    }
    if (typeof this.onRestartCallback === 'function') {
      this.onRestartCallback();
    }
  }

  showHelpDialog() {
    const modal = document.getElementById('game-help-modal');
    if (modal) modal.showModal();
  }

  showCompletionModal(summary) {
    audioSynth.playSuccessChime();
    const modal = document.getElementById('game-completion-modal');
    const timeText = document.getElementById('game-completion-time-text');
    if (timeText) {
      timeText.textContent = this.formatTime(summary.elapsedDuration);
    }
    if (modal) modal.showModal();
  }

  handleCheckInPost(val, btn) {
    if (this.sessionManager) {
      this.sessionManager.recordEvent('checkInPost', val);
    }
    const container = document.getElementById('completion-checkin-emojis');
    if (container) {
      container.querySelectorAll('button').forEach(b => {
        b.classList.remove('bg-primary/20', 'border-primary');
      });
    }
    btn.classList.add('bg-primary/20', 'border-primary');
    const msg = document.getElementById('completion-checkin-msg');
    if (msg) msg.classList.remove('hidden');
  }

  formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
