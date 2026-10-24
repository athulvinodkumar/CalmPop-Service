// CalmPop - Mock Receipt View
// IMPORTANT: THIS IS A DEMONSTRATION RECEIPT ONLY. NO REAL PAYMENT OR TAX INVOICE.

import { mockStore, formatINR } from '../mockStore.js';

export function renderReceiptView(transactionId, containerId = 'app-view-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const transaction = mockStore.getTransactionById(transactionId) || mockStore.getTransactions()[0];
  if (!transaction) {
    container.innerHTML = `<div class="p-8 text-center">Receipt not found. <button onclick="window.navigateView('landing')">Go to Home</button></div>`;
    return;
  }

  const company = mockStore.getCompanyById(transaction.companyId) || {
    name: transaction.companyName || 'Demo Organization',
    location: 'Bengaluru, India',
    adminName: 'Organization Admin',
    adminEmail: 'admin@demo.in'
  };

  container.innerHTML = `
    <div class="min-h-screen bg-surface-container-low py-10 px-4 sm:px-6 lg:px-12 print:bg-white print:p-0">
      <div class="max-w-3xl mx-auto">
        
        <!-- Action Bar (Hidden when printing) -->
        <div class="flex items-center justify-between mb-6 print:hidden">
          <button onclick="window.navigateView('admin', '${company.id}')" class="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Admin Dashboard</span>
          </button>

          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-5 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-[16px]">print</span>
              <span>Print / Save as PDF</span>
            </button>
            <button onclick="window.navigateView('landing')" class="px-4 py-2.5 rounded-full bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-all">
              Website
            </button>
          </div>
        </div>

        <!-- Receipt Document Box -->
        <div class="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 shadow-xl border border-surface-container relative overflow-hidden print:shadow-none print:border-none print:p-6">
          
          <!-- Large Background Watermark -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 -rotate-12 z-0">
            <span class="text-5xl sm:text-7xl font-extrabold text-on-surface text-center uppercase tracking-widest leading-relaxed">
              DEMO RECEIPT<br/>NO MONEY TRANSFERRED
            </span>
          </div>

          <div class="relative z-10 space-y-8">
            
            <!-- Receipt Header -->
            <div class="flex flex-wrap items-start justify-between gap-4 border-b border-surface-container pb-6">
              <div class="flex items-center gap-3">
                <img alt="CalmPop Logo" class="h-9 w-auto" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
                <div>
                  <h1 class="font-headline-sm text-2xl font-bold text-on-surface">CalmPop</h1>
                  <span class="text-xs text-outline">Proactive Workplace Wellbeing Platform</span>
                </div>
              </div>

              <div class="text-right">
                <span class="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wide">
                  SIMULATED PAID
                </span>
                <p class="font-mono text-xs text-on-surface font-bold mt-2">${transaction.invoiceNumber}</p>
                <p class="text-xs text-outline">${new Date(transaction.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <!-- Prominent Warning Banner -->
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <span class="font-bold text-xs uppercase text-amber-900 tracking-wider">
                DEMO RECEIPT — NO MONEY WAS TRANSFERRED
              </span>
              <p class="text-[11px] text-amber-800 mt-0.5">
                This document is generated strictly as a simulated artifact for technical evaluation.
              </p>
            </div>

            <!-- Customer & Transaction Info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span class="font-label-sm text-xs text-outline uppercase font-semibold block mb-1">Billed To (Organization)</span>
                <p class="font-bold text-base text-on-surface">${company.name}</p>
                <p class="text-xs text-on-surface-variant">Admin: ${company.adminName || 'Admin'}</p>
                <p class="text-xs text-on-surface-variant">${company.adminEmail || company.email}</p>
                <p class="text-xs text-on-surface-variant">${company.location || 'India'}</p>
                <p class="font-mono text-xs text-primary font-bold mt-1">ID: ${company.id}</p>
              </div>

              <div class="sm:text-right">
                <span class="font-label-sm text-xs text-outline uppercase font-semibold block mb-1">Payment Method & Reference</span>
                <p class="font-semibold text-on-surface">${transaction.paymentMethod || 'UPI (Simulated)'}</p>
                <p class="text-xs text-on-surface-variant">Transaction ID: <span class="font-mono font-bold">${transaction.id}</span></p>
                <p class="text-xs text-on-surface-variant">Status: <span class="text-tertiary font-bold">Demo Completed</span></p>
                <p class="text-xs text-on-surface-variant">Currency: <span class="font-bold">Indian Rupee (INR)</span></p>
              </div>
            </div>

            <!-- Line Items Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead>
                  <tr class="border-b border-surface-container text-xs text-outline uppercase">
                    <th class="py-3 px-2">Description</th>
                    <th class="py-3 px-2 text-center">Seats</th>
                    <th class="py-3 px-2 text-center">Billing Cycle</th>
                    <th class="py-3 px-2 text-right">Rate</th>
                    <th class="py-3 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-container">
                  <tr>
                    <td class="py-4 px-2">
                      <p class="font-semibold text-on-surface">CalmPop ${transaction.planName} Plan</p>
                      <p class="text-xs text-on-surface-variant">Proactive employee pulse, weekly surveys & moments of calm</p>
                    </td>
                    <td class="py-4 px-2 text-center font-medium">${transaction.seats}</td>
                    <td class="py-4 px-2 text-center uppercase text-xs font-semibold text-primary">${transaction.billingCycle}</td>
                    <td class="py-4 px-2 text-right font-medium">${formatINR(transaction.unitRate, true)}/mo</td>
                    <td class="py-4 px-2 text-right font-bold">${formatINR(transaction.subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals Calculation -->
            <div class="flex justify-end pt-4 border-t border-surface-container">
              <div class="w-72 space-y-2 text-sm">
                <div class="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span class="font-medium text-on-surface">${formatINR(transaction.subtotal)}</span>
                </div>
                <div class="flex justify-between text-on-surface-variant text-xs">
                  <span>Simulated GST (18%)</span>
                  <span>${formatINR(transaction.taxAmount)}</span>
                </div>
                <div class="flex justify-between items-baseline pt-3 border-t-2 border-surface-container text-base font-bold text-on-surface">
                  <span>Total Paid (INR)</span>
                  <span class="text-2xl text-primary font-bold">${formatINR(transaction.totalAmount)}</span>
                </div>
              </div>
            </div>

            <!-- Footer Legal Disclaimer -->
            <div class="pt-8 border-t border-surface-container text-center text-xs text-outline space-y-1">
              <p class="font-semibold text-on-surface">
                * DEMO RECEIPT — NO ACTUAL MONEY TRANSFERRED
              </p>
              <p>
                This receipt is generated for demonstration and evaluation purposes only. It is not a legally valid tax invoice and does not represent an actual financial transaction.
              </p>
              <p class="text-[11px] text-outline pt-2">
                CalmPop Technologies India Pvt Ltd (Simulated) • Bengaluru, Karnataka • Support: contact@calmpop.app
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}
