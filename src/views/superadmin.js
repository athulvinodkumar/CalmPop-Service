// CalmPop - Platform Superadmin Dashboard
// Exclusively for CalmPop platform owner (Demo Administrator Role).
// Provides central INR price configuration, company suspension/activation,
// global transaction audit log, and factory demo data reset.

import { mockStore, formatINR, DEFAULT_PLANS } from '../mockStore.js';

let superadminSearchQuery = '';
let activeSuperadminTab = 'companies'; // 'companies' | 'pricing' | 'transactions'

export function renderSuperadminView(containerId = 'app-view-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const companies = mockStore.getCompanies();
  const transactions = mockStore.getTransactions();
  const plans = mockStore.getPlans();

  const activeSubscriptions = companies.filter(c => c.subscription && c.subscription.status === 'active').length;
  const successfulTx = transactions.filter(t => t.status === 'success');
  const failedTx = transactions.filter(t => t.status === 'failed');
  const cancelledTx = transactions.filter(t => t.status === 'cancelled');

  const totalSimulatedVolume = successfulTx.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  let filteredCompanies = companies;
  if (superadminSearchQuery) {
    filteredCompanies = companies.filter(c => 
      c.name.toLowerCase().includes(superadminSearchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(superadminSearchQuery.toLowerCase()) ||
      c.adminEmail.toLowerCase().includes(superadminSearchQuery.toLowerCase())
    );
  }

  container.innerHTML = `
    <div class="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-12">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header & Role Notice -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container pb-6">
          <div class="flex items-center gap-3">
            <a href="#home" onclick="window.navigateView('landing')" class="flex items-center gap-2">
              <img alt="CalmPop Logo" class="h-8 w-auto" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
              <span class="font-headline-sm text-xl font-bold text-on-surface">CalmPop</span>
            </a>
            <span class="text-outline">/</span>
            <span class="px-3 py-1 rounded-full bg-on-tertiary-fixed text-tertiary-fixed text-xs font-bold uppercase tracking-wider">
              Platform Superadmin
            </span>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="window.confirmResetDemoData()" class="px-4 py-2 rounded-full bg-error/15 text-error hover:bg-error/25 font-bold text-xs transition-colors flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset Demo Data</span>
            </button>

            <button onclick="window.navigateView('landing')" class="px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-colors">
              Return to Website
            </button>
          </div>
        </div>

        <!-- Superadmin KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Total Demo Companies</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-3xl font-bold text-on-surface">${companies.length}</span>
              <span class="text-xs text-tertiary font-semibold">Registered</span>
            </div>
            <span class="text-[11px] text-outline mt-2 block">Organizations on sandbox platform</span>
          </div>

          <div class="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Active Demo Subscriptions</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-3xl font-bold text-primary">${activeSubscriptions}</span>
              <span class="text-xs text-on-surface-variant font-medium">/ ${companies.length} Active</span>
            </div>
            <span class="text-[11px] text-outline mt-2 block">Proactive wellness seats enabled</span>
          </div>

          <div class="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Simulated Payment Outcomes</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-2xl font-bold text-tertiary">${successfulTx.length} OK</span>
              <span class="text-xs text-error font-bold">${failedTx.length} Fail</span>
              <span class="text-xs text-yellow-700 font-bold">${cancelledTx.length} Canc</span>
            </div>
            <span class="text-[11px] text-outline mt-2 block">${transactions.length} total simulated checkout attempts</span>
          </div>

          <div class="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Simulated INR Volume</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-2xl font-bold text-on-surface">${formatINR(totalSimulatedVolume)}</span>
            </div>
            <span class="text-[11px] text-outline mt-2 block">100% Mock Transaction Value</span>
          </div>

        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-surface-container pb-2">
          <button onclick="window.switchSuperadminTab('companies')" class="px-5 py-2.5 rounded-full font-label-md text-xs font-bold transition-all ${activeSuperadminTab === 'companies' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
            Companies (${companies.length})
          </button>
          <button onclick="window.switchSuperadminTab('pricing')" class="px-5 py-2.5 rounded-full font-label-md text-xs font-bold transition-all ${activeSuperadminTab === 'pricing' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
            INR Pricing & Limits
          </button>
          <button onclick="window.switchSuperadminTab('transactions')" class="px-5 py-2.5 rounded-full font-label-md text-xs font-bold transition-all ${activeSuperadminTab === 'transactions' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
            Transaction Audit Log (${transactions.length})
          </button>
        </div>

        <!-- Tab Content -->
        <div id="superadmin-content">
          ${renderSuperadminTabContent(activeSuperadminTab, filteredCompanies, plans, transactions)}
        </div>

      </div>
    </div>
  `;
}

function renderSuperadminTabContent(tab, filteredCompanies, plans, transactions) {
  // 1. COMPANIES MANAGEMENT TAB
  if (tab === 'companies') {
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-surface-container">
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <span class="material-symbols-outlined text-outline text-[20px]">search</span>
            <input type="text" placeholder="Search companies by name, ID, or admin email..." value="${superadminSearchQuery}" oninput="window.setSuperadminSearch(this.value)" class="w-full text-xs bg-transparent border-none outline-none text-on-surface focus:ring-0"/>
          </div>
          <span class="text-xs text-outline">${filteredCompanies.length} organizations registered</span>
        </div>

        <div class="bg-surface-container-lowest rounded-3xl border border-surface-container overflow-hidden shadow-sm">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-outline uppercase border-b border-surface-container">
                <th class="py-3.5 px-4">Company & ID</th>
                <th class="py-3.5 px-4">Admin Contact</th>
                <th class="py-3.5 px-4">Plan & Seats</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              ${filteredCompanies.map(c => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-4 px-4">
                    <p class="font-bold text-sm text-on-surface">${c.name}</p>
                    <p class="font-mono text-xs text-primary font-semibold">${c.id}</p>
                    <p class="text-[11px] text-outline">${c.location}</p>
                  </td>
                  <td class="py-4 px-4">
                    <p class="font-semibold text-on-surface">${c.adminName || 'Admin'}</p>
                    <p class="text-on-surface-variant text-[11px]">${c.adminEmail || c.email}</p>
                  </td>
                  <td class="py-4 px-4">
                    <p class="font-bold text-primary capitalize">${c.subscription.planName} Plan</p>
                    <p class="text-on-surface-variant text-[11px]">${c.employees.length} employees / ${c.subscription.seatLimit} max seats</p>
                    <p class="text-outline text-[10px] uppercase">${c.subscription.billingCycle} billing</p>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${c.status === 'active' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error/15 text-error'}">
                      ${c.status.toUpperCase()}
                    </span>
                  </td>
                  <td class="py-4 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button onclick="window.navigateView('admin', '${c.id}')" class="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all">
                        Open Dashboard
                      </button>
                      <button onclick="window.toggleCompanyStatus('${c.id}')" class="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface transition-colors">
                        ${c.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 2. INR PRICING CONFIGURATION TAB
  if (tab === 'pricing') {
    return `
      <div class="space-y-6 max-w-4xl">
        <div class="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-primary space-y-1">
          <p class="font-bold">⚡ Central Demonstration Pricing Manager</p>
          <p class="text-on-surface-variant">Changes made here instantly update the landing page pricing cards, seat calculator, and checkout totals.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Starter Plan Config -->
          <div class="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-headline-sm text-base font-bold text-on-surface">Starter Plan</h4>
              <span class="text-xs bg-surface-container-high px-2.5 py-0.5 rounded-full font-bold">Small Teams</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-outline mb-1">Monthly Price per Employee (INR)</label>
              <input type="number" id="price-starter-mo" value="${plans.starter.monthlyPricePerEmployee}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-bold"/>
            </div>

            <div>
              <label class="block text-xs font-semibold text-outline mb-1">Annual Equivalent per Employee/mo (INR)</label>
              <input type="number" id="price-starter-yr" value="${plans.starter.annualPricePerEmployee}" step="0.1" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-bold"/>
            </div>

            <div>
              <label class="block text-xs font-semibold text-outline mb-1">Seat Limit</label>
              <input type="number" id="price-starter-limit" value="${plans.starter.employeeLimit}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-bold"/>
            </div>

            <button onclick="window.savePlanPricing('starter')" class="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all">
              Save Starter Pricing
            </button>
          </div>

          <!-- Growth Plan Config -->
          <div class="bg-surface-container-lowest p-6 rounded-3xl border-2 border-tertiary-fixed space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-headline-sm text-base font-bold text-on-surface">Growth Plan (Popular)</h4>
              <span class="text-xs bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-0.5 rounded-full font-bold">Scaling</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-outline mb-1">Monthly Price per Employee (INR)</label>
              <input type="number" id="price-growth-mo" value="${plans.growth.monthlyPricePerEmployee}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-bold"/>
            </div>

            <div>
              <label class="block text-xs font-semibold text-outline mb-1">Annual Equivalent per Employee/mo (INR)</label>
              <input type="number" id="price-growth-yr" value="${plans.growth.annualPricePerEmployee}" step="0.1" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-bold"/>
            </div>

            <div>
              <label class="block text-xs font-semibold text-outline mb-1">Seat Limit</label>
              <input type="number" id="price-growth-limit" value="${plans.growth.employeeLimit}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-bold"/>
            </div>

            <button onclick="window.savePlanPricing('growth')" class="w-full py-2.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs hover:bg-tertiary-fixed-dim transition-all">
              Save Growth Pricing
            </button>
          </div>

        </div>
      </div>
    `;
  }

  // 3. TRANSACTIONS AUDIT LOG TAB
  if (tab === 'transactions') {
    return `
      <div class="bg-surface-container-lowest rounded-3xl border border-surface-container overflow-hidden shadow-sm">
        <div class="p-5 border-b border-surface-container flex items-center justify-between">
          <div>
            <h4 class="font-headline-sm text-base font-bold text-on-surface">Platform Mock Transaction Ledger</h4>
            <p class="text-xs text-on-surface-variant">Audit trail of all simulated payment attempts</p>
          </div>
          <span class="text-xs text-outline">${transactions.length} records in demo database</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-outline uppercase border-b border-surface-container">
                <th class="py-3 px-4">Transaction ID</th>
                <th class="py-3 px-4">Company Name</th>
                <th class="py-3 px-4">Plan / Seats</th>
                <th class="py-3 px-4">Amount (INR)</th>
                <th class="py-3 px-4">Method</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              ${transactions.map(t => `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-primary">${t.id}</td>
                  <td class="py-3.5 px-4 font-semibold text-on-surface">${t.companyName || 'Unknown Org'}</td>
                  <td class="py-3.5 px-4 text-on-surface-variant">${t.planName} (${t.seats || 'N/A'} seats)</td>
                  <td class="py-3.5 px-4 font-bold text-on-surface">${formatINR(t.totalAmount)}</td>
                  <td class="py-3.5 px-4">${t.paymentMethod || 'Simulated'}</td>
                  <td class="py-3.5 px-4 text-center">
                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${t.status === 'success' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : t.status === 'failed' ? 'bg-error/15 text-error' : 'bg-yellow-500/15 text-yellow-800'}">
                      ${t.status.toUpperCase()}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right text-outline">${new Date(t.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

// Global Superadmin Action Hooks
window.switchSuperadminTab = function(tab) {
  activeSuperadminTab = tab;
  renderSuperadminView();
};

window.setSuperadminSearch = function(query) {
  superadminSearchQuery = query;
  renderSuperadminView();
};

window.toggleCompanyStatus = function(companyId) {
  mockStore.toggleCompanyStatus(companyId);
  window.showToast("Company status toggled", "business");
  renderSuperadminView();
};

window.savePlanPricing = function(planId) {
  const mo = document.getElementById(`price-${planId}-mo`)?.value;
  const yr = document.getElementById(`price-${planId}-yr`)?.value;
  const limit = document.getElementById(`price-${planId}-limit`)?.value;

  if (mo && yr) {
    mockStore.updatePlanPricing(planId, mo, yr, limit);
    window.showToast(`Updated ${planId.toUpperCase()} demonstration pricing!`, "check_circle");
    renderSuperadminView();
  }
};

window.confirmResetDemoData = function() {
  if (confirm("Reset all demo data to initial factory state?\n\nThis will restore Strata Labs, initial mock transactions, and reset demo accounts.")) {
    mockStore.resetDemoData();
    window.showToast("Demo database reset to factory state!", "restart_alt");
    renderSuperadminView();
  }
};
