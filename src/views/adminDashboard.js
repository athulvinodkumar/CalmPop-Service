// CalmPop - Company Admin Dashboard
// Provides full company administration, employee management with strict seat limits,
// survey schedule configuration, stress reports, and simulated subscription management.

import { mockStore, formatINR } from '../mockStore.js';

let activeAdminTab = 'overview'; // 'overview' | 'employees' | 'reports' | 'schedule' | 'games' | 'billing' | 'settings'
let employeeSearchQuery = '';
let employeeDeptFilter = 'all';

export function renderAdminDashboard(companyId, containerId = 'app-view-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const company = mockStore.getCompanyById(companyId) || mockStore.getCurrentCompany();
  if (!company) {
    container.innerHTML = `<div class="p-8 text-center">Company not found. <button onclick="window.navigateView('landing')">Go to Home</button></div>`;
    return;
  }

  // Active seats count
  const activeEmployees = company.employees.filter(e => e.status === 'active');
  const seatLimit = company.subscription.seatLimit || 25;
  const isSeatLimitReached = activeEmployees.length >= seatLimit;

  container.innerHTML = `
    <div class="min-h-screen bg-background flex flex-col lg:flex-row">
      
      <!-- Collapsible / Responsive Sidebar -->
      <aside class="w-full lg:w-64 bg-surface-container-lowest border-r border-surface-container flex-shrink-0 flex flex-col justify-between py-6 px-4">
        <div>
          <!-- Logo & Brand Header -->
          <div class="flex items-center justify-between px-2 mb-6">
            <a href="#home" onclick="window.navigateView('landing')" class="flex items-center gap-2.5 group">
              <img alt="CalmPop Logo" class="h-7 w-auto" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
              <span class="font-headline-sm text-lg font-bold text-on-surface">CalmPop</span>
            </a>
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">Admin</span>
          </div>

          <!-- Current Org Card -->
          <div class="p-3 rounded-2xl bg-surface-container-low border border-surface-container mb-6">
            <p class="font-bold text-xs text-on-surface truncate">${company.name}</p>
            <p class="font-mono text-[10px] text-primary font-semibold mt-0.5">${company.id}</p>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-surface-container text-[11px]">
              <span class="text-outline">Seats:</span>
              <span class="font-bold ${isSeatLimitReached ? 'text-error' : 'text-primary'}">${activeEmployees.length} / ${seatLimit}</span>
            </div>
          </div>

          <!-- Nav Links -->
          <nav class="space-y-1 text-sm font-medium">
            <button onclick="window.switchAdminTab('overview')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeAdminTab === 'overview' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
              <span class="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Overview</span>
            </button>

            <button onclick="window.switchAdminTab('employees')" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${activeAdminTab === 'employees' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">badge</span>
                <span>Employees</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs ${activeAdminTab === 'employees' ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'}">${activeEmployees.length}</span>
            </button>

            <button onclick="window.switchAdminTab('reports')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeAdminTab === 'reports' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
              <span class="material-symbols-outlined text-[20px]">insights</span>
              <span>Stress Reports</span>
            </button>

            <button onclick="window.switchAdminTab('schedule')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeAdminTab === 'schedule' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
              <span class="material-symbols-outlined text-[20px]">schedule</span>
              <span>Survey Schedule</span>
            </button>

            <button onclick="window.switchAdminTab('games')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeAdminTab === 'games' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
              <span class="material-symbols-outlined text-[20px]">sports_esports</span>
              <span>Game Activity</span>
            </button>

            <button onclick="window.switchAdminTab('billing')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeAdminTab === 'billing' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
              <span class="material-symbols-outlined text-[20px]">credit_card</span>
              <span>Subscription & Billing</span>
            </button>

            <button onclick="window.switchAdminTab('settings')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeAdminTab === 'settings' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}">
              <span class="material-symbols-outlined text-[20px]">settings</span>
              <span>Company Settings</span>
            </button>
          </nav>
        </div>

        <!-- Sidebar Footer & Controls -->
        <div class="pt-6 border-t border-surface-container space-y-2">
          <button onclick="window.navigateView('superadmin')" class="w-full py-2 px-3 rounded-xl bg-secondary-fixed/30 hover:bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold flex items-center gap-2 transition-all">
            <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Platform Superadmin</span>
          </button>

          <button onclick="window.navigateView('landing')" class="w-full py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center gap-2 transition-all">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Landing Page</span>
          </button>
        </div>
      </aside>

      <!-- Main Admin Content Area -->
      <main class="flex-1 flex flex-col min-w-0">
        
        <!-- Header Bar -->
        <header class="h-16 bg-surface-container-lowest border-b border-surface-container px-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="font-headline-sm text-base font-bold text-on-surface capitalize">
              ${activeAdminTab.replace('-', ' ')}
            </h2>
            <span class="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
              Demo Environment
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <p class="font-bold text-xs text-on-surface">${company.adminName || 'Admin'}</p>
              <p class="text-[11px] text-outline">${company.adminEmail || company.email}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
              ${(company.adminName || 'A').charAt(0)}
            </div>
          </div>
        </header>

        <!-- Body Content for Selected Tab -->
        <div class="p-6 sm:p-8 flex-1 overflow-y-auto">
          ${renderTabContent(activeAdminTab, company)}
        </div>

      </main>

    </div>

    <!-- Custom CalmPop Modals (Replacing browser-native prompts, alerts, and confirms) -->
    ${renderEmployeeModalMarkup(company)}
    ${renderEmployeeReportModalMarkup()}
    ${renderDeleteEmployeeModalMarkup()}
    ${renderUpgradePlanModalMarkup(company)}
    ${renderCancelSubscriptionModalMarkup()}
  `;

  if (activeAdminTab === 'overview') {
    setTimeout(() => {
      window.loadAdminRealSurveys(company.id);
    }, 50);
  }
}

window.loadAdminRealSurveys = async function(companyId) {
  const container = document.getElementById('admin-real-surveys-list');
  if (!container) return;
  try {
    const res = await fetch(`/api/admin/company-surveys?companyId=${companyId || 'CP-ORG-78214'}`);
    if (!res.ok) return;
    const data = await res.json();
    const surveys = data.surveys || [];
    if (surveys.length === 0) {
      container.innerHTML = `<p class="text-[11px] text-outline italic">No completed surveys recorded in SQLite for this company yet.</p>`;
      return;
    }
    container.innerHTML = surveys.slice(0, 3).map(s => `
      <div class="p-2.5 bg-surface-container-lowest rounded-xl flex items-center justify-between text-[11px] border border-surface-container/60">
        <div>
          <span class="font-bold text-on-surface">${s.employee_name} (${s.department})</span>
          <span class="text-outline block text-[10px]">Week ${s.week_identifier} • ${new Date(s.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <span class="font-mono font-bold text-primary">${s.stress_level}% • ${s.sentiment}</span>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<p class="text-[11px] text-outline">Offline</p>`;
  }
};

function renderTabContent(tab, company) {
  const activeEmployees = company.employees.filter(e => e.status === 'active');
  const seatLimit = company.subscription.seatLimit || 25;
  const isSeatLimitReached = activeEmployees.length >= seatLimit;

  // 1. OVERVIEW TAB
  if (tab === 'overview') {
    return `
      <div class="space-y-8 max-w-6xl">
        <!-- Top Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Active Seats</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-3xl font-bold ${isSeatLimitReached ? 'text-error' : 'text-on-surface'}">${activeEmployees.length}</span>
              <span class="text-xs text-on-surface-variant">/ ${seatLimit} Seats Limit</span>
            </div>
            <div class="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
              <div class="bg-primary h-full rounded-full transition-all" style="width: ${(activeEmployees.length / seatLimit) * 100}%"></div>
            </div>
            <span class="text-[11px] text-outline mt-2 block">${seatLimit - activeEmployees.length} seats remaining</span>
          </div>

          <div class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Weekly Completion</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-3xl font-bold text-primary">88.4%</span>
              <span class="text-tertiary text-xs font-semibold flex items-center">
                <span class="material-symbols-outlined text-[14px]">arrow_upward</span> +3.1%
              </span>
            </div>
            <span class="text-[11px] text-outline mt-2 block">131 responses recorded</span>
          </div>

          <div class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Company Stress Index</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-3xl font-bold text-on-surface">31%</span>
              <span class="text-xs font-bold text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded-full">Healthy Calm</span>
            </div>
            <span class="text-[11px] text-outline mt-2 block">-4.2% vs baseline</span>
          </div>

          <div class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm">
            <span class="font-label-sm text-xs text-outline uppercase font-semibold">Current Plan</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="font-headline-lg text-2xl font-bold text-primary capitalize">${company.subscription.planName}</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-2 block capitalize font-medium">${company.subscription.billingCycle} billing • Next: simulated renewal</span>
          </div>

        </div>

        <!-- Recent Activity & Quick Action Row -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div class="lg:col-span-8 bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">Recent Anonymized Pulse Submissions</h3>
                <p class="text-xs text-on-surface-variant">Latest weekly check-in telemetry</p>
              </div>
              <button onclick="window.switchAdminTab('reports')" class="text-xs font-semibold text-primary hover:underline">View All</button>
            </div>

            <div class="space-y-2.5">
              <!-- Live Persistent SQLite Records Panel -->
              <div id="admin-real-surveys-container" class="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container text-xs space-y-2">
                <div class="flex items-center justify-between text-outline text-[11px]">
                  <span class="font-bold flex items-center gap-1.5 text-primary">
                    <span class="material-symbols-outlined text-[16px]">database</span>
                    <span>Actual Employee Check-In Records (Persistent SQLite Store)</span>
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">Real Store</span>
                </div>
                <div id="admin-real-surveys-list" class="space-y-1.5">
                  <p class="text-outline text-[11px]">Loading real employee check-in records...</p>
                </div>
              </div>

              <!-- Illustrative Historical Trends -->
              <p class="text-[10px] text-outline uppercase font-bold tracking-wider pt-1">Simulated Baseline Trajectories</p>
              ${(company.recentSurveys || []).map(s => `
                <div class="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span>
                    <div>
                      <p class="font-semibold text-on-surface">${s.department}</p>
                      <p class="text-[11px] text-outline">${s.date}</p>
                    </div>
                  </div>
                  <span class="font-bold text-primary">${s.score}% • ${s.sentiment}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="lg:col-span-4 bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="font-headline-sm text-base font-bold text-on-surface mb-1">Quick Actions</h3>
              <p class="text-xs text-on-surface-variant mb-4">Manage team and pulse schedule</p>
              
              <div class="space-y-2.5">
                <button onclick="window.openAddEmployeeModal()" class="w-full p-3 rounded-2xl bg-surface-container-low hover:bg-primary-fixed/20 text-left text-xs font-semibold flex items-center justify-between transition-colors">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-primary">person_add</span>
                    <span>Add New Employee</span>
                  </span>
                  <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                <button onclick="window.switchAdminTab('schedule')" class="w-full p-3 rounded-2xl bg-surface-container-low hover:bg-secondary-fixed/20 text-left text-xs font-semibold flex items-center justify-between transition-colors">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-secondary">calendar_month</span>
                    <span>Change Survey Day</span>
                  </span>
                  <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                <button onclick="window.switchAdminTab('billing')" class="w-full p-3 rounded-2xl bg-surface-container-low hover:bg-tertiary-fixed/30 text-left text-xs font-semibold flex items-center justify-between transition-colors">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-tertiary">upgrade</span>
                    <span>Upgrade Seat Capacity</span>
                  </span>
                  <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            <div class="pt-4 border-t border-surface-container text-[11px] text-outline">
              * Demonstration workspace metrics.
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // 2. EMPLOYEES TAB (with strict seat limit enforcement)
  if (tab === 'employees') {
    let filteredEmployees = company.employees || [];
    if (employeeSearchQuery) {
      filteredEmployees = filteredEmployees.filter(e => 
        e.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(employeeSearchQuery.toLowerCase())
      );
    }
    if (employeeDeptFilter !== 'all') {
      filteredEmployees = filteredEmployees.filter(e => e.department === employeeDeptFilter);
    }

    return `
      <div class="space-y-6 max-w-6xl">
        
        <!-- Seat Usage Indicator & Limit Alert -->
        <div class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="font-label-sm text-xs uppercase font-bold text-outline">Employee Seat Capacity</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-2xl font-bold ${isSeatLimitReached ? 'text-error' : 'text-primary'}">${activeEmployees.length}</span>
              <span class="text-xs text-on-surface-variant">active employees out of <strong>${seatLimit}</strong> seats in ${company.subscription.planName} plan</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            ${isSeatLimitReached ? `
              <div class="px-3 py-1.5 rounded-full bg-error/10 text-error text-xs font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">warning</span>
                <span>Seat Limit Reached!</span>
              </div>
              <button onclick="window.switchAdminTab('billing')" class="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all">
                Upgrade Plan
              </button>
            ` : `
              <button onclick="window.openAddEmployeeModal()" class="px-5 py-2.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold hover:bg-tertiary-fixed-dim transition-all flex items-center gap-1.5 shadow-sm">
                <span class="material-symbols-outlined text-[16px]">person_add</span>
                <span>Add Employee</span>
              </button>
            `}
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-surface-container">
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <span class="material-symbols-outlined text-outline text-[20px]">search</span>
            <input type="text" placeholder="Search by name, email, department..." value="${employeeSearchQuery}" oninput="window.setEmployeeSearch(this.value)" class="w-full text-xs bg-transparent border-none outline-none text-on-surface focus:ring-0"/>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-outline">Department:</span>
            <select onchange="window.setEmployeeDeptFilter(this.value)" class="text-xs bg-surface-container-low border border-surface-container rounded-xl px-3 py-1.5 text-on-surface focus:outline-none">
              <option value="all" ${employeeDeptFilter === 'all' ? 'selected' : ''}>All Departments</option>
              <option value="Platform Engineering" ${employeeDeptFilter === 'Platform Engineering' ? 'selected' : ''}>Platform Engineering</option>
              <option value="Product & Design" ${employeeDeptFilter === 'Product & Design' ? 'selected' : ''}>Product & Design</option>
              <option value="Enterprise Sales" ${employeeDeptFilter === 'Enterprise Sales' ? 'selected' : ''}>Enterprise Sales</option>
              <option value="Customer Success" ${employeeDeptFilter === 'Customer Success' ? 'selected' : ''}>Customer Success</option>
              <option value="Executive Leadership" ${employeeDeptFilter === 'Executive Leadership' ? 'selected' : ''}>Executive Leadership</option>
            </select>
          </div>
        </div>

        <!-- Employee Table -->
        <div class="bg-surface-container-lowest rounded-3xl border border-surface-container overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-outline uppercase border-b border-surface-container">
                  <th class="py-3.5 px-4">Employee</th>
                  <th class="py-3.5 px-4">Department & Title</th>
                  <th class="py-3.5 px-4 text-center">Status</th>
                  <th class="py-3.5 px-4 text-center">Joined</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container">
                ${filteredEmployees.length === 0 ? `
                  <tr>
                    <td colspan="5" class="py-8 text-center text-outline">No employees found matching query.</td>
                  </tr>
                ` : filteredEmployees.map(emp => `
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <p class="font-bold text-on-surface text-sm">${emp.name}</p>
                        <span class="px-1.5 py-0.5 rounded-md bg-surface-container text-primary font-mono text-[10px] font-semibold">@${emp.username || emp.id.toLowerCase()}</span>
                      </div>
                      <p class="text-on-surface-variant text-[11px] mt-0.5">${emp.email}</p>
                    </td>
                    <td class="py-3.5 px-4">
                      <p class="font-semibold text-on-surface">${emp.department}</p>
                      <p class="text-outline text-[11px]">${emp.title}</p>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${emp.status === 'active' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-high text-outline'}">
                        ${emp.status.toUpperCase()}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-center text-outline">${emp.joinedAt}</td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button onclick="window.viewEmployeeReport('${emp.id}', '${emp.name}')" title="View Anonymized Wellbeing Report" class="p-1.5 hover:bg-surface-container-high rounded-lg text-primary">
                          <span class="material-symbols-outlined text-[18px]">assessment</span>
                        </button>
                        <button onclick="window.toggleEmployeeStatus('${emp.id}')" title="${emp.status === 'active' ? 'Deactivate' : 'Reactivate'}" class="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error">
                          <span class="material-symbols-outlined text-[18px]">${emp.status === 'active' ? 'block' : 'check_circle'}</span>
                        </button>
                        <button onclick="window.deleteEmployee('${emp.id}')" title="Remove" class="p-1.5 hover:bg-surface-container-high rounded-lg text-outline hover:text-error">
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // 3. STRESS REPORTS TAB
  if (tab === 'reports') {
    return `
      <div class="space-y-6 max-w-5xl">
        <div class="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-headline-sm text-lg font-bold text-on-surface">Department Stress & Wellbeing Trajectories</h3>
              <p class="text-xs text-on-surface-variant">Anonymized rolling index (minimum 5 respondents per cluster)</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Q4 Benchmark</span>
          </div>

          <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900">
            * <strong>Non-diagnostic wellbeing indicators:</strong> Reports reflect general cognitive velocity, workload manageable scores, and team support. CalmPop is not a clinical medical diagnostics platform.
          </div>

          <div class="space-y-4 pt-2">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-semibold text-on-surface">Platform Engineering (54 Employees)</span>
                <span class="text-primary font-bold">32% • Normal Steady</span>
              </div>
              <div class="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div class="bg-primary h-full rounded-full" style="width: 32%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-semibold text-on-surface">Product & Design (28 Employees)</span>
                <span class="text-tertiary font-bold">24% • Optimal Resilience</span>
              </div>
              <div class="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div class="bg-tertiary-fixed-dim h-full rounded-full" style="width: 24%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-semibold text-on-surface">Enterprise Sales (38 Employees)</span>
                <span class="text-secondary font-bold">42% • Moderate Crunch</span>
              </div>
              <div class="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div class="bg-secondary-container h-full rounded-full" style="width: 42%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-semibold text-on-surface">Customer Success (28 Employees)</span>
                <span class="text-tertiary font-bold">28% • Calm & Steady</span>
              </div>
              <div class="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div class="bg-tertiary-fixed-dim h-full rounded-full" style="width: 28%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 4. SURVEY SCHEDULE TAB
  if (tab === 'schedule') {
    const sched = company.surveySchedule || { weekday: 'Thursday', time: '14:00', timezone: 'Asia/Kolkata (IST)' };
    return `
      <div class="max-w-2xl bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm space-y-6">
        <div>
          <h3 class="font-headline-sm text-lg font-bold text-on-surface">Weekly Pulse Check-in Schedule</h3>
          <p class="text-xs text-on-surface-variant">Configure automated dispatch of 3-minute micro-cadence</p>
        </div>

        <form onsubmit="window.saveSurveySchedule(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Delivery Day of Week</label>
            <select id="sched-day" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface">
              <option ${sched.weekday === 'Monday' ? 'selected' : ''}>Monday</option>
              <option ${sched.weekday === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
              <option ${sched.weekday === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
              <option ${sched.weekday === 'Thursday' ? 'selected' : ''}>Thursday</option>
              <option ${sched.weekday === 'Friday' ? 'selected' : ''}>Friday</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Preferred Time of Day</label>
            <input type="time" id="sched-time" value="${sched.time || '14:00'}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface"/>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Timezone</label>
            <select id="sched-tz" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface">
              <option selected>Asia/Kolkata (IST • UTC+05:30)</option>
              <option>Asia/Dubai (GST • UTC+04:00)</option>
              <option>Europe/London (GMT • UTC+00:00)</option>
              <option>America/New_York (EST • UTC-05:00)</option>
            </select>
          </div>

          <div class="pt-2">
            <button type="submit" class="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all">
              Save Schedule Settings
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // 5. GAME ACTIVITY TAB (Polished Empty State)
  if (tab === 'games') {
    return `
      <div class="max-w-3xl bg-surface-container-lowest p-10 rounded-3xl border border-surface-container shadow-sm text-center space-y-6">
        <div class="w-16 h-16 rounded-full bg-tertiary-fixed/30 text-tertiary flex items-center justify-center mx-auto shadow-sm">
          <span class="material-symbols-outlined text-[36px]">sports_esports</span>
        </div>

        <div>
          <h3 class="font-headline-sm text-xl font-bold text-on-surface mb-1">Interactive Game Catalog</h3>
          <p class="text-xs text-on-surface-variant max-w-md mx-auto">
            The full micro-games activity telemetry catalog is currently in development for your organization.
          </p>
        </div>

        <div class="p-4 bg-surface-container-low rounded-2xl max-w-md mx-auto text-left text-xs space-y-2 border border-surface-container">
          <p class="font-semibold text-on-surface">Available Micro-Relief Today:</p>
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-[16px] text-tertiary">check</span>
            <span>3-Minute Paced Box Breathing Pacer</span>
          </div>
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-[16px] text-tertiary">check</span>
            <span>Generative Ambient Rain Soundscapes (Web Audio)</span>
          </div>
        </div>

        <div>
          <button onclick="window.startCalmSession()" class="px-6 py-3 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs hover:bg-tertiary-fixed-dim transition-all inline-flex items-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-[18px]">spa</span>
            <span>Launch Moments of Calm Studio</span>
          </button>
        </div>
      </div>
    `;
  }

  // 6. SUBSCRIPTION & BILLING TAB
  if (tab === 'billing') {
    const transactions = mockStore.getTransactions(company.id);

    return `
      <div class="space-y-8 max-w-6xl">
        
        <!-- Active Subscription Overview -->
        <div class="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-surface-container pb-6">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-headline-sm text-2xl font-bold text-on-surface capitalize">${company.subscription.planName} Plan</span>
                <span class="px-3 py-0.5 rounded-full ${company.subscription.status === 'active' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error/15 text-error'} text-xs font-bold uppercase">
                  ${company.subscription.status}
                </span>
              </div>
              <p class="text-xs text-on-surface-variant mt-1">
                Billed <span class="capitalize font-semibold">${company.subscription.billingCycle}</span> (${formatINR(company.subscription.pricePerSeat, true)} / employee / mo)
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="window.openUpgradePlanModal()" class="px-5 py-2.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold hover:bg-tertiary-fixed-dim transition-all shadow-sm">
                Change Plan / Upgrade
              </button>
              ${company.subscription.status === 'active' ? `
                <button onclick="window.openCancelSubscriptionModal()" class="px-4 py-2.5 rounded-full bg-surface-container-high hover:bg-error/10 hover:text-error text-xs font-semibold text-outline transition-colors">
                  Cancel Subscription
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Subscription Details Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-sm">
            <div>
              <span class="text-xs text-outline uppercase font-semibold block mb-1">Seats In Use</span>
              <p class="font-headline-sm text-xl font-bold text-on-surface">${activeEmployees.length} of ${seatLimit}</p>
              <div class="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-primary h-full rounded-full" style="width: ${(activeEmployees.length / seatLimit) * 100}%"></div>
              </div>
            </div>

            <div>
              <span class="text-xs text-outline uppercase font-semibold block mb-1">Simulated Renewal Date</span>
              <p class="font-bold text-base text-on-surface">${new Date(company.subscription.renewalDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p class="text-xs text-outline">Simulated auto-renewal in demo mode</p>
            </div>

            <div>
              <span class="text-xs text-outline uppercase font-semibold block mb-1">Billing Value</span>
              <p class="font-bold text-base text-primary">${formatINR(company.subscription.annualBilledTotal || company.subscription.monthlyTotalEquivalent)}</p>
              <p class="text-xs text-outline">${company.subscription.billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
            </div>
          </div>
        </div>

        <!-- Mock Payment History Table -->
        <div class="bg-surface-container-lowest rounded-3xl border border-surface-container p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Simulated Payment History</h3>
              <p class="text-xs text-on-surface-variant">Receipts and demonstration transactions for ${company.name}</p>
            </div>
            <span class="text-xs bg-amber-500/10 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
              Demo Records
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-outline uppercase border-b border-surface-container">
                  <th class="py-3 px-3">Date</th>
                  <th class="py-3 px-3">Invoice Number</th>
                  <th class="py-3 px-3">Plan Description</th>
                  <th class="py-3 px-3">Amount</th>
                  <th class="py-3 px-3 text-center">Status</th>
                  <th class="py-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container">
                ${transactions.length === 0 ? `
                  <tr>
                    <td colspan="6" class="py-6 text-center text-outline">No mock transactions recorded yet.</td>
                  </tr>
                ` : transactions.map(tx => `
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3.5 px-3 font-medium">${new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                    <td class="py-3.5 px-3 font-mono font-semibold">${tx.invoiceNumber}</td>
                    <td class="py-3.5 px-3 text-on-surface">${tx.planName} (${tx.seats} Seats • ${tx.billingCycle})</td>
                    <td class="py-3.5 px-3 font-bold text-primary">${formatINR(tx.totalAmount)}</td>
                    <td class="py-3.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${tx.status === 'success' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error/15 text-error'}">
                        ${tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <button onclick="window.renderReceiptView('${tx.id}')" class="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors">
                        View Receipt
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // 7. COMPANY SETTINGS TAB
  if (tab === 'settings') {
    return `
      <div class="max-w-2xl bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm space-y-6">
        <div>
          <h3 class="font-headline-sm text-lg font-bold text-on-surface">Company Profile Settings</h3>
          <p class="text-xs text-on-surface-variant">Update organization information and administrator contacts</p>
        </div>

        <form onsubmit="window.saveCompanySettings(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Company Name</label>
            <input type="text" id="settings-comp-name" value="${company.name}" required class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface"/>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Headquarters / Location</label>
            <input type="text" id="settings-comp-loc" value="${company.location || 'Bengaluru, India'}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface"/>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">Administrator Full Name</label>
              <input type="text" id="settings-admin-name" value="${company.adminName || ''}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface"/>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">Administrator Email</label>
              <input type="email" id="settings-admin-email" value="${company.adminEmail || company.email}" class="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface"/>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all">
              Save Company Settings
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

// Global UI Action Hooks
window.switchAdminTab = function(tabName) {
  activeAdminTab = tabName;
  const company = mockStore.getCurrentCompany();
  renderAdminDashboard(company?.id);
};

window.setEmployeeSearch = function(query) {
  employeeSearchQuery = query;
  window.switchAdminTab('employees');
};

window.setEmployeeDeptFilter = function(dept) {
  employeeDeptFilter = dept;
  window.switchAdminTab('employees');
};

window.toggleEmployeeStatus = function(empId) {
  const company = mockStore.getCurrentCompany();
  try {
    mockStore.toggleEmployeeStatus(company.id, empId);
    window.showToast("Employee status updated", "badge");
    window.switchAdminTab('employees');
  } catch (err) {
    window.showToast(err.message, "error");
  }
};

// ==========================================
// Custom CalmPop Dashboard Modals & Actions
// ==========================================

let targetDeleteEmpId = null;
let isEmpNameDirty = false;
let isEmpUsernameDirty = false;
let isEmpEmailDirty = false;
let targetUpgradePlan = 'growth';
let targetUpgradeSeats = 100;

// --- Employee Creation Modal Handlers ---

window.openAddEmployeeModal = function() {
  const company = mockStore.getCurrentCompany();
  if (!company) return;

  const modal = document.getElementById('add-employee-modal');
  if (!modal) return;

  // Reset dirty flags
  isEmpNameDirty = false;
  isEmpUsernameDirty = false;
  isEmpEmailDirty = false;

  // Compute next ID
  const nextId = mockStore.getNextEmployeeId(company.id);
  const displayIdElem = document.getElementById('emp-display-id');
  const inputIdElem = document.getElementById('emp-input-id');
  if (displayIdElem) displayIdElem.textContent = nextId;
  if (inputIdElem) inputIdElem.value = nextId;

  // Generate random secure temporary password
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const tempPass = `CalmPop@2026!${randomSuffix}`;
  const passElem = document.getElementById('emp-input-password');
  if (passElem) passElem.value = tempPass;

  // Reset inputs
  const nameInput = document.getElementById('emp-input-name');
  const userInput = document.getElementById('emp-input-username');
  const emailInput = document.getElementById('emp-input-email');
  const titleInput = document.getElementById('emp-input-title');
  const deptInput = document.getElementById('emp-input-dept');

  if (nameInput) nameInput.value = '';
  if (userInput) userInput.value = '';
  if (emailInput) emailInput.value = '';
  if (titleInput) titleInput.value = 'Software Engineer';
  if (deptInput) deptInput.value = 'Platform Engineering';

  // Clear previous errors
  window.clearEmployeeFormErrors();

  // Reset submit button state
  const submitBtn = document.getElementById('emp-modal-submit-btn');
  const submitText = document.getElementById('emp-modal-submit-text');
  const spinner = document.getElementById('emp-modal-submit-spinner');
  const cancelBtn = document.getElementById('emp-modal-cancel-btn');

  const activeEmployees = company.employees.filter(e => e.status === 'active');
  const seatLimit = company.subscription.seatLimit || 25;
  const isSeatLimitReached = activeEmployees.length >= seatLimit;

  if (submitBtn) submitBtn.disabled = isSeatLimitReached;
  if (cancelBtn) cancelBtn.disabled = false;
  if (submitText) submitText.textContent = "Create Employee";
  if (spinner) spinner.classList.add('hidden');

  // Open modal with smooth transition
  modal.classList.remove('hidden');
  requestAnimationFrame(() => {
    modal.classList.remove('opacity-0');
    const dialog = modal.querySelector('.modal-dialog-box');
    if (dialog) dialog.classList.remove('scale-95');
    if (nameInput && !isSeatLimitReached) nameInput.focus();
  });
};

window.closeAddEmployeeModal = function() {
  const modal = document.getElementById('add-employee-modal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  const dialog = modal.querySelector('.modal-dialog-box');
  if (dialog) dialog.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
};

window.handleEmpModalBackdropClick = function(e) {
  if (e.target && e.target.id === 'add-employee-modal') {
    window.closeAddEmployeeModal();
  }
};

window.handleEmpNameInput = function(name) {
  isEmpNameDirty = true;
  const errElem = document.getElementById('emp-err-name');
  if (errElem) errElem.classList.add('hidden');

  const userInput = document.getElementById('emp-input-username');
  const emailInput = document.getElementById('emp-input-email');

  // If username has not been customized by user, auto-suggest clean alphanumeric username
  if (!isEmpUsernameDirty && userInput) {
    const cleanUser = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    userInput.value = cleanUser;
    window.checkUsernameLive(cleanUser);
  }

  // If email has not been customized by user, auto-suggest work email
  if (!isEmpEmailDirty && emailInput) {
    const cleanHandle = name.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const company = mockStore.getCurrentCompany();
    const domain = (company?.email ? company.email.split('@')[1] : '') || 'stratalabs.com';
    emailInput.value = cleanHandle ? `${cleanHandle}@${domain}` : '';
    const emailErr = document.getElementById('emp-err-email');
    if (emailErr) emailErr.classList.add('hidden');
  }
};

window.handleEmpUsernameInput = function(val) {
  isEmpUsernameDirty = true;
  window.checkUsernameLive(val);
};

window.checkUsernameLive = function(username) {
  const errElem = document.getElementById('emp-err-username');
  if (!errElem) return true;

  const cleanUser = (username || '').trim().toLowerCase();
  if (!cleanUser) {
    errElem.classList.add('hidden');
    return true;
  }

  const company = mockStore.getCurrentCompany();
  if (company && mockStore.isUsernameTaken(company.id, cleanUser)) {
    const textSpan = errElem.querySelector('.err-text');
    if (textSpan) textSpan.textContent = `Username "${cleanUser}" is already taken in this organization.`;
    errElem.classList.remove('hidden');
    return false;
  } else {
    errElem.classList.add('hidden');
    return true;
  }
};

window.handleEmpEmailInput = function(val) {
  isEmpEmailDirty = true;
  const errElem = document.getElementById('emp-err-email');
  if (errElem) errElem.classList.add('hidden');
};

window.regenerateEmpPassword = function() {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newPass = `CalmPop@2026!${randomSuffix}`;
  const passElem = document.getElementById('emp-input-password');
  if (passElem) {
    passElem.value = newPass;
    window.showToast("Generated new temporary password", "lock_reset");
  }
};

window.copyEmpPassword = function() {
  const passElem = document.getElementById('emp-input-password');
  if (passElem && passElem.value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(passElem.value).catch(() => {});
    }
    window.showToast("Temporary password copied to clipboard!", "content_copy");
  }
};

window.clearEmployeeFormErrors = function() {
  const nameErr = document.getElementById('emp-err-name');
  const userErr = document.getElementById('emp-err-username');
  const emailErr = document.getElementById('emp-err-email');
  const genErr = document.getElementById('emp-modal-general-error');

  if (nameErr) nameErr.classList.add('hidden');
  if (userErr) userErr.classList.add('hidden');
  if (emailErr) emailErr.classList.add('hidden');
  if (genErr) genErr.classList.add('hidden');
};

window.handleCreateEmployeeSubmit = function(e) {
  if (e && e.preventDefault) e.preventDefault();

  const company = mockStore.getCurrentCompany();
  if (!company) return;

  window.clearEmployeeFormErrors();

  const name = (document.getElementById('emp-input-name')?.value || '').trim();
  const username = (document.getElementById('emp-input-username')?.value || '').trim().toLowerCase();
  const email = (document.getElementById('emp-input-email')?.value || '').trim().toLowerCase();
  const department = document.getElementById('emp-input-dept')?.value || 'Platform Engineering';
  const title = (document.getElementById('emp-input-title')?.value || '').trim() || 'Software Engineer';
  const id = document.getElementById('emp-input-id')?.value || mockStore.getNextEmployeeId(company.id);
  const password = document.getElementById('emp-input-password')?.value || 'CalmPop@2026!';

  let hasError = false;

  // 1. Validate Full Name
  if (!name) {
    const err = document.getElementById('emp-err-name');
    if (err) {
      const txt = err.querySelector('.err-text');
      if (txt) txt.textContent = "Full name is required.";
      err.classList.remove('hidden');
    }
    hasError = true;
  }

  // 2. Validate Username
  if (!username) {
    const err = document.getElementById('emp-err-username');
    if (err) {
      const txt = err.querySelector('.err-text');
      if (txt) txt.textContent = "Username is required.";
      err.classList.remove('hidden');
    }
    hasError = true;
  } else if (!/^[a-z0-9._-]+$/.test(username)) {
    const err = document.getElementById('emp-err-username');
    if (err) {
      const txt = err.querySelector('.err-text');
      if (txt) txt.textContent = "Username may only contain letters, numbers, periods, and hyphens.";
      err.classList.remove('hidden');
    }
    hasError = true;
  } else if (mockStore.isUsernameTaken(company.id, username)) {
    const err = document.getElementById('emp-err-username');
    if (err) {
      const txt = err.querySelector('.err-text');
      if (txt) txt.textContent = `Username "${username}" is already taken in this organization.`;
      err.classList.remove('hidden');
    }
    hasError = true;
  }

  // 3. Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    const err = document.getElementById('emp-err-email');
    if (err) {
      const txt = err.querySelector('.err-text');
      if (txt) txt.textContent = "Work email address is required.";
      err.classList.remove('hidden');
    }
    hasError = true;
  } else if (!emailRegex.test(email)) {
    const err = document.getElementById('emp-err-email');
    if (err) {
      const txt = err.querySelector('.err-text');
      if (txt) txt.textContent = "Please enter a valid work email format (e.g. name@company.com).";
      err.classList.remove('hidden');
    }
    hasError = true;
  } else if (mockStore.isEmailTaken(company.id, email)) {
    const err = document.getElementById('emp-err-email');
    if (err) {
      const txt = err.querySelector('.err-text');
      if (txt) txt.textContent = `Email "${email}" is already registered for another employee.`;
      err.classList.remove('hidden');
    }
    hasError = true;
  }

  // 4. Validate Seat Limit
  const activeCount = company.employees.filter(emp => emp.status === 'active').length;
  const limit = company.subscription.seatLimit || 25;
  if (activeCount >= limit) {
    const genErr = document.getElementById('emp-modal-general-error');
    const genText = document.getElementById('emp-modal-general-error-text');
    if (genErr && genText) {
      genText.textContent = `Subscription seat limit reached (${activeCount}/${limit} seats). Upgrade your subscription in Subscription & Billing to add more employees.`;
      genErr.classList.remove('hidden');
    }
    hasError = true;
  }

  if (hasError) return;

  // Show loading spinner & disable buttons to prevent duplicate submissions
  const submitBtn = document.getElementById('emp-modal-submit-btn');
  const submitText = document.getElementById('emp-modal-submit-text');
  const spinner = document.getElementById('emp-modal-submit-spinner');
  const cancelBtn = document.getElementById('emp-modal-cancel-btn');

  if (submitBtn) submitBtn.disabled = true;
  if (cancelBtn) cancelBtn.disabled = true;
  if (submitText) submitText.textContent = "Creating Employee...";
  if (spinner) spinner.classList.remove('hidden');

  setTimeout(() => {
    try {
      mockStore.addEmployee(company.id, {
        id,
        name,
        username,
        email,
        department,
        title,
        password
      });

      window.closeAddEmployeeModal();
      window.showToast(`Added ${name} successfully!`, "person_add");

      // Refresh view to show updated employee table
      activeAdminTab = 'employees';
      renderAdminDashboard(company.id);

    } catch (err) {
      // Re-enable form controls so user can edit and retry without losing entered information
      if (submitBtn) submitBtn.disabled = false;
      if (cancelBtn) cancelBtn.disabled = false;
      if (submitText) submitText.textContent = "Create Employee";
      if (spinner) spinner.classList.add('hidden');

      const genErr = document.getElementById('emp-modal-general-error');
      const genText = document.getElementById('emp-modal-general-error-text');
      if (genErr && genText) {
        genText.textContent = err.message || "An unexpected error occurred while adding employee.";
        genErr.classList.remove('hidden');
      } else {
        window.showToast(err.message, "error");
      }
    }
  }, 350);
};

// --- Employee Wellbeing Report Modal Handlers ---

window.viewEmployeeReport = async function(empId, empName) {
  const nameElem = document.getElementById('report-modal-emp-name');
  const idElem = document.getElementById('report-modal-emp-id');
  const subtitleElem = document.getElementById('report-modal-subtitle');
  const bodyElem = document.getElementById('report-modal-body-dynamic');

  if (nameElem) nameElem.textContent = empName;
  if (idElem) idElem.textContent = empId;
  if (subtitleElem) subtitleElem.textContent = `Confidential Individual Report • Tenant Isolated`;

  if (bodyElem) {
    bodyElem.innerHTML = `
      <div class="p-8 text-center text-outline text-xs">
        <span class="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
        <p class="mt-2">Retrieving actual employee records from SQLite database...</p>
      </div>
    `;
  }

  const modal = document.getElementById('employee-report-modal');
  if (modal) {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      const dialog = modal.querySelector('.modal-dialog-box');
      if (dialog) dialog.classList.remove('scale-95');
    });
  }

  // Fetch real records from server database for current company
  try {
    const company = mockStore.getCurrentCompany();
    const res = await fetch(`/api/admin/company-surveys?companyId=${company?.id || 'CP-ORG-78214'}`);
    const data = res.ok ? await res.json() : null;
    const realSurveys = (data?.surveys || []).filter(s => 
      s.employee_id === empId || 
      (s.employee_name && s.employee_name.toLowerCase() === empName.toLowerCase())
    );

    if (!bodyElem) return;

    if (realSurveys.length > 0) {
      const latest = realSurveys[0];
      bodyElem.innerHTML = `
        <div class="space-y-4">
          <!-- Real Record Badge -->
          <div class="p-3 bg-tertiary-fixed/30 border border-tertiary/20 rounded-2xl flex items-center justify-between text-xs">
            <span class="text-tertiary font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              <span>Verified Real Record (SQLite Persistent Store)</span>
            </span>
            <span class="text-[10px] text-outline font-semibold">30 Questions Answered</span>
          </div>

          <!-- Latest Survey Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div class="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container">
              <span class="text-[10px] text-outline uppercase font-semibold block">Calculated Stress</span>
              <span class="font-bold text-2xl text-primary mt-1 block">${latest.stress_level}%</span>
              <span class="text-[10px] font-bold text-tertiary">${latest.sentiment || 'Steady'}</span>
            </div>
            <div class="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container">
              <span class="text-[10px] text-outline uppercase font-semibold block">Workload Rating</span>
              <span class="font-bold text-2xl text-on-surface mt-1 block">${latest.workload_score}/5</span>
              <span class="text-[10px] text-outline font-medium">Manageability score</span>
            </div>
            <div class="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container">
              <span class="text-[10px] text-outline uppercase font-semibold block">Energy Level</span>
              <span class="font-bold text-2xl text-secondary mt-1 block">${latest.energy_level}/5</span>
              <span class="text-[10px] text-outline font-medium">Cognitive vitality</span>
            </div>
          </div>

          <!-- Submitted Notes / Guidance -->
          ${latest.notes ? `
            <div class="p-3.5 bg-surface-container-low rounded-2xl text-xs space-y-1">
              <span class="text-[10px] text-outline uppercase font-bold block">Wellbeing Feedback & Notes</span>
              <p class="text-on-surface text-[11px] leading-relaxed italic">"${latest.notes}"</p>
            </div>
          ` : ''}

          <!-- Previous Survey Timeline -->
          <div class="space-y-2 pt-2 border-t border-surface-container/60">
            <span class="text-[11px] text-outline font-bold uppercase tracking-wider block">Historical Submissions (${realSurveys.length})</span>
            <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              ${realSurveys.map(s => `
                <div class="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-on-surface text-[11px]">Week ${s.week_identifier}</span>
                    <span class="text-[10px] text-outline block">${new Date(s.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <span class="font-mono font-bold text-primary text-xs">${s.stress_level}% Stress</span>
                </div>
              `).join('')}
            </div>
          </div>

          <p class="text-[10px] text-outline italic pt-1">
            * Note: Survey results are non-diagnostic indicators governed by organization privacy rules.
          </p>
        </div>
      `;
    } else {
      // Empty State for Real Data with illustrative demo preview
      bodyElem.innerHTML = `
        <div class="space-y-4">
          <div class="p-4 bg-surface-container-low border border-surface-container rounded-2xl text-center space-y-2">
            <span class="material-symbols-outlined text-[28px] text-outline">history_edu</span>
            <h4 class="font-bold text-xs text-on-surface">No Real Survey Submissions Recorded</h4>
            <p class="text-[11px] text-outline max-w-sm mx-auto leading-relaxed">
              This employee has not completed a real 30-question weekly check-in yet in the SQLite database.
            </p>
          </div>

          <div class="p-3.5 bg-surface-container-low/60 rounded-2xl border border-surface-container/60 text-xs space-y-2 opacity-80">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-semibold text-outline">Simulated Mock Baseline</span>
              <span class="px-2 py-0.5 rounded-full bg-surface-container text-outline text-[10px] font-bold">Demo Preview</span>
            </div>
            <p class="text-[11px] text-on-surface-variant">
              Once the employee signs into the Employee Portal and submits their 30-question survey, their actual persistent metrics will automatically display here.
            </p>
          </div>
        </div>
      `;
    }

  } catch (err) {
    console.error('Error fetching employee report:', err);
    if (bodyElem) {
      bodyElem.innerHTML = `<p class="p-4 text-center text-error text-xs">Failed to connect to survey backend.</p>`;
    }
  }
};

window.closeEmployeeReportModal = function() {
  const modal = document.getElementById('employee-report-modal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  const dialog = modal.querySelector('.modal-dialog-box');
  if (dialog) dialog.classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 200);
};

// --- Employee Delete Confirmation Modal Handlers ---

window.deleteEmployee = function(empId) {
  const company = mockStore.getCurrentCompany();
  if (!company) return;
  const emp = company.employees.find(e => e.id === empId);
  if (!emp) return;

  targetDeleteEmpId = empId;
  const nameElem = document.getElementById('delete-modal-emp-name');
  const idElem = document.getElementById('delete-modal-emp-id');
  if (nameElem) nameElem.textContent = emp.name;
  if (idElem) idElem.textContent = emp.id;

  const modal = document.getElementById('employee-delete-modal');
  if (modal) {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      const dialog = modal.querySelector('.modal-dialog-box');
      if (dialog) dialog.classList.remove('scale-95');
    });
  }
};

window.closeDeleteEmployeeModal = function() {
  targetDeleteEmpId = null;
  const modal = document.getElementById('employee-delete-modal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  const dialog = modal.querySelector('.modal-dialog-box');
  if (dialog) dialog.classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 200);
};

window.confirmExecuteDeleteEmployee = function() {
  if (!targetDeleteEmpId) return;
  const company = mockStore.getCurrentCompany();
  if (!company) return;

  const empId = targetDeleteEmpId;
  mockStore.deleteEmployee(company.id, empId);
  window.closeDeleteEmployeeModal();
  window.showToast("Employee removed", "delete");
  window.switchAdminTab('employees');
};

// --- Survey Schedule & Settings Handlers ---

window.saveSurveySchedule = function(e) {
  e.preventDefault();
  const day = document.getElementById('sched-day')?.value || 'Thursday';
  const time = document.getElementById('sched-time')?.value || '14:00';
  const tz = document.getElementById('sched-tz')?.value || 'Asia/Kolkata (IST)';

  const company = mockStore.getCurrentCompany();
  mockStore.updateCompany(company.id, {
    surveySchedule: { weekday: day, time, timezone: tz, autoReminders: true }
  });
  window.showToast("Survey schedule saved successfully!", "schedule");
};

window.saveCompanySettings = function(e) {
  e.preventDefault();
  const name = document.getElementById('settings-comp-name')?.value;
  const loc = document.getElementById('settings-comp-loc')?.value;
  const adminName = document.getElementById('settings-admin-name')?.value;
  const adminEmail = document.getElementById('settings-admin-email')?.value;

  const company = mockStore.getCurrentCompany();
  mockStore.updateCompany(company.id, {
    name, location: loc, adminName, adminEmail
  });
  window.showToast("Company settings updated!", "check_circle");
  window.switchAdminTab('overview');
};

// --- Upgrade & Cancel Subscription Custom Modal Handlers ---

window.openUpgradePlanModal = function() {
  const company = mockStore.getCurrentCompany();
  if (!company) return;
  targetUpgradePlan = company.subscription.planId === 'starter' ? 'growth' : 'enterprise';
  targetUpgradeSeats = targetUpgradePlan === 'growth' ? 100 : 250;

  const textElem = document.getElementById('upgrade-modal-text');
  if (textElem) {
    textElem.textContent = `Upgrade to the ${targetUpgradePlan.toUpperCase()} Plan (${targetUpgradeSeats} seats max)? This will generate a simulated prorated transaction without charging real money.`;
  }

  const modal = document.getElementById('upgrade-plan-modal');
  if (modal) {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      const dialog = modal.querySelector('.modal-dialog-box');
      if (dialog) dialog.classList.remove('scale-95');
    });
  }
};

window.closeUpgradePlanModal = function() {
  const modal = document.getElementById('upgrade-plan-modal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  const dialog = modal.querySelector('.modal-dialog-box');
  if (dialog) dialog.classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 200);
};

window.confirmExecuteUpgradePlan = function() {
  const company = mockStore.getCurrentCompany();
  if (!company) return;
  const res = mockStore.updateSubscription(company.id, targetUpgradePlan, company.subscription.billingCycle, targetUpgradeSeats);
  window.closeUpgradePlanModal();
  window.showToast(`Upgraded to ${res.company.subscription.planName} Plan!`, "upgrade");
  window.switchAdminTab('billing');
};

window.openCancelSubscriptionModal = function() {
  const modal = document.getElementById('cancel-subscription-modal');
  if (modal) {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      const dialog = modal.querySelector('.modal-dialog-box');
      if (dialog) dialog.classList.remove('scale-95');
    });
  }
};

window.closeCancelSubscriptionModal = function() {
  const modal = document.getElementById('cancel-subscription-modal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  const dialog = modal.querySelector('.modal-dialog-box');
  if (dialog) dialog.classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 200);
};

window.confirmExecuteCancelSubscription = function() {
  const company = mockStore.getCurrentCompany();
  if (!company) return;
  mockStore.cancelSubscription(company.id);
  window.closeCancelSubscriptionModal();
  window.showToast("Subscription cancelled (Simulated)", "info");
  window.switchAdminTab('billing');
};

// Global escape key handler for all custom modals
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeAddEmployeeModal();
      window.closeEmployeeReportModal();
      window.closeDeleteEmployeeModal();
      window.closeUpgradePlanModal();
      window.closeCancelSubscriptionModal();
    }
  });
}

// ==========================================
// Modal Component Markup Builders
// ==========================================

function renderEmployeeModalMarkup(company) {
  const activeEmployees = company.employees.filter(e => e.status === 'active');
  const seatLimit = company.subscription.seatLimit || 25;
  const isSeatLimitReached = activeEmployees.length >= seatLimit;
  const remainingSeats = Math.max(0, seatLimit - activeEmployees.length);

  return `
    <div id="add-employee-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200" role="dialog" aria-modal="true" aria-labelledby="emp-modal-heading" onclick="window.handleEmpModalBackdropClick(event)">
      <div class="modal-dialog-box relative w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transform transition-transform duration-200 scale-95" onclick="event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="px-6 pt-6 pb-4 border-b border-surface-container flex items-start justify-between bg-surface-container-low/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div>
              <h3 id="emp-modal-heading" class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Add New Employee</h3>
              <p class="text-xs text-on-surface-variant mt-0.5">Create an employee account for your organization.</p>
            </div>
          </div>
          <button type="button" onclick="window.closeAddEmployeeModal()" aria-label="Close modal" class="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Seat Limit Status Bar -->
        <div class="px-6 py-2.5 bg-surface-container-low border-b border-surface-container text-xs flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${isSeatLimitReached ? 'bg-error' : 'bg-tertiary-fixed-dim'}"></span>
            <span class="text-on-surface-variant">Active Seats: <strong class="${isSeatLimitReached ? 'text-error' : 'text-on-surface'}">${activeEmployees.length} / ${seatLimit}</strong></span>
          </div>
          <span class="text-[11px] font-medium text-outline">${!isSeatLimitReached ? `${remainingSeats} seats available on ${company.subscription.planName}` : 'Seat limit reached'}</span>
        </div>

        <!-- Modal Body Content -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          
          <!-- Capacity Warning Banner if Plan is Full -->
          ${isSeatLimitReached ? `
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-950 space-y-2">
              <div class="flex items-center gap-2 font-bold text-amber-800">
                <span class="material-symbols-outlined text-[18px]">warning</span>
                <span>Seat Limit Reached (${activeEmployees.length}/${seatLimit})</span>
              </div>
              <p class="text-[11px] leading-relaxed text-amber-900">
                Your ${company.subscription.planName} plan has reached its maximum seat allowance. Upgrade your subscription to add more team members.
              </p>
              <div class="pt-1">
                <button type="button" onclick="window.closeAddEmployeeModal(); window.switchAdminTab('billing');" class="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all">
                  Upgrade Subscription
                </button>
              </div>
            </div>
          ` : ''}

          <!-- General Server/Validation Error Banner -->
          <div id="emp-modal-general-error" class="hidden p-3.5 rounded-2xl bg-error-container/40 border border-error/30 text-xs text-error flex items-start gap-2.5">
            <span class="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
            <div class="flex-1">
              <p class="font-bold">Unable to create employee</p>
              <p id="emp-modal-general-error-text" class="text-[11px] mt-0.5 leading-relaxed"></p>
            </div>
          </div>

          <form id="emp-creation-form" onsubmit="window.handleCreateEmployeeSubmit(event)" novalidate class="space-y-4 ${isSeatLimitReached ? 'opacity-60 pointer-events-none' : ''}">
            
            <!-- Full Name -->
            <div>
              <label for="emp-input-name" class="block text-xs font-semibold text-on-surface mb-1">
                Full Name <span class="text-error">*</span>
              </label>
              <input type="text" id="emp-input-name" placeholder="e.g. Priya Sharma" required
                oninput="window.handleEmpNameInput(this.value)"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface" />
              <p id="emp-err-name" class="text-error text-[11px] mt-1 hidden font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">error</span>
                <span class="err-text">Full name is required.</span>
              </p>
            </div>

            <!-- Username & Email Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Username -->
              <div>
                <label for="emp-input-username" class="block text-xs font-semibold text-on-surface mb-1">
                  Username <span class="text-error">*</span>
                </label>
                <input type="text" id="emp-input-username" placeholder="e.g. priyasharma" required
                  oninput="window.handleEmpUsernameInput(this.value)"
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface font-mono" />
                <p class="text-[10px] text-outline mt-1">Unique login handle</p>
                <p id="emp-err-username" class="text-error text-[11px] mt-0.5 hidden font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">error</span>
                  <span class="err-text"></span>
                </p>
              </div>

              <!-- Email Address -->
              <div>
                <label for="emp-input-email" class="block text-xs font-semibold text-on-surface mb-1">
                  Email Address <span class="text-error">*</span>
                </label>
                <input type="email" id="emp-input-email" placeholder="e.g. priya.sharma@stratalabs.com" required
                  oninput="window.handleEmpEmailInput(this.value)"
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface" />
                <p class="text-[10px] text-outline mt-1">Weekly pulse recipient</p>
                <p id="emp-err-email" class="text-error text-[11px] mt-0.5 hidden font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">error</span>
                  <span class="err-text"></span>
                </p>
              </div>
            </div>

            <!-- Department & Job Title Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Department Dropdown -->
              <div>
                <label for="emp-input-dept" class="block text-xs font-semibold text-on-surface mb-1">
                  Department <span class="text-error">*</span>
                </label>
                <select id="emp-input-dept" required
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface">
                  <option value="Platform Engineering">Platform Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Enterprise Sales">Enterprise Sales</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="Executive Leadership">Executive Leadership</option>
                  <option value="Operations & People">Operations & People</option>
                </select>
              </div>

              <!-- Job Title -->
              <div>
                <label for="emp-input-title" class="block text-xs font-semibold text-on-surface mb-1">
                  Job Title
                </label>
                <input type="text" id="emp-input-title" placeholder="e.g. Senior Software Engineer" value="Software Engineer"
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface" />
              </div>
            </div>

            <!-- Auto Employee ID & Temporary Password Box -->
            <div class="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-3">
              
              <!-- Employee ID Auto Assignment -->
              <div class="flex items-center justify-between text-xs">
                <div>
                  <span class="text-on-surface font-semibold">Assigned Employee ID</span>
                  <p class="text-[10px] text-outline mt-0.5">Auto-generated sequential organization ID</p>
                </div>
                <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
                  <span class="material-symbols-outlined text-[14px] text-primary">badge</span>
                  <span id="emp-display-id" class="font-mono font-bold text-primary text-xs">EMP-07</span>
                </div>
                <input type="hidden" id="emp-input-id" value="EMP-07" />
              </div>

              <!-- Initial Temporary Password -->
              <div class="border-t border-surface-container pt-2.5">
                <label class="block text-xs font-semibold text-on-surface mb-1">
                  Initial Temporary Password
                </label>
                <div class="flex items-center gap-2">
                  <input type="text" id="emp-input-password" readonly
                    class="w-full text-xs px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface font-mono font-semibold" />
                  <button type="button" onclick="window.regenerateEmpPassword()" title="Generate new secure password"
                    class="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                  <button type="button" onclick="window.copyEmpPassword()" title="Copy temporary password"
                    class="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface-variant transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">content_copy</span>
                    <span class="hidden sm:inline">Copy</span>
                  </button>
                </div>
                <p class="text-[10px] text-outline mt-1.5 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px] text-tertiary">lock_reset</span>
                  <span>Employee will set their permanent password upon first check-in login.</span>
                </p>
              </div>

            </div>

          </form>

        </div>

        <!-- Modal Footer Actions -->
        <div class="px-6 py-4 border-t border-surface-container bg-surface-container-low/40 flex items-center justify-end gap-3">
          <button type="button" onclick="window.closeAddEmployeeModal()" id="emp-modal-cancel-btn"
            class="px-5 py-2.5 rounded-full border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface transition-all">
            Cancel
          </button>

          <button type="button" onclick="document.getElementById('emp-creation-form').requestSubmit()" id="emp-modal-submit-btn"
            ${isSeatLimitReached ? 'disabled' : ''}
            class="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed">
            <span id="emp-modal-submit-text">Create Employee</span>
            <span id="emp-modal-submit-spinner" class="hidden material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          </button>
        </div>

      </div>
    </div>
  `;
}

function renderEmployeeReportModalMarkup() {
  return `
    <div id="employee-report-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200" role="dialog" aria-modal="true" onclick="window.closeEmployeeReportModal()">
      <div class="modal-dialog-box relative w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transform transition-transform duration-200 scale-95" onclick="event.stopPropagation()">
        
        <div class="px-6 pt-6 pb-4 border-b border-surface-container flex items-start justify-between bg-surface-container-low/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[22px]">assessment</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Employee Wellbeing Pulse</h3>
              <p id="report-modal-subtitle" class="text-xs text-on-surface-variant mt-0.5">Illustrative metrics • Anonymized View</p>
            </div>
          </div>
          <button type="button" onclick="window.closeEmployeeReportModal()" aria-label="Close modal" class="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div id="report-modal-body-dynamic" class="p-6 overflow-y-auto flex-1 space-y-4">
          <div class="flex items-center justify-between p-3.5 bg-surface-container-low rounded-2xl border border-surface-container">
            <div>
              <p class="font-bold text-xs text-on-surface" id="report-modal-emp-name">Employee Name</p>
              <p class="text-[11px] text-outline font-mono mt-0.5" id="report-modal-emp-id">EMP-01</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
              Active Participant
            </span>
          </div>

          <!-- 3-Metric Overview Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container text-center">
              <span class="text-[10px] text-outline uppercase font-semibold block">4-Wk Stress Index</span>
              <span class="font-bold text-xl text-primary mt-1 block">26%</span>
              <span class="text-[10px] text-tertiary font-bold">Optimal Steady</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container text-center">
              <span class="text-[10px] text-outline uppercase font-semibold block">Response Rate</span>
              <span class="font-bold text-xl text-on-surface mt-1 block">100%</span>
              <span class="text-[10px] text-outline font-medium">4 of 4 completed</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container text-center">
              <span class="text-[10px] text-outline uppercase font-semibold block">Micro-Resets</span>
              <span class="font-bold text-xl text-secondary mt-1 block">12</span>
              <span class="text-[10px] text-outline font-medium">Breathing & Bubble</span>
            </div>
          </div>

          <!-- Non-diagnostic Advisory Banner -->
          <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <span class="material-symbols-outlined text-[16px] text-amber-700 flex-shrink-0 mt-0.5">info</span>
            <p class="text-[11px] leading-relaxed">
              <strong>Illustrative Non-Diagnostic Metrics:</strong> Individual metrics are aggregated into anonymized department trajectories to preserve privacy. CalmPop is an organizational resilience cultivation tool, not a clinical diagnostic system.
            </p>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-surface-container bg-surface-container-low/40 flex justify-end">
          <button type="button" onclick="window.closeEmployeeReportModal()" class="px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all">
            Done
          </button>
        </div>

      </div>
    </div>
  `;
}

function renderDeleteEmployeeModalMarkup() {
  return `
    <div id="employee-delete-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200" role="dialog" aria-modal="true" onclick="window.closeDeleteEmployeeModal()">
      <div class="modal-dialog-box relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-200 scale-95" onclick="event.stopPropagation()">
        
        <div class="p-6 space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-error-container/60 text-error flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">delete</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-lg font-bold text-on-surface">Remove Employee Record</h3>
            <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Are you sure you want to remove <strong id="delete-modal-emp-name" class="text-on-surface"></strong> (<span id="delete-modal-emp-id" class="font-mono text-outline"></span>) from your organization's active roster?
            </p>
            <p class="text-[11px] text-outline mt-2 leading-relaxed">
              This will free 1 active seat on your subscription plan. Historical anonymized team benchmarks and pulse averages will be preserved.
            </p>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-surface-container bg-surface-container-low/40 flex items-center justify-end gap-3">
          <button type="button" onclick="window.closeDeleteEmployeeModal()" class="px-5 py-2.5 rounded-full border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface transition-all">
            Cancel
          </button>
          <button type="button" onclick="window.confirmExecuteDeleteEmployee()" class="px-5 py-2.5 rounded-full bg-error hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm">
            Remove Employee
          </button>
        </div>

      </div>
    </div>
  `;
}

function renderUpgradePlanModalMarkup(company) {
  return `
    <div id="upgrade-plan-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200" role="dialog" aria-modal="true" onclick="window.closeUpgradePlanModal()">
      <div class="modal-dialog-box relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-200 scale-95" onclick="event.stopPropagation()">
        
        <div class="p-6 space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">upgrade</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-lg font-bold text-on-surface">Simulate Plan Upgrade</h3>
            <p id="upgrade-modal-text" class="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Upgrade your subscription to unlock more employee seats and team sentiment analytics.
            </p>
            <div class="mt-3 p-3 bg-tertiary-fixed/30 rounded-2xl border border-tertiary/20 text-xs text-on-tertiary-fixed font-semibold">
              Demo Environment: Simulated transaction only. No real payment or money transfer.
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-surface-container bg-surface-container-low/40 flex items-center justify-end gap-3">
          <button type="button" onclick="window.closeUpgradePlanModal()" class="px-5 py-2.5 rounded-full border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface transition-all">
            Cancel
          </button>
          <button type="button" onclick="window.confirmExecuteUpgradePlan()" class="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-sm">
            Confirm Upgrade
          </button>
        </div>

      </div>
    </div>
  `;
}

function renderCancelSubscriptionModalMarkup() {
  return `
    <div id="cancel-subscription-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200" role="dialog" aria-modal="true" onclick="window.closeCancelSubscriptionModal()">
      <div class="modal-dialog-box relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-200 scale-95" onclick="event.stopPropagation()">
        
        <div class="p-6 space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">cancel</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-lg font-bold text-on-surface">Simulate Subscription Cancellation</h3>
            <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Are you sure you want to simulate subscription cancellation? In this demo, your subscription will be marked as cancelled at the end of the current billing cycle.
            </p>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-surface-container bg-surface-container-low/40 flex items-center justify-end gap-3">
          <button type="button" onclick="window.closeCancelSubscriptionModal()" class="px-5 py-2.5 rounded-full border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface transition-all">
            Keep Subscription
          </button>
          <button type="button" onclick="window.confirmExecuteCancelSubscription()" class="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm">
            Confirm Cancellation
          </button>
        </div>

      </div>
    </div>
  `;
}
