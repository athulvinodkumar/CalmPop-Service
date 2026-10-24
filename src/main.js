// CalmPop - Core Interactive Application Logic
import { mockStore, formatINR, DEFAULT_PLANS } from './mockStore.js';
import { renderCheckoutView, initCheckout, getPendingCheckout } from './views/checkout.js';
import { renderReceiptView } from './views/receipt.js';
import { renderAdminDashboard } from './views/adminDashboard.js';
import { renderSuperadminView } from './views/superadmin.js';
import { openRegistrationModal, renderRegistrationForm } from './views/registration.js';
import { renderEmployeeLoginView } from './views/employeeLogin.js';
import { renderEmployeePortalView } from './views/employeePortal.js';

// Expose modules and router globally for inline HTML events
window.mockStore = mockStore;
window.formatINR = formatINR;
window.openRegistrationModal = openRegistrationModal;
window.renderCheckoutView = renderCheckoutView;
window.initCheckout = initCheckout;
window.renderReceiptView = renderReceiptView;
window.renderAdminDashboard = renderAdminDashboard;
window.renderSuperadminView = renderSuperadminView;
window.renderEmployeeLoginView = renderEmployeeLoginView;
window.renderEmployeePortalView = renderEmployeePortalView;

// ==========================================
// 1. Navigation & View Router (Landing, Checkout, Admin, Superadmin, Receipt, Login, Employee)
// ==========================================
window.navigateView = function(viewName, params = null) {
  const landingView = document.getElementById('landing-view');
  const appContainer = document.getElementById('app-view-container');
  const header = document.querySelector('header');
  
  if (!landingView || !appContainer) return;

  // Close any open modals
  ['survey-modal', 'calm-modal', 'export-modal', 'login-modal', 'onboarding-modal', 'registration-modal'].forEach(id => {
    window.closeModal(id);
  });

  if (viewName === 'landing' || viewName === 'home') {
    appContainer.classList.add('hidden');
    appContainer.innerHTML = '';
    landingView.classList.remove('hidden');
    if (header) header.classList.remove('hidden');
    
    if (params) {
      setTimeout(() => {
        let targetId = params;
        if (targetId === 'dashboard') targetId = 'for-companies';
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      history.pushState(null, '', `#${params}`);
      window.setActiveNav(params);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', '#home');
      window.setActiveNav('home');
    }
    return;
  }

  // Application Views: checkout, receipt, admin, superadmin, login, employee
  landingView.classList.add('hidden');
  if (header) header.classList.add('hidden');
  appContainer.classList.remove('hidden');
  window.scrollTo(0, 0);

  // Security Guard: Authenticated employees cannot access mockup Admin or Superadmin portals
  if ((viewName === 'admin' || viewName === 'superadmin') && sessionStorage.getItem('calmpop_session_token')) {
    appContainer.innerHTML = `
      <div class="min-h-screen bg-background flex items-center justify-center p-6">
        <div class="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-2xl text-center space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h2 class="font-headline-sm text-xl font-bold text-on-surface">Employee Account Active</h2>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            You are currently signed into an authenticated Employee Account. The HR Administrator and Platform Superadmin interfaces are demonstration portals.
          </p>
          <div class="pt-2 flex flex-col gap-2">
            <button onclick="window.navigateView('employee')" class="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-sm">
              Return to Employee Portal
            </button>
            <button onclick="window.handleEmployeeLogout()" class="w-full py-2.5 rounded-full border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-error transition-all">
              Sign Out of Employee Account
            </button>
          </div>
        </div>
      </div>
    `;
    history.pushState(null, '', `#${viewName}`);
    return;
  }

  if (viewName === 'login') {
    renderEmployeeLoginView('app-view-container');
    history.pushState(null, '', '#login');
  } else if (viewName === 'employee') {
    const subtab = params || 'home';
    renderEmployeePortalView(subtab, 'app-view-container');
    history.pushState(null, '', subtab === 'home' ? '#employee' : `#employee/${subtab}`);
  } else if (viewName === 'checkout') {
    renderCheckoutView('app-view-container');
    history.pushState(null, '', '#checkout');
  } else if (viewName === 'receipt') {
    renderReceiptView(params, 'app-view-container');
    history.pushState(null, '', params ? `#receipt?tx=${params}` : '#receipt');
  } else if (viewName === 'admin') {
    renderAdminDashboard(params, 'app-view-container');
    history.pushState(null, '', params ? `#admin?id=${params}` : '#admin');
  } else if (viewName === 'superadmin') {
    renderSuperadminView('app-view-container');
    history.pushState(null, '', '#superadmin');
  }
};

export function handleHashRoute() {
  const hash = window.location.hash || '#home';
  if (hash === '#login') {
    window.navigateView('login');
  } else if (hash === '#employee' || hash.startsWith('#employee/')) {
    const subtab = hash.replace('#employee/', '').replace('#employee', '') || 'home';
    window.navigateView('employee', subtab);
  } else if (hash.startsWith('#checkout')) {
    window.navigateView('checkout');
  } else if (hash.startsWith('#receipt')) {
    const query = hash.split('?')[1] || '';
    const params = new URLSearchParams(query);
    const tx = params.get('tx') || null;
    window.navigateView('receipt', tx);
  } else if (hash.startsWith('#admin')) {
    const query = hash.split('?')[1] || '';
    const params = new URLSearchParams(query);
    const id = params.get('id') || null;
    window.navigateView('admin', id);
  } else if (hash.startsWith('#superadmin')) {
    window.navigateView('superadmin');
  } else {
    // Normal landing section or default
    const section = hash.replace('#', '') || 'home';
    const landingView = document.getElementById('landing-view');
    if (landingView && landingView.classList.contains('hidden')) {
      window.navigateView('landing', section);
    }
  }
}
window.addEventListener('hashchange', handleHashRoute);

// ==========================================
// 2. Modern Dialog Light-Dismiss Support (Modern Web Guidance)
// ==========================================
function setupDialogLightDismiss(dialog) {
  if (!dialog) return;
  // Fallback for browsers without native closedby support
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) {
        dialog.close();
      }
    });
  }
}

// Global modal helpers
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal && typeof modal.showModal === 'function') {
    modal.showModal();
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal && typeof modal.close === 'function') {
    modal.close();
  }
};

// ==========================================
// 3. Toast Notification System
// ==========================================
window.showToast = function(message, icon = 'check_circle') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'flex items-center gap-2.5 bg-on-background text-surface px-4 py-3 rounded-2xl shadow-2xl text-body-sm font-medium transform transition-all duration-300 translate-y-4 opacity-0 z-50';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px] text-tertiary-fixed">${icon}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

// ==========================================
// 4. Indian Rupee Pricing Logic & Interactive Seat Slider
// ==========================================
let currentBillingCycle = 'monthly';
window.currentBillingCycle = currentBillingCycle;
let currentSeatCount = 45;

window.switchBilling = function(period) {
  currentBillingCycle = period;
  window.currentBillingCycle = period;
  const monthlyBtn = document.getElementById('toggle-monthly');
  const annualBtn = document.getElementById('toggle-annual');

  if (period === 'annual') {
    monthlyBtn.className = "px-5 py-2 rounded-full font-label-md text-label-md text-on-surface-variant font-medium hover:text-on-surface transition-all";
    annualBtn.className = "px-5 py-2 rounded-full font-label-md text-label-md bg-surface-container-lowest text-on-surface font-semibold shadow-sm transition-all flex items-center gap-1.5";
  } else {
    monthlyBtn.className = "px-5 py-2 rounded-full font-label-md text-label-md bg-surface-container-lowest text-on-surface font-semibold shadow-sm transition-all";
    annualBtn.className = "px-5 py-2 rounded-full font-label-md text-label-md text-on-surface-variant font-medium hover:text-on-surface transition-all flex items-center gap-1.5";
  }
  updatePricingDisplay();
};

window.onSeatSliderChange = function(seats) {
  currentSeatCount = parseInt(seats, 10);
  const seatDisplay = document.getElementById('seat-slider-val');
  if (seatDisplay) seatDisplay.textContent = currentSeatCount;
  updatePricingDisplay();
};

export function updatePricingDisplay() {
  const isAnnual = currentBillingCycle === 'annual';
  const plans = mockStore.getPlans();
  const starterPrice = document.querySelector('[data-price-starter]');
  const growthPrice = document.querySelector('[data-price-growth]');
  const starterSubRate = document.getElementById('starter-sub-rate');
  const growthSubRate = document.getElementById('growth-sub-rate');
  
  if (starterPrice) {
    const rate = isAnnual ? plans.starter.annualPricePerEmployee : plans.starter.monthlyPricePerEmployee;
    starterPrice.textContent = formatINR(rate, isAnnual);
  }
  if (starterSubRate) {
    starterSubRate.textContent = isAnnual 
      ? `Billed annually (${formatINR(plans.starter.annualPricePerEmployee * 12 * 10)}/yr for 10 seats)` 
      : `${formatINR(plans.starter.annualPricePerEmployee, true)}/mo billed annually (Save 20%)`;
  }

  if (growthPrice) {
    const rate = isAnnual ? plans.growth.annualPricePerEmployee : plans.growth.monthlyPricePerEmployee;
    growthPrice.textContent = formatINR(rate, isAnnual);
  }
  if (growthSubRate) {
    growthSubRate.textContent = isAnnual 
      ? `Billed annually (${formatINR(plans.growth.annualPricePerEmployee * 12 * 10)}/yr for 10 seats)` 
      : `${formatINR(plans.growth.annualPricePerEmployee, true)}/mo billed annually (Save 20%)`;
  }

  // Calculator widget updates
  const calcEstMonthly = document.getElementById('calc-est-monthly');
  const calcSavings = document.getElementById('calc-savings');
  const calcRecommendedTier = document.getElementById('calc-recommended-tier');

  const planKey = currentSeatCount <= plans.starter.employeeLimit ? 'starter' : (currentSeatCount <= plans.growth.employeeLimit ? 'growth' : 'enterprise');
  const order = mockStore.calculateOrder(planKey, currentBillingCycle, currentSeatCount);

  if (calcEstMonthly) {
    calcEstMonthly.textContent = isAnnual 
      ? `${formatINR(order.monthlyEquivalent, true)}/mo` 
      : `${formatINR(order.monthlyEquivalent)}/mo`;
  }
  if (calcSavings) {
    calcSavings.textContent = isAnnual 
      ? `Saving ~${formatINR(order.annualSavings)}/year with annual plan (20% off)` 
      : 'Switch to annual to save 20%';
  }
  if (calcRecommendedTier) {
    if (currentSeatCount <= plans.starter.employeeLimit) {
      calcRecommendedTier.textContent = `Starter Plan (Up to ${plans.starter.employeeLimit} seats)`;
    } else if (currentSeatCount <= plans.growth.employeeLimit) {
      calcRecommendedTier.textContent = `Growth Plan (Up to ${plans.growth.employeeLimit} seats)`;
    } else {
      calcRecommendedTier.textContent = 'Enterprise Plan (Custom volume pricing)';
    }
  }
}

window.updatePricingDisplay = updatePricingDisplay;

// ==========================================
// 5. Interactive Micro Check-in / Survey Demo
// ==========================================
const surveyQuestions = [
  {
    category: "Workload Velocity",
    question: "How manageable was your workload velocity this week?",
    options: [
      { text: "Balanced & predictable", score: 92, tag: "Optimal" },
      { text: "High, but stable", score: 78, tag: "Manageable" },
      { text: "Overwhelming crunch", score: 42, tag: "Risk" }
    ]
  },
  {
    category: "Psychological Safety & Support",
    question: "How supported do you feel by your team and manager during high-stress deliverables?",
    options: [
      { text: "Unconditionally supported", score: 95, tag: "Optimal" },
      { text: "Somewhat supported", score: 72, tag: "Moderate" },
      { text: "Often isolated or unsupported", score: 38, tag: "Risk" }
    ]
  },
  {
    category: "Micro-Recovery & Focus",
    question: "Did you find moments for cognitive recharge or micro-breaks between meetings today?",
    options: [
      { text: "Yes, consistent restful breaks", score: 90, tag: "Optimal" },
      { text: "Only a quick rushed pause", score: 65, tag: "Moderate" },
      { text: "Zero rest, back-to-back demands", score: 35, tag: "Risk" }
    ]
  }
];

let currentSurveyStep = 0;
let userSurveyAnswers = [];

window.startSurveyDemo = function() {
  currentSurveyStep = 0;
  userSurveyAnswers = [];
  renderSurveyQuestion();
  openModal('survey-modal');
};

function renderSurveyQuestion() {
  const container = document.getElementById('survey-modal-content');
  if (!container) return;

  if (currentSurveyStep >= surveyQuestions.length) {
    // Show completion results
    const totalScore = Math.round(userSurveyAnswers.reduce((a, b) => a + b, 0) / userSurveyAnswers.length);
    const sentimentLabel = totalScore >= 80 ? "Optimal Resilience" : totalScore >= 60 ? "Moderate Pressure" : "Action Needed";
    const sentimentColor = totalScore >= 80 ? "text-tertiary bg-tertiary-fixed/30" : totalScore >= 60 ? "text-primary bg-primary/10" : "text-error bg-error/10";

    container.innerHTML = `
      <div class="text-center py-4">
        <div class="w-16 h-16 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
          <span class="material-symbols-outlined text-[32px]">task_alt</span>
        </div>
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Check-In Completed</span>
        <h3 class="font-headline-md text-headline-md text-on-surface font-semibold mt-1 mb-2">Thank you for your pulse feedback</h3>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
          Your input is 100% anonymized and aggregated into your team's collective weekly health baseline.
        </p>

        <div class="bg-surface-container-low rounded-2xl p-6 max-w-sm mx-auto mb-6 text-left">
          <div class="flex items-center justify-between mb-2">
            <span class="font-label-sm text-outline uppercase font-semibold">Simulated Index</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${sentimentColor}">${sentimentLabel}</span>
          </div>
          <div class="flex items-baseline gap-2 mb-2">
            <span class="font-headline-lg text-[36px] font-bold text-on-surface">${totalScore}%</span>
            <span class="text-body-sm text-outline">Personal Wellness score</span>
          </div>
          <div class="w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div class="bg-tertiary-fixed-dim h-full transition-all duration-1000" style="width: ${totalScore}%"></div>
          </div>
          <p class="font-body-sm text-xs text-on-surface-variant mt-3">
            Recommended Action: Take a 3-minute paced breathing exercise before your next meeting.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onclick="closeModal('survey-modal'); startCalmSession();" class="w-full sm:w-auto px-6 py-3 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-lg font-semibold hover:bg-tertiary-fixed-dim transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">spa</span>
            <span>Try 3-Min Micro-Relief Now</span>
          </button>
          <button onclick="closeModal('survey-modal')" class="w-full sm:w-auto px-6 py-3 rounded-full bg-surface-container-high text-on-surface font-label-lg font-medium hover:bg-surface-container-highest transition-all">
            Done
          </button>
        </div>
      </div>
    `;
    return;
  }

  const q = surveyQuestions[currentSurveyStep];
  container.innerHTML = `
    <div>
      <div class="flex items-center justify-between text-outline mb-3">
        <span class="font-label-sm text-label-sm uppercase tracking-wide">Question ${currentSurveyStep + 1} of ${surveyQuestions.length} • ${q.category}</span>
        <span class="material-symbols-outlined text-primary text-[20px]">psychology</span>
      </div>

      <!-- Step bar -->
      <div class="w-full bg-surface-container h-1.5 rounded-full mb-6 overflow-hidden">
        <div class="bg-primary h-full transition-all duration-300" style="width: ${((currentSurveyStep + 1) / surveyQuestions.length) * 100}%"></div>
      </div>

      <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mb-6">
        ${q.question}
      </h3>

      <div class="space-y-3 mb-6">
        ${q.options.map((opt, i) => `
          <button onclick="submitSurveyOption(${opt.score})" class="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-primary-fixed/20 border border-transparent hover:border-primary/20 text-left transition-all group">
            <span class="font-body-md text-on-surface group-hover:text-primary font-medium">${opt.text}</span>
            <span class="material-symbols-outlined text-outline group-hover:text-primary transition-transform group-hover:translate-x-1 text-[20px]">arrow_forward</span>
          </button>
        `).join('')}
      </div>

      <div class="flex items-center justify-between text-outline text-[12px] pt-2 border-t border-surface-container">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px] text-tertiary">lock</span>
          Fully Anonymized Pulse
        </span>
        <span>Takes ~30 seconds</span>
      </div>
    </div>
  `;
}

window.submitSurveyOption = function(score) {
  userSurveyAnswers.push(score);
  currentSurveyStep++;
  renderSurveyQuestion();
};

// ==========================================
// 5. Moments of Calm - Box Breathing & Web Audio Rain
// ==========================================
let breathingInterval = null;
let soundscapeActive = false;
let audioCtx = null;
let rainNode = null;
let gainNode = null;

let breathState = 'inhale'; // inhale, hold1, exhale, hold2
let breathSecondsRemaining = 180; // 3 minutes total
let cycleSeconds = 4;
let currentPhaseSec = 4;

window.startCalmSession = function() {
  openModal('calm-modal');
  resetBreathingState();
  startBreathingLoop();
};

window.stopCalmSession = function() {
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  if (soundscapeActive) {
    toggleSoundscape(false);
  }
  closeModal('calm-modal');
};

function resetBreathingState() {
  if (breathingInterval) clearInterval(breathingInterval);
  breathSecondsRemaining = 180;
  breathState = 'inhale';
  currentPhaseSec = 4;
  updateBreathingUI();
}

function startBreathingLoop() {
  const circle = document.getElementById('breathe-anim-circle');
  if (circle) circle.classList.add('active');

  breathingInterval = setInterval(() => {
    currentPhaseSec--;
    breathSecondsRemaining--;

    if (breathSecondsRemaining <= 0) {
      clearInterval(breathingInterval);
      showToast("3-Minute Micro-Relief Session complete! Well done.", "spa");
      stopCalmSession();
      return;
    }

    if (currentPhaseSec <= 0) {
      // Transition phase: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
      if (breathState === 'inhale') {
        breathState = 'hold1';
      } else if (breathState === 'hold1') {
        breathState = 'exhale';
      } else if (breathState === 'exhale') {
        breathState = 'hold2';
      } else {
        breathState = 'inhale';
      }
      currentPhaseSec = 4;
    }

    updateBreathingUI();
  }, 1000);
}

function updateBreathingUI() {
  const title = document.getElementById('breath-phase-title');
  const sub = document.getElementById('breath-phase-sub');
  const secText = document.getElementById('breath-phase-sec');
  const timerText = document.getElementById('breath-timer-text');
  const circle = document.getElementById('breathe-anim-circle');

  const min = Math.floor(breathSecondsRemaining / 60);
  const sec = breathSecondsRemaining % 60;
  if (timerText) timerText.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;

  if (secText) secText.textContent = `${currentPhaseSec}s`;

  if (breathState === 'inhale') {
    if (title) title.textContent = "Breathe In Slowly";
    if (sub) sub.textContent = "Fill lungs through your nose";
    if (circle) circle.style.transform = "scale(1.35)";
  } else if (breathState === 'hold1') {
    if (title) title.textContent = "Hold Breath";
    if (sub) sub.textContent = "Feel the calmness settle in";
    if (circle) circle.style.transform = "scale(1.35)";
  } else if (breathState === 'exhale') {
    if (title) title.textContent = "Slow Gentle Exhale";
    if (sub) sub.textContent = "Release all tension through your mouth";
    if (circle) circle.style.transform = "scale(1.0)";
  } else if (breathState === 'hold2') {
    if (title) title.textContent = "Rest & Hold";
    if (sub) sub.textContent = "Stay peaceful and still";
    if (circle) circle.style.transform = "scale(1.0)";
  }
}

// Generative Ambient Soundscape via Web Audio API (Rain / Pink Noise)
window.toggleSoundscape = function(forceState) {
  const btn = document.getElementById('btn-soundscape-toggle');
  const icon = document.getElementById('soundscape-icon');
  const label = document.getElementById('soundscape-label');

  const shouldEnable = typeof forceState === 'boolean' ? forceState : !soundscapeActive;

  if (shouldEnable) {
    initWebAudioSoundscape();
    soundscapeActive = true;
    if (btn) btn.classList.replace('bg-surface-container-high', 'bg-tertiary-fixed');
    if (icon) icon.textContent = 'volume_up';
    if (label) label.textContent = 'Ambient Rain: Playing';
  } else {
    stopWebAudioSoundscape();
    soundscapeActive = false;
    if (btn) btn.classList.replace('bg-tertiary-fixed', 'bg-surface-container-high');
    if (icon) icon.textContent = 'volume_off';
    if (label) label.textContent = 'Ambient Rain: Muted';
  }
};

function initWebAudioSoundscape() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Generate 5 seconds of soft filtered pink noise for rain
    const bufferSize = audioCtx.sampleRate * 4;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to make it sound like gentle ambient rain
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 1.5);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start(0);
    rainNode = whiteNoise;
  } catch (e) {
    console.warn("Web Audio not supported or blocked", e);
  }
}

function stopWebAudioSoundscape() {
  if (gainNode && audioCtx) {
    try {
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        if (rainNode) {
          rainNode.stop();
          rainNode.disconnect();
          rainNode = null;
        }
      }, 550);
    } catch (e) {
      if (rainNode) rainNode.stop();
    }
  }
}

// ==========================================
// 6. Interactive Executive Dashboard
// ==========================================
const departmentData = {
  all: {
    name: "All Departments",
    count: 148,
    completion: "88.4%",
    stress: "31%",
    status: "Healthy Calm",
    bars: [
      { name: "Product & Design", val: "24%", color: "bg-tertiary-fixed-dim", status: "Calm" },
      { name: "Platform Engineering", val: "32%", color: "bg-primary-container", status: "Normal" },
      { name: "Enterprise Sales", val: "42%", color: "bg-secondary-container", status: "Moderate Pressure" },
      { name: "Customer Success", val: "28%", color: "bg-tertiary-fixed-dim", status: "Calm" }
    ]
  },
  design: {
    name: "Product & Design",
    count: 28,
    completion: "96.4%",
    stress: "24%",
    status: "Optimal Focus",
    bars: [
      { name: "Design Sprints", val: "22%", color: "bg-tertiary-fixed-dim", status: "Calm" },
      { name: "Design System", val: "19%", color: "bg-tertiary-fixed-dim", status: "Calm" },
      { name: "User Research", val: "30%", color: "bg-primary-container", status: "Normal" }
    ]
  },
  engineering: {
    name: "Platform Engineering",
    count: 54,
    completion: "91.2%",
    stress: "32%",
    status: "Normal Steady",
    bars: [
      { name: "Core Infrastructure", val: "35%", color: "bg-primary-container", status: "Normal" },
      { name: "Frontend / Mobile", val: "28%", color: "bg-tertiary-fixed-dim", status: "Calm" },
      { name: "Data Engineering", val: "34%", color: "bg-primary-container", status: "Normal" }
    ]
  },
  sales: {
    name: "Enterprise Sales",
    count: 38,
    completion: "82.5%",
    stress: "42%",
    status: "Moderate Pressure",
    bars: [
      { name: "North America AE", val: "46%", color: "bg-error", status: "Watch" },
      { name: "EMEA Expansion", val: "38%", color: "bg-secondary-container", status: "Normal" },
      { name: "Solutions Engineering", val: "32%", color: "bg-primary-container", status: "Calm" }
    ]
  },
  success: {
    name: "Customer Success",
    count: 28,
    completion: "89.0%",
    stress: "28%",
    status: "Healthy Calm",
    bars: [
      { name: "Enterprise Support", val: "31%", color: "bg-primary-container", status: "Normal" },
      { name: "Implementation", val: "25%", color: "bg-tertiary-fixed-dim", status: "Calm" }
    ]
  }
};

window.filterDepartment = function(deptKey, btnElement) {
  // Update pill styles
  const allButtons = document.querySelectorAll('.dept-pill');
  allButtons.forEach(b => {
    b.className = "dept-pill px-3 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all";
  });
  if (btnElement) {
    btnElement.className = "dept-pill px-3 py-1 rounded-full text-xs font-semibold bg-primary text-on-primary shadow-sm transition-all";
  }

  const data = departmentData[deptKey] || departmentData.all;
  const barsContainer = document.getElementById('dash-dept-bars');
  if (!barsContainer) return;

  barsContainer.innerHTML = data.bars.map(item => `
    <div>
      <div class="flex justify-between font-label-md text-label-md mb-1.5">
        <span class="font-medium text-on-surface">${item.name}</span>
        <span class="font-semibold text-primary">${item.val} • ${item.status}</span>
      </div>
      <div class="w-full bg-surface-container h-3 rounded-full overflow-hidden">
        <div class="${item.color} h-full rounded-full transition-all duration-700" style="width: ${item.val}"></div>
      </div>
    </div>
  `).join('');

  showToast(`Filtered dashboard to ${data.name}`, 'tune');
};

window.setTimeWindow = function(windowLabel) {
  const windowBtn = document.getElementById('dash-time-filter');
  if (windowBtn) windowBtn.textContent = windowLabel;
  showToast(`Updated analytics scope to: ${windowLabel}`, 'calendar_today');
};

// ==========================================
// 7. Resilient Navigation & Active State Tracker
// ==========================================
const navSections = ['home', 'how-it-works', 'for-companies', 'features', 'pricing'];

window.setActiveNav = function(targetPath) {
  // Update Desktop Nav
  const desktopLinks = document.querySelectorAll('#desktop-nav .nav-item');
  desktopLinks.forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === targetPath) {
      link.className = "nav-item transition-all bg-surface-container-high text-on-surface font-label-lg rounded-full px-4 py-2 font-medium";
      link.setAttribute('aria-current', 'page');
    } else {
      link.className = "nav-item font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-4 py-2 rounded-full transition-all font-medium";
      link.removeAttribute('aria-current');
    }
  });

  // Update Mobile Nav
  const mobileLinks = document.querySelectorAll('#mobile-nav-drawer .mobile-nav-item');
  mobileLinks.forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === targetPath) {
      link.className = "mobile-nav-item px-4 py-2.5 rounded-xl font-label-lg text-primary bg-primary-fixed/20 font-semibold flex items-center justify-between";
    } else {
      link.className = "mobile-nav-item px-4 py-2.5 rounded-xl font-label-lg text-on-surface hover:bg-surface-container-high transition-colors font-medium flex items-center justify-between";
    }
  });
};

window.toggleMobileMenu = function(forceClose) {
  const menu = document.getElementById('mobile-nav-drawer');
  const icon = document.getElementById('mobile-nav-icon');
  if (!menu) return;

  const shouldClose = forceClose !== undefined ? forceClose : !menu.classList.contains('hidden');
  if (shouldClose) {
    menu.classList.add('hidden');
    if (icon) icon.textContent = 'menu';
  } else {
    menu.classList.remove('hidden');
    if (icon) icon.textContent = 'close';
  }
};

// Setup on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  // Setup light dismiss on all dialogs
  document.querySelectorAll('dialog').forEach(setupDialogLightDismiss);

  // Initialize pricing
  updatePricingDisplay();

  // Check initial hash route
  handleHashRoute();

  // Handle nav clicks smoothly
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      let targetId = href.substring(1);
      if (targetId === 'dashboard') targetId = 'for-companies';

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        // Update active highlight immediately
        const path = this.getAttribute('data-path') || targetId;
        window.setActiveNav(path);

        // Close mobile drawer if open
        window.toggleMobileMenu(true);

        // Scroll to target smoothly with offset clearance
        targetEl.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });

  // Close mobile drawer on Escape key or click outside
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.toggleMobileMenu(true);
    }
  });

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobile-nav-drawer');
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    if (menu && !menu.classList.contains('hidden')) {
      if (!menu.contains(e.target) && !toggleBtn?.contains(e.target)) {
        window.toggleMobileMenu(true);
      }
    }
  });

  // Throttled scroll listener using requestAnimationFrame for active nav pill
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // At top of page -> Home
        if (scrollPos < 200) {
          window.setActiveNav('home');
          isScrolling = false;
          return;
        }

        // At bottom of page -> Pricing
        if (scrollPos + windowHeight >= docHeight - 80) {
          window.setActiveNav('pricing');
          isScrolling = false;
          return;
        }

        // Identify currently visible section
        let currentSection = 'home';
        for (const id of navSections) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Section top is near or above header line (140px threshold)
            if (rect.top <= 140) {
              currentSection = id;
            }
          }
        }
        window.setActiveNav(currentSection);
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });
});

