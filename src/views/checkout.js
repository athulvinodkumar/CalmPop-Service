// CalmPop - Mock Checkout Page & Payment Outcome Simulation
// STRICTLY SIMULATED PAYMENT INTERFACE - NO REAL PAYMENT GATEWAY IS INVOLVED.

import { mockStore, formatINR } from '../mockStore.js';

let pendingCheckoutState = null;
let selectedPaymentMethod = 'upi'; // 'upi' | 'card' | 'netbanking' | 'wallet'
let simulationOutcome = 'success'; // 'success' | 'failure' | 'cancellation'
let isProcessing = false;

export function initCheckout(registrationData, planId = 'growth', billingCycle = 'annual', seats = 45) {
  const order = mockStore.calculateOrder(planId, billingCycle, seats);
  pendingCheckoutState = {
    registrationData,
    order,
    selectedPaymentMethod: 'upi',
    simulationOutcome: 'success'
  };
  return pendingCheckoutState;
}

export function getPendingCheckout() {
  if (!pendingCheckoutState) {
    // Default fallback demo state if visited directly
    pendingCheckoutState = {
      registrationData: {
        companyName: 'Acme Technologies Pvt Ltd',
        companyEmail: 'admin@acmetech.in',
        location: 'Bengaluru, India',
        adminName: 'Ravi Kumar',
        adminEmail: 'ravi@acmetech.in',
        cadenceDay: 'Thursday'
      },
      order: mockStore.calculateOrder('growth', 'annual', 45),
      selectedPaymentMethod: 'upi',
      simulationOutcome: 'success'
    };
  }
  return pendingCheckoutState;
}

export function renderCheckoutView(containerId = 'app-view-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const state = getPendingCheckout();
  const order = state.order;
  const reg = state.registrationData;

  container.innerHTML = `
    <div class="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-12">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header & Breadcrumb -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div class="flex items-center gap-3">
            <a href="#home" class="flex items-center gap-2 group">
              <img alt="CalmPop Logo" class="h-8 w-auto" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
              <span class="font-headline-sm text-xl font-bold text-on-surface">CalmPop</span>
            </a>
            <span class="text-outline">/</span>
            <span class="font-label-md text-sm text-primary font-semibold">Simulated Checkout</span>
          </div>

          <button onclick="window.navigateView('landing')" class="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Pricing</span>
          </button>
        </div>

        <!-- Prominent Demo Mode Watermark Notice -->
        <div class="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <span class="material-symbols-outlined text-amber-600 text-[24px] mt-0.5">verified_user</span>
          <div>
            <h4 class="font-headline-sm text-sm font-bold text-amber-900 uppercase tracking-wide">
              DEMO MODE — NO REAL PAYMENT
            </h4>
            <p class="font-body-sm text-xs text-amber-800 mt-0.5">
              This is a fully simulated payment sandbox for demonstration purposes. <strong>No real money is transferred</strong>, and no external bank or payment gateway will be contacted. Do not enter real financial or banking credentials.
            </p>
          </div>
        </div>

        <!-- Two-Column Layout (Desktop) / Stacked (Mobile) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT COLUMN: Order Summary (5 cols) -->
          <div class="lg:col-span-5 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container space-y-6">
            
            <div class="flex items-center justify-between border-b border-surface-container pb-4">
              <div>
                <span class="font-label-sm text-xs uppercase tracking-wider text-outline font-semibold">Order Summary</span>
                <h3 class="font-headline-sm text-xl font-bold text-on-surface mt-0.5">${reg.companyName}</h3>
                <p class="text-xs text-on-surface-variant">Admin: ${reg.adminName} (${reg.adminEmail})</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                ${order.plan.name}
              </span>
            </div>

            <!-- Breakdown Items -->
            <div class="space-y-3.5 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant">Subscription Plan</span>
                <span class="font-semibold text-on-surface">${order.plan.name} Plan</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant">Employee Seat Allocation</span>
                <span class="font-semibold text-on-surface">${order.seats} Employees</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant">Billing Cadence</span>
                <span class="font-semibold text-on-surface">
                  ${order.billingCycle === 'annual' ? 'Annual (Billed Yearly • 20% off)' : 'Monthly'}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant">Unit Price</span>
                <span class="font-semibold text-on-surface">
                  ${formatINR(order.unitRate, true)} / employee / mo
                </span>
              </div>

              <div class="pt-3 border-t border-surface-container flex justify-between items-center">
                <span class="text-on-surface-variant">Subtotal (${order.periodMonths} mo)</span>
                <span class="font-semibold text-on-surface">${formatINR(order.subtotal)}</span>
              </div>

              <div class="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Estimated GST (${order.gstRate}% Simulated)</span>
                <span>${formatINR(order.taxAmount)}</span>
              </div>

              ${order.annualSavings > 0 ? `
                <div class="p-2.5 rounded-xl bg-tertiary-fixed/30 text-tertiary text-xs font-semibold flex items-center justify-between">
                  <span>Annual Discount Applied (20%)</span>
                  <span>Saving ${formatINR(order.annualSavings)} / yr</span>
                </div>
              ` : ''}
            </div>

            <!-- Total Amount in INR -->
            <div class="pt-4 border-t-2 border-surface-container flex justify-between items-baseline">
              <div>
                <span class="font-label-sm text-xs text-outline uppercase font-semibold block">Total Payable</span>
                <span class="text-[11px] text-on-surface-variant">Inclusive of all demo taxes</span>
              </div>
              <div class="text-right">
                <span class="font-headline-lg text-3xl font-bold text-primary">${formatINR(order.totalAmount)}</span>
                <span class="text-xs text-outline block">${order.billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}</span>
              </div>
            </div>

            <!-- Guarantee Badges -->
            <div class="pt-2 border-t border-surface-container grid grid-cols-2 gap-2 text-[11px] text-outline">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                <span>100% Mock Sandbox</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                <span>Instant Demo Activation</span>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Interactive Mock Payment Methods (7 cols) -->
          <div class="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container space-y-6">
            
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container pb-4">
              <div>
                <h3 class="font-headline-sm text-lg font-bold text-on-surface">Select Simulated Payment Method</h3>
                <p class="text-xs text-on-surface-variant">Choose your preferred Indian payment rail mockup</p>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-xs font-semibold text-on-surface">
                INR Rails
              </span>
            </div>

            <!-- Payment Method Tabs -->
            <div class="grid grid-cols-4 gap-2 p-1.5 bg-surface-container-low rounded-2xl text-xs font-semibold" id="payment-tabs">
              <button onclick="window.selectMockPaymentMethod('upi')" id="tab-upi" class="py-2.5 px-2 rounded-xl transition-all ${selectedPaymentMethod === 'upi' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                <span class="material-symbols-outlined text-[18px] block mx-auto mb-0.5">qr_code_2</span>
                <span>UPI</span>
              </button>
              <button onclick="window.selectMockPaymentMethod('card')" id="tab-card" class="py-2.5 px-2 rounded-xl transition-all ${selectedPaymentMethod === 'card' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                <span class="material-symbols-outlined text-[18px] block mx-auto mb-0.5">credit_card</span>
                <span>Card</span>
              </button>
              <button onclick="window.selectMockPaymentMethod('netbanking')" id="tab-netbanking" class="py-2.5 px-2 rounded-xl transition-all ${selectedPaymentMethod === 'netbanking' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                <span class="material-symbols-outlined text-[18px] block mx-auto mb-0.5">account_balance</span>
                <span>NetBanking</span>
              </button>
              <button onclick="window.selectMockPaymentMethod('wallet')" id="tab-wallet" class="py-2.5 px-2 rounded-xl transition-all ${selectedPaymentMethod === 'wallet' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
                <span class="material-symbols-outlined text-[18px] block mx-auto mb-0.5">account_balance_wallet</span>
                <span>Demo Wallet</span>
              </button>
            </div>

            <!-- Tab Content Container -->
            <div id="payment-method-content">
              ${renderPaymentMethodContent(selectedPaymentMethod, order)}
            </div>

            <!-- Developer Simulation Control Panel -->
            <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container">
              <div class="flex items-center justify-between mb-2">
                <span class="font-label-sm text-xs uppercase font-bold text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-primary">science</span>
                  <span>Demo Controls: Select Simulated Outcome</span>
                </span>
                <span class="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">Test Sandbox</span>
              </div>
              
              <div class="grid grid-cols-3 gap-2 text-xs">
                <label class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${simulationOutcome === 'success' ? 'bg-tertiary-fixed/30 border-tertiary font-bold text-on-tertiary-fixed' : 'bg-surface-container-lowest border-surface-container text-on-surface-variant'}">
                  <input type="radio" name="simOutcome" value="success" ${simulationOutcome === 'success' ? 'checked' : ''} onchange="window.setSimulationOutcome('success')" class="accent-tertiary"/>
                  <span>🟢 Success</span>
                </label>

                <label class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${simulationOutcome === 'failure' ? 'bg-error/15 border-error font-bold text-error' : 'bg-surface-container-lowest border-surface-container text-on-surface-variant'}">
                  <input type="radio" name="simOutcome" value="failure" ${simulationOutcome === 'failure' ? 'checked' : ''} onchange="window.setSimulationOutcome('failure')" class="accent-error"/>
                  <span>🔴 Failure</span>
                </label>

                <label class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${simulationOutcome === 'cancellation' ? 'bg-yellow-500/15 border-yellow-500 font-bold text-yellow-800' : 'bg-surface-container-lowest border-surface-container text-on-surface-variant'}">
                  <input type="radio" name="simOutcome" value="cancellation" ${simulationOutcome === 'cancellation' ? 'checked' : ''} onchange="window.setSimulationOutcome('cancellation')" class="accent-yellow-500"/>
                  <span>🟡 Cancel</span>
                </label>
              </div>
              <p class="text-[11px] text-outline mt-2">
                Simulate how CalmPop handles successful subscription activation, card decline error states, or user cancellation without charging real money.
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3 pt-2">
              <button id="btn-pay-demo" onclick="window.executeMockPayment()" class="w-full py-4 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-lg font-bold hover:bg-tertiary-fixed-dim transition-all shadow-lg flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[20px]">lock</span>
                <span id="btn-pay-text">Pay ${formatINR(order.totalAmount)} — Demo</span>
              </button>

              <button onclick="window.navigateView('landing')" class="w-full py-2.5 text-center text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
                Cancel and return to pricing
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}

function renderPaymentMethodContent(method, order) {
  if (method === 'upi') {
    return `
      <div class="space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button type="button" class="p-3 rounded-2xl border-2 border-primary/40 bg-primary/5 text-center transition-all">
            <span class="font-bold text-xs text-primary block">Google Pay</span>
            <span class="text-[10px] text-outline">Simulated</span>
          </button>
          <button type="button" class="p-3 rounded-2xl border border-surface-container bg-surface-container-low text-center hover:border-primary transition-all">
            <span class="font-bold text-xs text-on-surface block">PhonePe</span>
            <span class="text-[10px] text-outline">Simulated</span>
          </button>
          <button type="button" class="p-3 rounded-2xl border border-surface-container bg-surface-container-low text-center hover:border-primary transition-all">
            <span class="font-bold text-xs text-on-surface block">Paytm UPI</span>
            <span class="text-[10px] text-outline">Simulated</span>
          </button>
          <button type="button" class="p-3 rounded-2xl border border-surface-container bg-surface-container-low text-center hover:border-primary transition-all">
            <span class="font-bold text-xs text-on-surface block">BHIM UPI</span>
            <span class="text-[10px] text-outline">Simulated</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-surface-container-low border border-surface-container">
          <!-- Decorative Mock QR Code -->
          <div class="w-36 h-36 bg-surface-container-lowest rounded-xl p-2 border border-surface-container flex flex-col items-center justify-center flex-shrink-0 text-center shadow-inner">
            <svg class="w-24 h-24 text-on-surface" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h-4v4h4v-4zm-4 4h-2v2h4v-4h-2v2zm6 0h-2v2h2v-2zm-6-6h2v2h-2v-2zm4 0h2v2h-2v-2zM6 6h2v2H6V6zm10 0h2v2h-2V6zM6 18h2v2H6v-2z"/>
            </svg>
            <span class="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-1">
              DEMO QR ONLY
            </span>
          </div>

          <div class="flex-1 space-y-2 text-left">
            <label class="block text-xs font-semibold text-on-surface">Or enter Demo Virtual Payment Address (VPA)</label>
            <div class="flex items-center gap-2">
              <input type="text" id="demo-upi-id" value="admin@okhdfcbank" class="flex-1 px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container text-sm font-mono focus:outline-none focus:border-primary"/>
              <button onclick="document.getElementById('demo-upi-id').value = 'calmpop.demo@upi'" class="px-2.5 py-2 rounded-xl bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest">
                Fill Test
              </button>
            </div>
            <p class="text-[11px] text-outline">
              * Decorative mock QR code. Never scan with real UPI apps.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  if (method === 'card') {
    return `
      <div class="space-y-4">
        <!-- Interactive Card Mockup Preview -->
        <div class="w-full max-w-sm mx-auto h-44 rounded-2xl bg-gradient-to-tr from-primary via-primary-container to-secondary p-5 text-on-primary shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          
          <div class="flex justify-between items-center">
            <span class="font-label-sm text-xs uppercase font-bold tracking-wider text-secondary-fixed">DEMO CORPORATE CARD</span>
            <span class="font-headline-sm text-sm font-bold">RuPay / Visa</span>
          </div>

          <div class="font-mono text-lg tracking-widest my-2">
            •••• •••• •••• 4242
          </div>

          <div class="flex justify-between items-end text-xs">
            <div>
              <span class="text-[9px] text-white/70 block uppercase">Cardholder</span>
              <span class="font-semibold uppercase tracking-wide">ORGANIZATION ADMIN</span>
            </div>
            <div>
              <span class="text-[9px] text-white/70 block uppercase">Expires</span>
              <span class="font-semibold">12/28</span>
            </div>
          </div>
        </div>

        <!-- Dummy Card Fields -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Demo Card Number</label>
            <div class="flex gap-2">
              <input type="text" value="4111 2222 3333 4242" readonly class="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm font-mono text-on-surface focus:outline-none"/>
              <button type="button" onclick="window.showToast('Using verified test demo card', 'credit_card')" class="px-3 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface">
                Demo Card
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">Expiry Date</label>
              <input type="text" value="12/28" readonly class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm font-mono text-on-surface"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">CVV / CVC</label>
              <input type="password" value="888" readonly class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm font-mono text-on-surface"/>
            </div>
          </div>
          <p class="text-[11px] text-outline">
            Pre-filled with fictional demonstration card values. Never enter real credit card numbers.
          </p>
        </div>
      </div>
    `;
  }

  if (method === 'netbanking') {
    return `
      <div class="space-y-3">
        <label class="block text-xs font-semibold text-on-surface">Select Popular Indian Bank (Simulated)</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <label class="p-3 rounded-2xl border-2 border-primary/40 bg-primary/5 flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mockBank" checked class="accent-primary"/>
            <span class="text-xs font-bold text-on-surface">HDFC Bank</span>
          </label>
          <label class="p-3 rounded-2xl border border-surface-container bg-surface-container-low hover:border-primary flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mockBank" class="accent-primary"/>
            <span class="text-xs font-semibold text-on-surface">ICICI Bank</span>
          </label>
          <label class="p-3 rounded-2xl border border-surface-container bg-surface-container-low hover:border-primary flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mockBank" class="accent-primary"/>
            <span class="text-xs font-semibold text-on-surface">State Bank (SBI)</span>
          </label>
          <label class="p-3 rounded-2xl border border-surface-container bg-surface-container-low hover:border-primary flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mockBank" class="accent-primary"/>
            <span class="text-xs font-semibold text-on-surface">Axis Bank</span>
          </label>
          <label class="p-3 rounded-2xl border border-surface-container bg-surface-container-low hover:border-primary flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mockBank" class="accent-primary"/>
            <span class="text-xs font-semibold text-on-surface">Kotak Mahindra</span>
          </label>
          <label class="p-3 rounded-2xl border border-surface-container bg-surface-container-low hover:border-primary flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mockBank" class="accent-primary"/>
            <span class="text-xs font-semibold text-on-surface">Punjab National</span>
          </label>
        </div>
        <p class="text-[11px] text-outline">
          Selecting a bank will simulate the authorization redirect locally without contacting real banking servers.
        </p>
      </div>
    `;
  }

  if (method === 'wallet') {
    return `
      <div class="p-5 rounded-2xl bg-surface-container-low border border-surface-container space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <h4 class="font-headline-sm text-sm font-bold text-on-surface">CalmPop Corporate Credit Wallet</h4>
              <p class="text-xs text-on-surface-variant">Instant zero-fee simulated corporate debit</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed/40 text-tertiary text-xs font-bold">
            Demo Credits
          </span>
        </div>

        <div class="p-3.5 bg-surface-container-lowest rounded-xl flex items-center justify-between">
          <span class="text-xs text-outline font-medium">Available Demonstration Balance:</span>
          <span class="font-headline-sm text-base font-bold text-primary">₹50,000.00</span>
        </div>

        <p class="text-[11px] text-outline">
          Sufficient demo balance available to fulfill order of ${formatINR(order.totalAmount)}.
        </p>
      </div>
    `;
  }
}

// Global UI Handlers
window.selectMockPaymentMethod = function(method) {
  selectedPaymentMethod = method;
  const content = document.getElementById('payment-method-content');
  if (content) {
    const state = getPendingCheckout();
    content.innerHTML = renderPaymentMethodContent(method, state.order);
  }
  // Update tab highlights
  ['upi', 'card', 'netbanking', 'wallet'].forEach(m => {
    const tab = document.getElementById(`tab-${m}`);
    if (tab) {
      if (m === method) {
        tab.className = "py-2.5 px-2 rounded-xl transition-all bg-surface-container-lowest text-primary shadow-sm font-bold";
      } else {
        tab.className = "py-2.5 px-2 rounded-xl transition-all text-on-surface-variant hover:text-on-surface";
      }
    }
  });
};

window.setSimulationOutcome = function(outcome) {
  simulationOutcome = outcome;
  renderCheckoutView();
};

window.executeMockPayment = function() {
  if (isProcessing) return;
  isProcessing = true;

  const btn = document.getElementById('btn-pay-demo');
  const btnText = document.getElementById('btn-pay-text');
  if (btn) btn.disabled = true;
  if (btnText) btnText.innerHTML = `<span class="animate-pulse">Simulating Secure Payment Processing...</span>`;

  // Simulate realistic network delay (1.2 seconds)
  setTimeout(() => {
    isProcessing = false;
    const state = getPendingCheckout();
    const order = state.order;
    const reg = state.registrationData;

    if (simulationOutcome === 'success') {
      // 1. Generate unique mock transaction ID
      const mockTxId = `DEMO-CP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const mockInvoice = `INV-DEMO-${Date.now().toString().slice(-6)}`;

      const txRecord = {
        id: mockTxId,
        invoiceNumber: mockInvoice,
        planId: order.planId,
        planName: order.plan.name,
        billingCycle: order.billingCycle,
        seats: order.seats,
        unitRate: order.unitRate,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        paymentMethod: selectedPaymentMethod.toUpperCase() + ' (Mock)',
        status: 'success',
        createdAt: new Date().toISOString(),
        isSimulated: true
      };

      // 2. Complete demo company registration & activate subscription in local store
      const newCompany = mockStore.createCompany(reg, order, txRecord);

      // 3. Render Success View
      renderSuccessView(newCompany, txRecord, order);

    } else if (simulationOutcome === 'failure') {
      // Record failed transaction attempt
      const failedTxId = `FAIL-CP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      mockStore.recordTransaction({
        id: failedTxId,
        invoiceNumber: `ERR-DEMO-${Date.now().toString().slice(-4)}`,
        companyName: reg.companyName,
        planId: order.planId,
        planName: order.plan.name,
        totalAmount: order.totalAmount,
        paymentMethod: selectedPaymentMethod.toUpperCase() + ' (Mock)',
        status: 'failed',
        failureReason: 'Transaction declined by mock issuing bank (ERR_DEMO_CARD_DECLINED).',
        createdAt: new Date().toISOString(),
        isSimulated: true
      });

      renderFailureView(order);

    } else {
      // Cancellation
      const cancelTxId = `CANC-CP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      mockStore.recordTransaction({
        id: cancelTxId,
        invoiceNumber: `CAN-DEMO-${Date.now().toString().slice(-4)}`,
        companyName: reg.companyName,
        planId: order.planId,
        planName: order.plan.name,
        totalAmount: order.totalAmount,
        paymentMethod: selectedPaymentMethod.toUpperCase() + ' (Mock)',
        status: 'cancelled',
        failureReason: 'User cancelled mock checkout before completion.',
        createdAt: new Date().toISOString(),
        isSimulated: true
      });

      renderCancellationView(order);
    }
  }, 1200);
};

// Render Outcome Screens
export function renderSuccessView(company, transaction, order) {
  const container = document.getElementById('app-view-container');
  if (!container) return;

  container.innerHTML = `
    <div class="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-12">
      <div class="max-w-2xl mx-auto bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-xl border border-surface-container text-center relative overflow-hidden">
        
        <div class="w-20 h-20 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <span class="material-symbols-outlined text-[44px]">verified</span>
        </div>

        <span class="px-3 py-1 rounded-full bg-tertiary-fixed/30 text-tertiary text-xs font-bold uppercase tracking-wider">
          SIMULATED — NOT A REAL PAYMENT
        </span>

        <h2 class="font-headline-lg text-3xl font-bold text-on-surface mt-2 mb-2">
          Demo Payment Successful!
        </h2>
        <p class="font-body-md text-sm text-on-surface-variant max-w-md mx-auto mb-8">
          Your demonstration subscription for <strong>${company.name}</strong> is now fully active in our local mock database.
        </p>

        <!-- Transaction Details Card -->
        <div class="bg-surface-container-low rounded-2xl p-6 text-left space-y-3 mb-8 border border-surface-container text-sm">
          <div class="flex justify-between items-center border-b border-surface-container pb-2">
            <span class="text-on-surface-variant">Amount Paid:</span>
            <span class="font-headline-sm text-lg font-bold text-primary">${formatINR(transaction.totalAmount)}</span>
          </div>

          <div class="flex justify-between items-center border-b border-surface-container pb-2">
            <span class="text-on-surface-variant">Mock Transaction ID:</span>
            <span class="font-mono text-xs font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded">${transaction.id}</span>
          </div>

          <div class="flex justify-between items-center border-b border-surface-container pb-2">
            <span class="text-on-surface-variant">Generated Company ID:</span>
            <span class="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">${company.id}</span>
          </div>

          <div class="flex justify-between items-center border-b border-surface-container pb-2">
            <span class="text-on-surface-variant">Subscription Plan:</span>
            <span class="font-semibold text-on-surface">${company.subscription.planName} (${company.subscription.seats} Seats)</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-on-surface-variant">Billing Cycle:</span>
            <span class="font-semibold text-on-surface uppercase text-xs">${company.subscription.billingCycle}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onclick="window.navigateView('admin', '${company.id}')" class="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-on-primary font-label-lg font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2">
            <span>Open Company Admin Dashboard</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <button onclick="window.renderReceiptView('${transaction.id}')" class="w-full sm:w-auto px-6 py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg font-semibold transition-all flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>View Mock Receipt</span>
          </button>
        </div>

        <div class="mt-8 pt-4 border-t border-surface-container text-xs text-outline">
          * This confirmation was generated in simulation mode. No funds were debited from any real bank account.
        </div>

      </div>
    </div>
  `;
}

export function renderFailureView(order) {
  const container = document.getElementById('app-view-container');
  if (!container) return;

  container.innerHTML = `
    <div class="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-12">
      <div class="max-w-xl mx-auto bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-xl border border-surface-container text-center">
        
        <div class="w-20 h-20 rounded-full bg-error/15 text-error flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span class="material-symbols-outlined text-[44px]">cancel</span>
        </div>

        <span class="px-3 py-1 rounded-full bg-error/10 text-error text-xs font-bold uppercase tracking-wider">
          SIMULATED PAYMENT FAILED
        </span>

        <h2 class="font-headline-lg text-2xl font-bold text-on-surface mt-2 mb-2">
          Transaction Unsuccessful
        </h2>
        <p class="font-body-md text-sm text-on-surface-variant max-w-md mx-auto mb-6">
          The simulated payment attempt of <strong>${formatINR(order.totalAmount)}</strong> failed. <strong>Your subscription has NOT been activated.</strong>
        </p>

        <!-- Simulated Error Diagnostic -->
        <div class="bg-surface-container-low rounded-2xl p-5 text-left mb-6 space-y-2 border border-surface-container text-xs">
          <div class="flex justify-between text-on-surface">
            <span class="text-outline">Error Code:</span>
            <span class="font-mono font-bold text-error">ERR_DEMO_CARD_DECLINED</span>
          </div>
          <div class="flex justify-between text-on-surface">
            <span class="text-outline">Fictional Reason:</span>
            <span>Simulated bank rejection / insufficient demo balance</span>
          </div>
          <div class="flex justify-between text-on-surface">
            <span class="text-outline">Subscription Status:</span>
            <span class="font-semibold text-error">Inactive</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onclick="window.navigateView('checkout')" class="w-full sm:w-auto px-6 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
            <span>Retry Demo Payment</span>
          </button>
          
          <button onclick="window.navigateView('landing')" class="w-full sm:w-auto px-6 py-3.5 rounded-full bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-all">
            Return to Pricing
          </button>
        </div>

      </div>
    </div>
  `;
}

export function renderCancellationView(order) {
  const container = document.getElementById('app-view-container');
  if (!container) return;

  container.innerHTML = `
    <div class="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-12">
      <div class="max-w-xl mx-auto bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-xl border border-surface-container text-center">
        
        <div class="w-20 h-20 rounded-full bg-yellow-500/15 text-yellow-700 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span class="material-symbols-outlined text-[44px]">pause_circle</span>
        </div>

        <span class="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-800 text-xs font-bold uppercase tracking-wider">
          SIMULATED CHECKOUT CANCELLED
        </span>

        <h2 class="font-headline-lg text-2xl font-bold text-on-surface mt-2 mb-2">
          Payment Cancelled
        </h2>
        <p class="font-body-md text-sm text-on-surface-variant max-w-md mx-auto mb-6">
          You cancelled the checkout process. No demonstration payment was processed and no subscription has been activated.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onclick="window.navigateView('checkout')" class="w-full sm:w-auto px-6 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>Resume Demo Checkout</span>
          </button>
          
          <button onclick="window.navigateView('landing')" class="w-full sm:w-auto px-6 py-3.5 rounded-full bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-all">
            Return to Homepage
          </button>
        </div>

      </div>
    </div>
  `;
}
