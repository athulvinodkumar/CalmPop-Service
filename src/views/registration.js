// CalmPop - Company Registration Flow
// Collects organization and administrator credentials, selected subscription plan and billing cycle,
// validates inputs, and directs user to the mock checkout summary.

import { mockStore, formatINR } from '../mockStore.js';
import { initCheckout } from './checkout.js';

let registrationPlanId = 'growth';
let registrationBillingCycle = 'annual';
let registrationSeats = 45;

export function openRegistrationModal(preselectedPlan = 'growth', billingCycle = 'annual', seats = 45) {
  registrationPlanId = preselectedPlan;
  registrationBillingCycle = billingCycle;
  registrationSeats = parseInt(seats, 10) || 45;

  const modal = document.getElementById('registration-modal');
  if (!modal) return;

  renderRegistrationForm();
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  }
}

export function renderRegistrationForm() {
  const container = document.getElementById('registration-modal-content');
  if (!container) return;

  const plans = mockStore.getPlans();
  const selectedPlan = plans[registrationPlanId] || plans.growth;

  container.innerHTML = `
    <div>
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            Step 1 of 2 • Organization Setup
          </span>
          <span class="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
            Demo Mode
          </span>
        </div>
        <h3 class="font-headline-sm text-2xl font-bold text-on-surface mt-2 mb-1">
          Register Your Organization
        </h3>
        <p class="font-body-sm text-xs text-on-surface-variant">
          Enter company details to initiate your proactive workplace calm cadence.
        </p>
      </div>

      <!-- Registration Form -->
      <form id="org-registration-form" onsubmit="window.handleRegistrationSubmit(event)" class="space-y-4">
        
        <!-- Company Info Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-company-name">Company Name *</label>
            <input type="text" id="reg-company-name" required placeholder="e.g. Nexus AI Labs" value="Nexus AI Labs" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-company-email">Company Work Email *</label>
            <input type="email" id="reg-company-email" required placeholder="admin@nexusai.in" value="admin@nexusai.in" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-location">Company Location / Headquarters</label>
          <input type="text" id="reg-location" placeholder="e.g. Bengaluru, Karnataka, India" value="Bengaluru, Karnataka, India" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
        </div>

        <!-- Administrator Info Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-surface-container">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-admin-name">Administrator Full Name *</label>
            <input type="text" id="reg-admin-name" required placeholder="e.g. Vikram Verma" value="Vikram Verma" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-admin-email">Admin Direct Email *</label>
            <input type="email" id="reg-admin-email" required placeholder="vikram@nexusai.in" value="vikram@nexusai.in" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
          </div>
        </div>

        <!-- Username & Password Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-username">Username</label>
            <input type="text" id="reg-username" placeholder="vikramverma" value="vikramverma" class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-password">Demo Password *</label>
            <input type="password" id="reg-password" required placeholder="••••••••" value="demo1234" class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1" for="reg-confirm-password">Confirm Password *</label>
            <input type="password" id="reg-confirm-password" required placeholder="••••••••" value="demo1234" class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"/>
          </div>
        </div>

        <!-- Plan & Billing Selector -->
        <div class="p-4 bg-surface-container-low rounded-2xl border border-surface-container space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-on-surface uppercase tracking-wide">Selected Plan & Cadence</span>
            <div class="flex items-center gap-1.5 text-xs">
              <button type="button" onclick="window.setRegBilling('monthly')" class="px-2.5 py-1 rounded-lg ${registrationBillingCycle === 'monthly' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                Monthly
              </button>
              <button type="button" onclick="window.setRegBilling('annual')" class="px-2.5 py-1 rounded-lg ${registrationBillingCycle === 'annual' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs">
            <button type="button" onclick="window.setRegPlan('starter')" class="p-2.5 rounded-xl border text-left transition-all ${registrationPlanId === 'starter' ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-surface-container bg-surface-container-lowest text-on-surface-variant'}">
              <p class="font-bold">Starter</p>
              <p class="text-[10px] text-outline">Up to 25 seats</p>
            </button>

            <button type="button" onclick="window.setRegPlan('growth')" class="p-2.5 rounded-xl border text-left transition-all ${registrationPlanId === 'growth' ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-surface-container bg-surface-container-lowest text-on-surface-variant'}">
              <p class="font-bold">Growth</p>
              <p class="text-[10px] text-outline">Up to 100 seats</p>
            </button>

            <button type="button" onclick="window.setRegPlan('enterprise')" class="p-2.5 rounded-xl border text-left transition-all ${registrationPlanId === 'enterprise' ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-surface-container bg-surface-container-lowest text-on-surface-variant'}">
              <p class="font-bold">Enterprise</p>
              <p class="text-[10px] text-outline">Custom volume</p>
            </button>
          </div>

          <!-- Employee Seats Count Input -->
          <div class="flex items-center justify-between pt-1">
            <label class="text-xs font-semibold text-on-surface" for="reg-seats">Employee Seats Allocation:</label>
            <div class="flex items-center gap-2">
              <input type="number" id="reg-seats" min="5" max="${selectedPlan.employeeLimit}" value="${registrationSeats}" onchange="window.setRegSeats(this.value)" class="w-20 px-3 py-1 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface font-bold text-center"/>
              <span class="text-xs text-outline">/ ${selectedPlan.employeeLimit} max</span>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-lg font-bold hover:bg-tertiary-fixed-dim transition-all shadow-md flex items-center justify-center gap-2">
            <span>Proceed to Simulated Checkout</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <p class="text-[11px] text-outline text-center">
          * Demo registration. No real passwords or billing details are transmitted to external servers.
        </p>

      </form>
    </div>
  `;
}

// Global Registration Action Handlers
window.setRegPlan = function(planId) {
  registrationPlanId = planId;
  const plans = mockStore.getPlans();
  const plan = plans[planId] || plans.growth;
  if (registrationSeats > plan.employeeLimit) {
    registrationSeats = plan.employeeLimit;
  }
  renderRegistrationForm();
};

window.setRegBilling = function(cycle) {
  registrationBillingCycle = cycle;
  renderRegistrationForm();
};

window.setRegSeats = function(val) {
  registrationSeats = parseInt(val, 10) || 10;
  renderRegistrationForm();
};

window.handleRegistrationSubmit = function(e) {
  e.preventDefault();

  const companyName = document.getElementById('reg-company-name')?.value.trim();
  const companyEmail = document.getElementById('reg-company-email')?.value.trim();
  const location = document.getElementById('reg-location')?.value.trim();
  const adminName = document.getElementById('reg-admin-name')?.value.trim();
  const adminEmail = document.getElementById('reg-admin-email')?.value.trim();
  const username = document.getElementById('reg-username')?.value.trim();
  const password = document.getElementById('reg-password')?.value;
  const confirmPassword = document.getElementById('reg-confirm-password')?.value;
  const seats = parseInt(document.getElementById('reg-seats')?.value, 10) || registrationSeats;

  if (!companyName || !companyEmail || !adminName || !adminEmail) {
    alert("Please fill in all required company and administrator fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Password and Confirm Password do not match. Please verify.");
    return;
  }

  const registrationData = {
    companyName,
    companyEmail,
    location,
    adminName,
    adminEmail,
    username,
    cadenceDay: 'Thursday'
  };

  // Close modal
  const modal = document.getElementById('registration-modal');
  if (modal && typeof modal.close === 'function') {
    modal.close();
  }

  // Initialize checkout state
  initCheckout(registrationData, registrationPlanId, registrationBillingCycle, seats);

  // Navigate to checkout view
  window.navigateView('checkout');
};
