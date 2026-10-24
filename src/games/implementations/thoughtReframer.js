// CalmPop - Game 3: Thought Reframer
// 5-Step guided CBT-inspired reflection tool with strict client/employee privacy isolation,
// separate facts vs assumptions, realistic next steps, and zero clinical scoring.

import { PrivateStorageManager } from '../privateStorage.js';
import { audioSynth } from '../audioSynth.js';

const EXAMPLE_THOUGHTS = [
  "I will fail my upcoming presentation or review.",
  "I made a mistake in today's email and damaged my reputation.",
  "Everyone else on the team seems to manage this workload easily.",
  "I have so many tasks that I will never catch up.",
  "If I ask for help, people will think I can't do my job."
];

const NEXT_STEP_OPTIONS = [
  { id: 'small_action', label: 'Take one small, realistic action', icon: 'check_circle' },
  { id: 'ask_support', label: 'Ask a trusted teammate or manager for support', icon: 'people' },
  { id: 'gather_info', label: 'Gather more information before concluding', icon: 'search' },
  { id: 'take_break', label: 'Take a restorative break and revisit this later', icon: 'hourglass_empty' },
  { id: 'acknowledge_hard', label: 'Acknowledge that this situation is genuinely difficult', icon: 'favorite' }
];

export function renderThoughtReframer(sessionManager) {
  return `
    <div id="thought-reframer-app" class="w-full max-w-xl mx-auto space-y-5">
      
      <!-- STEP INDICATOR (1 to 5) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-outline px-1">
          <span id="tr-step-badge" class="font-bold text-primary">Step 1 of 5</span>
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="window.thoughtReframerInstance?.openSavedReflectionsModal()"
              class="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">folder_special</span>
              <span>My Saved Reflections</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-1.5 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div id="tr-bar-1" class="h-full bg-primary rounded-full transition-all duration-300"></div>
          <div id="tr-bar-2" class="h-full bg-surface-container rounded-full transition-all duration-300"></div>
          <div id="tr-bar-3" class="h-full bg-surface-container rounded-full transition-all duration-300"></div>
          <div id="tr-bar-4" class="h-full bg-surface-container rounded-full transition-all duration-300"></div>
          <div id="tr-bar-5" class="h-full bg-surface-container rounded-full transition-all duration-300"></div>
        </div>
      </div>

      <!-- STEP CONTAINERS (Only one visible at a time) -->
      <div id="tr-steps-viewport" class="bg-surface-container-low/60 rounded-3xl p-5 sm:p-7 border border-surface-container shadow-xs min-h-[340px] flex flex-col justify-between">
        
        <!-- STEP 1: CHOOSE A THOUGHT -->
        <div id="tr-step-1" class="space-y-4">
          <div class="space-y-1">
            <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Step 1 — Choose a thought to examine</h2>
            <p class="text-xs text-on-surface-variant leading-relaxed">
              Select a relatable common thought or write your own. Your reflections remain completely private on your device.
            </p>
          </div>

          <!-- Example Chips -->
          <div class="space-y-1.5">
            <span class="text-[10px] text-outline uppercase font-semibold block">Select an example:</span>
            <div class="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
              ${EXAMPLE_THOUGHTS.map(t => `
                <button 
                  type="button"
                  onclick="window.thoughtReframerInstance?.selectExampleThought('${t.replace(/'/g, "\\'")}')"
                  class="text-left p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container/60 text-xs text-on-surface transition-all"
                >
                  "${t}"
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Custom Input -->
          <div class="space-y-1 pt-1">
            <label for="tr-thought-input" class="text-[11px] font-semibold text-outline block">Or write your current thought:</label>
            <textarea 
              id="tr-thought-input"
              rows="2"
              placeholder="e.g., I'm feeling overwhelmed by today's deadlines..."
              class="w-full p-3 rounded-2xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            ></textarea>
          </div>
        </div>

        <!-- STEP 2: DESCRIBE WHAT HAPPENED -->
        <div id="tr-step-2" class="space-y-4 hidden">
          <div class="space-y-1">
            <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Step 2 — Describe the situation</h2>
            <p class="text-xs text-on-surface-variant leading-relaxed">
              What specific event or situation triggered this thought?
            </p>
          </div>

          <div class="p-3 bg-surface-container-lowest rounded-2xl border border-surface-container text-xs">
            <span class="text-[10px] text-primary uppercase font-bold block">Selected Thought:</span>
            <p id="tr-summary-thought" class="font-medium text-on-surface mt-0.5 italic"></p>
          </div>

          <div class="space-y-1">
            <label for="tr-situation-input" class="text-[11px] font-semibold text-outline block">What happened?</label>
            <textarea 
              id="tr-situation-input"
              rows="3"
              placeholder="e.g., During the afternoon standup, a new high-priority bug was assigned to me with a tight turnaround..."
              class="w-full p-3 rounded-2xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            ></textarea>
          </div>
        </div>

        <!-- STEP 3: SEPARATE FACTS FROM ASSUMPTIONS -->
        <div id="tr-step-3" class="space-y-4 hidden">
          <div class="space-y-1">
            <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Step 3 — Separate facts from predictions</h2>
            <p class="text-xs text-on-surface-variant leading-relaxed">
              Our minds naturally fill in gaps with worst-case scenarios. Let's distinguish what is concrete from what is assumed.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 bg-surface-container-lowest rounded-2xl border border-surface-container space-y-1.5">
              <div class="flex items-center gap-1.5 text-primary text-xs font-bold">
                <span class="material-symbols-outlined text-[16px]">verified</span>
                <span>What do I know for sure?</span>
              </div>
              <p class="text-[10px] text-outline">Verifiable facts and tangible events:</p>
              <textarea 
                id="tr-facts-input"
                rows="3"
                placeholder="e.g., I have 3 open PRs and one bug ticket to complete."
                class="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              ></textarea>
            </div>

            <div class="p-3.5 bg-surface-container-lowest rounded-2xl border border-surface-container space-y-1.5">
              <div class="flex items-center gap-1.5 text-secondary text-xs font-bold">
                <span class="material-symbols-outlined text-[16px]">psychology_alt</span>
                <span>What am I predicting or assuming?</span>
              </div>
              <p class="text-[10px] text-outline">Guessed reactions or assumed futures:</p>
              <textarea 
                id="tr-assumptions-input"
                rows="3"
                placeholder="e.g., Assuming people will judge me if I ask to push back the release date."
                class="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 4: EXPLORE ANOTHER PERSPECTIVE -->
        <div id="tr-step-4" class="space-y-4 hidden">
          <div class="space-y-1">
            <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Step 4 — Explore another perspective</h2>
            <p class="text-xs text-on-surface-variant leading-relaxed">
              Step back and view the situation as a supportive, neutral observer.
            </p>
          </div>

          <div class="space-y-3">
            <div class="space-y-1">
              <label for="tr-alt-view-input" class="text-xs font-semibold text-on-surface block">
                What is another plausible interpretation?
              </label>
              <textarea 
                id="tr-alt-view-input"
                rows="2"
                placeholder="e.g., My team lead might appreciate proactive communication about scope rather than silent rushing."
                class="w-full p-3 rounded-2xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              ></textarea>
            </div>

            <div class="space-y-1">
              <label for="tr-missing-info-input" class="text-xs font-semibold text-on-surface block">
                What information might I be missing right now?
              </label>
              <textarea 
                id="tr-missing-info-input"
                rows="2"
                placeholder="e.g., I haven't asked if the deadline is strict or flexible."
                class="w-full p-3 rounded-2xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 5: CHOOSE A REALISTIC NEXT STEP -->
        <div id="tr-step-5" class="space-y-4 hidden">
          <div class="space-y-1">
            <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Step 5 — Choose a realistic next step</h2>
            <p class="text-xs text-on-surface-variant leading-relaxed">
              Calm action is grounded in self-compassion, not forced optimism. Select a gentle next step:
            </p>
          </div>

          <div class="space-y-2">
            ${NEXT_STEP_OPTIONS.map((opt, idx) => `
              <label class="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container cursor-pointer transition-all">
                <input 
                  type="radio" 
                  name="tr_next_step" 
                  value="${opt.label}" 
                  ${idx === 0 ? 'checked' : ''}
                  class="text-primary focus:ring-primary"
                />
                <span class="material-symbols-outlined text-primary text-[20px]">${opt.icon}</span>
                <span class="text-xs font-semibold text-on-surface">${opt.label}</span>
              </label>
            `).join('')}
          </div>

          <div class="space-y-1 pt-1">
            <label for="tr-custom-action-input" class="text-[11px] font-semibold text-outline block">Optional custom note for yourself:</label>
            <input 
              id="tr-custom-action-input"
              type="text"
              placeholder="e.g., Take a 10-minute walk, then send an update in Slack."
              class="w-full p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <!-- STEP NAVIGATION FOOTER -->
        <div class="pt-4 border-t border-surface-container flex items-center justify-between gap-3">
          <button 
            type="button" 
            id="tr-back-btn"
            onclick="window.thoughtReframerInstance?.prevStep()"
            class="px-4 py-2 rounded-full border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface transition-all disabled:opacity-30"
            disabled
          >
            Back
          </button>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="window.thoughtReframerInstance?.discardReflection()"
              class="px-3 py-2 rounded-full text-xs font-medium text-outline hover:text-error transition-all"
            >
              Discard
            </button>

            <button 
              type="button" 
              id="tr-next-btn"
              onclick="window.thoughtReframerInstance?.nextStep()"
              class="px-6 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Next</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>

      <!-- PRIVACY GUARANTEE NOTE -->
      <div class="flex items-center justify-center gap-1.5 text-[11px] text-outline text-center">
        <span class="material-symbols-outlined text-[14px] text-tertiary">lock</span>
        <span>Private by design: Your written thoughts are never sent to analytics or HR reports.</span>
      </div>

      <!-- SAVED REFLECTIONS MODAL -->
      <dialog id="tr-saved-modal" class="modal-dialog">
        <div class="modal-card max-w-lg w-full bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-surface-container">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">folder_special</span>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">My Private Saved Reflections</h3>
            </div>
            <button type="button" onclick="document.getElementById('tr-saved-modal').close()" class="p-1 rounded-xl hover:bg-surface-container text-outline">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div id="tr-saved-list" class="max-h-72 overflow-y-auto space-y-2.5 pr-1 text-xs">
            <p class="text-outline text-center py-6">No saved reflections found.</p>
          </div>

          <div class="pt-2 text-right">
            <button type="button" onclick="document.getElementById('tr-saved-modal').close()" class="px-5 py-2 rounded-full bg-surface-container text-xs font-semibold text-on-surface">
              Close
            </button>
          </div>
        </div>
      </dialog>

      <!-- REFLECTION SAVED CONFIRMATION MODAL -->
      <dialog id="tr-complete-modal" class="modal-dialog">
        <div class="modal-card max-w-sm w-full bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-2xl text-center space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-[28px]">verified</span>
          </div>
          <h3 class="font-headline-sm text-base font-bold text-on-surface">Reflection Complete</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            You took a thoughtful, grounded pause to reframe your thinking. Would you like to save this reflection privately for your own review?
          </p>
          <div class="flex flex-col gap-2 pt-2">
            <button 
              type="button" 
              onclick="window.thoughtReframerInstance?.confirmSavePrivately()" 
              class="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs"
            >
              Save Privately
            </button>
            <button 
              type="button" 
              onclick="window.thoughtReframerInstance?.confirmFinishWithoutSaving()" 
              class="w-full py-2.5 rounded-full border border-surface-container bg-surface-container-low text-xs font-semibold text-on-surface"
            >
              Finish Without Saving
            </button>
          </div>
        </div>
      </dialog>

    </div>
  `;
}

export class ThoughtReframerController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.currentStep = 1;
    this.thought = '';
    this.situation = '';
    this.facts = '';
    this.assumptions = '';
    this.altView = '';
    this.missingInfo = '';
    this.nextStep = '';
    this.customAction = '';
  }

  init() {
    window.thoughtReframerInstance = this;
    this.updateStepView();
  }

  selectExampleThought(t) {
    this.thought = t;
    const input = document.getElementById('tr-thought-input');
    if (input) input.value = t;
    audioSynth.playPop();
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepView();
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      const input = document.getElementById('tr-thought-input');
      this.thought = input?.value.trim() || this.thought;
      if (!this.thought) {
        window.showToast?.('Please write or select a thought to examine', 'info');
        return;
      }
      const summary = document.getElementById('tr-summary-thought');
      if (summary) summary.textContent = `"${this.thought}"`;
    } else if (this.currentStep === 2) {
      const input = document.getElementById('tr-situation-input');
      this.situation = input?.value.trim() || '';
    } else if (this.currentStep === 3) {
      const fInput = document.getElementById('tr-facts-input');
      const aInput = document.getElementById('tr-assumptions-input');
      this.facts = fInput?.value.trim() || '';
      this.assumptions = aInput?.value.trim() || '';
    } else if (this.currentStep === 4) {
      const vInput = document.getElementById('tr-alt-view-input');
      const mInput = document.getElementById('tr-missing-info-input');
      this.altView = vInput?.value.trim() || '';
      this.missingInfo = mInput?.value.trim() || '';
    } else if (this.currentStep === 5) {
      const radio = document.querySelector('input[name="tr_next_step"]:checked');
      this.nextStep = radio?.value || 'Take one small, realistic action';
      const cInput = document.getElementById('tr-custom-action-input');
      this.customAction = cInput?.value.trim() || '';

      // Prompt completion save dialog
      const modal = document.getElementById('tr-complete-modal');
      if (modal) modal.showModal();
      return;
    }

    this.currentStep++;
    audioSynth.playPop();
    this.updateStepView();
  }

  updateStepView() {
    // Hide all steps, show current
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`tr-step-${i}`);
      const bar = document.getElementById(`tr-bar-${i}`);
      if (el) el.classList.toggle('hidden', i !== this.currentStep);
      if (bar) {
        bar.className = i <= this.currentStep 
          ? 'h-full bg-primary rounded-full transition-all duration-300' 
          : 'h-full bg-surface-container rounded-full transition-all duration-300';
      }
    }

    const badge = document.getElementById('tr-step-badge');
    if (badge) badge.textContent = `Step ${this.currentStep} of 5`;

    const backBtn = document.getElementById('tr-back-btn');
    if (backBtn) backBtn.disabled = this.currentStep === 1;

    const nextBtn = document.getElementById('tr-next-btn');
    if (nextBtn) {
      const span = nextBtn.querySelector('span');
      if (span) span.textContent = this.currentStep === 5 ? 'Finish' : 'Next';
    }
  }

  async confirmSavePrivately() {
    const modal = document.getElementById('tr-complete-modal');
    if (modal) modal.close();

    await PrivateStorageManager.savePrivateItem('thought_reframer', {
      thought: this.thought,
      situation: this.situation,
      facts: this.facts,
      assumptions: this.assumptions,
      altView: this.altView,
      missingInfo: this.missingInfo,
      nextStep: this.nextStep,
      customAction: this.customAction
    });

    window.showToast?.('Reflection saved privately to your account.', 'lock');
    this.sessionManager.complete();
  }

  confirmFinishWithoutSaving() {
    const modal = document.getElementById('tr-complete-modal');
    if (modal) modal.close();
    window.showToast?.('Reflection finished without saving.', 'check');
    this.sessionManager.complete();
  }

  discardReflection() {
    if (confirm('Discard this reflection session? Your written notes will be cleared.')) {
      this.sessionManager.earlyExit();
      window.navigateView?.('employee', 'games');
    }
  }

  async openSavedReflectionsModal() {
    const modal = document.getElementById('tr-saved-modal');
    const list = document.getElementById('tr-saved-list');
    if (!modal || !list) return;

    list.innerHTML = `
      <div class="text-center py-4 text-outline">
        <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
        <p class="text-[11px] mt-1">Loading your private reflections...</p>
      </div>
    `;
    modal.showModal();

    const items = await PrivateStorageManager.getPrivateItems('thought_reframer');
    if (!items || items.length === 0) {
      list.innerHTML = `<p class="text-outline text-center py-6">You have no saved reflections yet.</p>`;
      return;
    }

    list.innerHTML = items.map(item => {
      const data = item.content || {};
      const date = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      return `
        <div class="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container/60 space-y-2">
          <div class="flex items-center justify-between text-[11px] text-outline">
            <span class="font-bold text-primary">${date}</span>
            <button 
              type="button" 
              onclick="window.thoughtReframerInstance?.deleteSavedItem('${item.id}')"
              class="text-error hover:underline flex items-center gap-1"
              title="Delete Reflection"
            >
              <span class="material-symbols-outlined text-[14px]">delete</span>
              <span>Delete</span>
            </button>
          </div>
          <p class="font-bold text-on-surface">"${data.thought || 'Untitled reflection'}"</p>
          ${data.altView ? `<p class="text-[11px] text-on-surface-variant"><span class="font-semibold text-outline">Alternative:</span> ${data.altView}</p>` : ''}
          ${data.nextStep ? `<p class="text-[11px] text-tertiary font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">check</span> ${data.nextStep}</p>` : ''}
        </div>
      `;
    }).join('');
  }

  async deleteSavedItem(id) {
    if (confirm('Permanently delete this private reflection?')) {
      await PrivateStorageManager.deletePrivateItem(id, 'thought_reframer');
      window.showToast?.('Reflection deleted.', 'delete');
      this.openSavedReflectionsModal();
    }
  }

  destroy() {}
}
