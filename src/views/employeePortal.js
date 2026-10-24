// CalmPop - Real Employee Portal View
// Implements the complete employee portal specified in Idea-Discription.txt:
// 1. Desktop slim sidebar with 6 navigation menu items:
//    - Home
//    - Weekly Survey
//    - My Wellbeing
//    - Games
//    - My Account
//    - Log Out
// 2. Responsive mobile navigation drawer
// 3. Employee Home Page with Weekly Check-in, Personal Wellbeing, Moments of Calm, and Survey Reminders
// 4. One-question-at-a-time interactive 30-question randomized survey with progress saving,
//    review screen, and submission with normalized non-clinical wellbeing scoring
// 5. My Wellbeing page showing authenticated employee's real historical trends and category breakdown
// 6. Clean empty Games page ("Take a moment for yourself.")
// 7. My Account page with employee profile details and secure logout

import { renderGamesLibrary } from '../games/views/gameLibraryView.js';
import { renderCompanionView } from './companionView.js';

let activePortalSubtab = 'home'; // 'home' | 'survey' | 'wellbeing' | 'companion' | 'games' | 'account'
let currentEmployeeData = null;
let currentDashboardData = null;
let activeSurveyAttempt = null; // In-memory survey state for active attempt
let activeQuestionIndex = 0; // 0 to 29
let isSurveyReviewMode = false;
let isSurveySubmitting = false;

// Helper to get auth headers (supports both cookie and bearer token)
export function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionStorage.getItem('calmpop_session_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function renderEmployeePortalView(subtab = 'home', containerId = 'app-view-container') {
  // Normalize subtab
  if (subtab === 'history') subtab = 'wellbeing';
  activePortalSubtab = subtab;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Show loading skeleton while verifying real server session
  container.innerHTML = `
    <div class="min-h-screen bg-background flex items-center justify-center p-8">
      <div class="text-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto animate-pulse">
          <span class="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
        </div>
        <p class="text-sm font-semibold text-on-surface">Verifying CalmPop secure session...</p>
        <p class="text-xs text-outline">Authenticating against server database</p>
      </div>
    </div>
  `;

  try {
    // 1. Verify Session with Server API
    const authRes = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });

    if (!authRes.ok) {
      sessionStorage.removeItem('calmpop_session_token');
      window.showToast("Please sign in to access the employee portal", "lock");
      window.navigateView('login');
      return;
    }

    const authData = await authRes.json();
    currentEmployeeData = authData.employee;
    sessionStorage.setItem('calmpop_employee_id', currentEmployeeData.id);
    sessionStorage.setItem('calmpop_company_id', currentEmployeeData.companyId);

    // 2. Fetch Employee Dashboard Data
    const dashRes = await fetch('/api/employee/dashboard', {
      headers: getAuthHeaders()
    });
    currentDashboardData = dashRes.ok ? await dashRes.json() : null;

    // 3. Render Authenticated Portal Layout
    renderPortalLayout(container, currentEmployeeData, currentDashboardData, activePortalSubtab);

  } catch (err) {
    console.error('Error loading employee portal:', err);
    container.innerHTML = `
      <div class="min-h-screen bg-background flex items-center justify-center p-8">
        <div class="max-w-md w-full bg-surface-container-lowest p-6 rounded-3xl border border-surface-container text-center space-y-4">
          <span class="material-symbols-outlined text-error text-[36px]">cloud_off</span>
          <h3 class="font-bold text-lg text-on-surface">Unable to connect to server</h3>
          <p class="text-xs text-outline">We could not verify your session with the CalmPop backend server.</p>
          <div class="flex items-center justify-center gap-3">
            <button onclick="window.navigateView('login')" class="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold">
              Return to Login
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Render main layout with slim sidebar on desktop and main content area
function renderPortalLayout(container, employee, dashboard, subtab) {
  const isCheckinDue = dashboard?.isCheckinDue ?? true;

  container.innerHTML = `
    <div class="min-h-screen bg-background flex flex-col md:flex-row">
      
      <!-- DESKTOP SLIM SIDEBAR (Left) -->
      <aside class="hidden md:flex flex-col justify-between w-64 bg-surface-container-lowest border-r border-surface-container sticky top-0 h-screen p-5 z-30 flex-shrink-0">
        
        <!-- Top Section: Logo & Brand -->
        <div class="space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-surface-container/60">
            <a href="#employee" onclick="window.navigateView('employee', 'home')" class="flex items-center gap-3 group">
              <img alt="CalmPop Logo" class="h-8 w-auto object-contain transition-transform group-hover:scale-105" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
              <div>
                <span class="font-headline-sm text-base font-bold text-on-surface block leading-tight">CalmPop</span>
                <span class="text-[10px] text-primary font-semibold uppercase tracking-wider block">Employee Portal</span>
              </div>
            </a>
          </div>

          <!-- 6 Sidebar Menu Items -->
          <nav class="space-y-1.5" aria-label="Employee Portal Navigation">
            
            <!-- 1. Home -->
            <button 
              type="button" 
              onclick="window.navigateView('employee', 'home')"
              class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${subtab === 'home' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}"
            >
              <span class="material-symbols-outlined text-[20px] ${subtab === 'home' ? 'text-white' : 'text-outline'}">home</span>
              <span>Home</span>
            </button>

            <!-- 2. Weekly Survey -->
            <button 
              type="button" 
              onclick="window.navigateView('employee', 'survey')"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${subtab === 'survey' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px] ${subtab === 'survey' ? 'text-white' : 'text-outline'}">fact_check</span>
                <span>Weekly Survey</span>
              </div>
              ${isCheckinDue ? `
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${subtab === 'survey' ? 'bg-white/20 text-white' : 'bg-tertiary-fixed text-on-tertiary-fixed'}">
                  Due
                </span>
              ` : `
                <span class="material-symbols-outlined text-[16px] text-tertiary">check</span>
              `}
            </button>

            <!-- 3. My Wellbeing -->
            <button 
              type="button" 
              onclick="window.navigateView('employee', 'wellbeing')"
              class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${subtab === 'wellbeing' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}"
            >
              <span class="material-symbols-outlined text-[20px] ${subtab === 'wellbeing' ? 'text-white' : 'text-outline'}">self_improvement</span>
              <span>My Wellbeing</span>
            </button>

            <!-- 4. AI Companion -->
            <button 
              type="button" 
              onclick="window.navigateView('employee', 'companion')"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${subtab === 'companion' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px] ${subtab === 'companion' ? 'text-white' : 'text-outline'}">smart_toy</span>
                <span>AI Companion</span>
              </div>
              <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold ${subtab === 'companion' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">
                AI
              </span>
            </button>

            <!-- 5. Games -->
            <button 
              type="button" 
              onclick="window.navigateView('employee', 'games')"
              class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${(subtab === 'games' || subtab.startsWith('games/')) ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}"
            >
              <span class="material-symbols-outlined text-[20px] ${(subtab === 'games' || subtab.startsWith('games/')) ? 'text-white' : 'text-outline'}">sports_esports</span>
              <span>Games</span>
            </button>

            <!-- 6. My Account -->
            <button 
              type="button" 
              onclick="window.navigateView('employee', 'account')"
              class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${subtab === 'account' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}"
            >
              <span class="material-symbols-outlined text-[20px] ${subtab === 'account' ? 'text-white' : 'text-outline'}">person</span>
              <span>My Account</span>
            </button>

            <!-- 7. Log Out -->
            <button 
              type="button" 
              onclick="window.handleEmployeeLogout()"
              class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-error hover:bg-error-container/20 transition-all"
            >
              <span class="material-symbols-outlined text-[20px] text-error">logout</span>
              <span>Log Out</span>
            </button>

          </nav>
        </div>

        <!-- Bottom Section: Employee Profile Avatar & Details -->
        <div class="pt-4 border-t border-surface-container/60 flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            ${(employee.name || 'E').charAt(0)}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-bold text-xs text-on-surface truncate">${employee.name}</p>
            <p class="text-[10px] text-outline truncate">${employee.companyName} • <span class="font-mono text-primary font-bold">@${employee.username}</span></p>
          </div>
        </div>

      </aside>

      <!-- MOBILE TOP HEADER & NAVIGATION BAR -->
      <div class="md:hidden bg-surface-container-lowest border-b border-surface-container sticky top-0 z-40">
        <div class="px-4 py-3 flex items-center justify-between">
          <a href="#employee" onclick="window.navigateView('employee', 'home')" class="flex items-center gap-2">
            <img alt="CalmPop Logo" class="h-7 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
          </a>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="window.toggleEmployeeMobileDrawer()"
              class="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              <span id="employee-mobile-menu-icon" class="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer -->
        <div id="employee-mobile-drawer" class="hidden border-t border-surface-container bg-surface-container-lowest px-4 py-3 space-y-1">
          <button onclick="window.navigateView('employee', 'home'); window.toggleEmployeeMobileDrawer(true);" class="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold ${subtab === 'home' ? 'bg-primary text-white' : 'text-on-surface'}">Home</button>
          <button onclick="window.navigateView('employee', 'survey'); window.toggleEmployeeMobileDrawer(true);" class="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold ${subtab === 'survey' ? 'bg-primary text-white' : 'text-on-surface'}">Weekly Survey ${isCheckinDue ? '• Due' : ''}</button>
          <button onclick="window.navigateView('employee', 'wellbeing'); window.toggleEmployeeMobileDrawer(true);" class="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold ${subtab === 'wellbeing' ? 'bg-primary text-white' : 'text-on-surface'}">My Wellbeing</button>
          <button onclick="window.navigateView('employee', 'companion'); window.toggleEmployeeMobileDrawer(true);" class="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold ${subtab === 'companion' ? 'bg-primary text-white' : 'text-on-surface'}">AI Companion</button>
          <button onclick="window.navigateView('employee', 'games'); window.toggleEmployeeMobileDrawer(true);" class="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold ${(subtab === 'games' || subtab.startsWith('games/')) ? 'bg-primary text-white' : 'text-on-surface'}">Games</button>
          <button onclick="window.navigateView('employee', 'account'); window.toggleEmployeeMobileDrawer(true);" class="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold ${subtab === 'account' ? 'bg-primary text-white' : 'text-on-surface'}">My Account</button>
          <button onclick="window.handleEmployeeLogout()" class="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold text-error">Log Out</button>
        </div>
      </div>

      <!-- MAIN CONTENT VIEW AREA -->
      <main class="flex-1 min-w-0 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        ${renderSubtabView(subtab, employee, dashboard)}
      </main>

    </div>
  `;

  // Post-render lifecycle setups
  if (subtab === 'survey') {
    initSurveyLifecycle();
  } else if (subtab === 'games' || subtab.startsWith('games/')) {
    const requestedGameId = subtab.startsWith('games/') ? subtab.replace('games/', '') : null;
    renderGamesLibrary('games-page-root', requestedGameId);
  } else if (subtab === 'companion') {
    renderCompanionView('companion-view-root');
  }
}

// Router switcher for subtabs
function renderSubtabView(subtab, employee, dashboard) {
  if (subtab === 'games' || subtab.startsWith('games/')) {
    return renderGamesPage();
  }
  switch (subtab) {
    case 'survey':
      return renderSurveyPage();
    case 'wellbeing':
      return renderWellbeingPage(employee);
    case 'companion':
      return `<div id="companion-view-root"></div>`;
    case 'account':
      return renderAccountPage(employee);
    case 'home':
    default:
      return renderHomePage(employee, dashboard);
  }
}

// ==========================================
// 1. EMPLOYEE HOME PAGE (Section 3 of spec)
// ==========================================
function renderHomePage(employee, dashboard) {
  const isCheckinDue = dashboard?.isCheckinDue ?? true;
  const status = dashboard?.status || (isCheckinDue ? 'ready' : 'completed');
  const stats = dashboard?.stats || { totalCompleted: 0, averageStressIndex: null, streakWeeks: 0 };
  const recentSurveys = dashboard?.recentSurveys || [];
  const lastCompletedDate = dashboard?.lastCompletedDate 
    ? new Date(dashboard.lastCompletedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
    : null;
  const nextScheduledDate = dashboard?.nextScheduledDate || "Next survey date has not yet been set";

  return `
    <div class="space-y-6">
      
      <!-- Welcome Headline Banner -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>${employee.companyName} (${employee.companyId})</span>
        </div>
        <h1 class="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
          Welcome back, ${employee.name}
        </h1>
        <p class="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Take a moment to check in with yourself and make space for a calmer workday.
        </p>
      </div>

      <!-- AI Wellbeing Companion Quick Banner -->
      <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-surface-container-lowest border border-primary/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <span class="material-symbols-outlined text-[26px]">smart_toy</span>
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h2 class="font-bold text-sm sm:text-base text-on-surface">CalmPop AI Companion</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary">Confidential</span>
            </div>
            <p class="text-xs text-on-surface-variant max-w-xl">
              Have workplace stress, high workload, or a difficult situation on your mind? Talk it through with your intelligent wellbeing companion.
            </p>
          </div>
        </div>
        <button 
          type="button" 
          onclick="window.navigateView('employee', 'companion')"
          class="px-5 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all flex-shrink-0"
        >
          <span>Start Conversation</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <!-- Grid of Home Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- CARD 1: Weekly Check-in (Primary Action) -->
        <div class="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-7 rounded-3xl border border-surface-container shadow-xs flex flex-col justify-between space-y-5">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px] text-primary">assignment</span>
                <span>Weekly Check-In</span>
              </span>
              
              ${status === 'completed' ? `
                <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                  <span>Survey Completed</span>
                </span>
              ` : status === 'in_progress' ? `
                <span class="px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container text-xs font-bold">
                  In Progress (${dashboard?.answeredCount || 0}/30)
                </span>
              ` : `
                <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                  Ready to Start
                </span>
              `}
            </div>

            <div>
              <h2 class="font-headline-sm text-xl font-bold text-on-surface">
                ${status === 'completed' ? 'Your Weekly Check-in is Complete' : 'Weekly Wellbeing Check-in'}
              </h2>
              <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">
                ${status === 'completed' 
                  ? 'Thank you for completing this week’s pulse check-in. Your responses have been saved securely.'
                  : 'A 30-question randomized pulse designed to assess workload, focus, recovery, and workplace support.'}
              </p>
            </div>

            <!-- Survey Details Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div class="p-3 bg-surface-container-low rounded-2xl">
                <span class="text-[10px] text-outline uppercase font-semibold block">Questions</span>
                <span class="font-bold text-sm text-on-surface mt-0.5 block">30 Questions</span>
              </div>
              <div class="p-3 bg-surface-container-low rounded-2xl">
                <span class="text-[10px] text-outline uppercase font-semibold block">Est. Time</span>
                <span class="font-bold text-sm text-on-surface mt-0.5 block">${dashboard?.estimatedMinutes || '5–7 mins'}</span>
              </div>
              <div class="p-3 bg-surface-container-low rounded-2xl">
                <span class="text-[10px] text-outline uppercase font-semibold block">Last Completed</span>
                <span class="font-bold text-sm text-on-surface mt-0.5 block truncate">${lastCompletedDate || 'None yet'}</span>
              </div>
              <div class="p-3 bg-surface-container-low rounded-2xl">
                <span class="text-[10px] text-outline uppercase font-semibold block">Survey Cycle</span>
                <span class="font-bold text-sm text-primary mt-0.5 block">${dashboard?.currentWeek || 'Weekly'}</span>
              </div>
            </div>
          </div>

          <!-- Primary Action Button -->
          <div class="pt-2">
            ${status === 'completed' ? `
              <div class="flex flex-col sm:flex-row items-center gap-3">
                <button 
                  type="button" 
                  onclick="window.navigateView('employee', 'wellbeing')" 
                  class="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span class="material-symbols-outlined text-[16px]">visibility</span>
                  <span>View Results</span>
                </button>
                <span class="text-[11px] text-outline text-center sm:text-left">
                  Multiple submissions for the same scheduled weekly period are disabled.
                </span>
              </div>
            ` : status === 'in_progress' ? `
              <button 
                type="button" 
                onclick="window.navigateView('employee', 'survey')" 
                class="w-full sm:w-auto px-6 py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Continue Survey (${dashboard?.answeredCount || 0} of 30 Answered)</span>
              </button>
            ` : `
              <button 
                type="button" 
                onclick="window.navigateView('employee', 'survey')" 
                class="w-full sm:w-auto px-6 py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Start Weekly Survey</span>
              </button>
            `}
          </div>
        </div>

        <!-- CARD 2: Moments of Calm (Games introduction) -->
        <div class="lg:col-span-5 bg-surface-container-lowest p-6 sm:p-7 rounded-3xl border border-surface-container shadow-xs flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span class="material-symbols-outlined text-[18px]">spa</span>
              <span>Moments of Calm</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface">
              Mindful Resets & Games
            </h2>
            <p class="text-xs text-on-surface-variant leading-relaxed">
              Take a quiet pause between tasks. Our Games section provides short activities designed to help you pause, recharge, and reset during demanding workdays.
            </p>
          </div>

          <div class="p-4 bg-surface-container-low rounded-2xl flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[26px]">sports_esports</span>
            </div>
            <div class="text-xs">
              <p class="font-bold text-on-surface">Calm Games Space</p>
              <p class="text-outline text-[11px]">Reserved for restorative activities</p>
            </div>
          </div>

          <div>
            <button 
              type="button" 
              onclick="window.navigateView('employee', 'games')" 
              class="w-full py-2.5 rounded-full bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Explore Games</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- CARD 3: Personal Wellbeing History (Only actual data) -->
        <div class="lg:col-span-8 bg-surface-container-lowest p-6 sm:p-7 rounded-3xl border border-surface-container shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-headline-sm text-base font-bold text-on-surface">Personal Wellbeing</h2>
              <p class="text-xs text-on-surface-variant">Your confidential completed survey history</p>
            </div>
            <button onclick="window.navigateView('employee', 'wellbeing')" class="text-xs font-semibold text-primary hover:underline">
              View Detailed Report
            </button>
          </div>

          ${recentSurveys.length === 0 ? `
            <!-- Friendly Empty State: No fictional data! -->
            <div class="p-8 text-center rounded-2xl bg-surface-container-low border border-dashed border-surface-container space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-surface-container-high text-outline flex items-center justify-center mx-auto">
                <span class="material-symbols-outlined text-[26px]">history_edu</span>
              </div>
              <h3 class="font-bold text-xs sm:text-sm text-on-surface">No Completed Check-Ins Yet</h3>
              <p class="text-xs text-outline max-w-sm mx-auto leading-relaxed">
                Take your first 30-question weekly check-in to generate your confidential personal wellbeing indicators.
              </p>
              <button onclick="window.navigateView('employee', 'survey')" class="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs shadow-xs">
                Start Your First Check-In
              </button>
            </div>
          ` : `
            <div class="space-y-3">
              ${recentSurveys.map(s => `
                <div class="p-3.5 bg-surface-container-low rounded-2xl flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center font-bold text-xs font-mono">
                      ${s.stress_level}%
                    </div>
                    <div>
                      <p class="font-bold text-on-surface">${s.sentiment || 'Calm & Steady'}</p>
                      <p class="text-[11px] text-outline">${new Date(s.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • Week ${s.week_identifier}</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-surface-container text-on-surface font-semibold text-[11px]">
                    Workload: ${s.workload_score}/5
                  </span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- CARD 4: Survey Reminders -->
        <div class="lg:col-span-4 bg-surface-container-lowest p-6 sm:p-7 rounded-3xl border border-surface-container shadow-xs flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-primary">schedule</span>
              <span>Survey Reminders</span>
            </span>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Schedule & Cadence</h3>
            <p class="text-xs text-on-surface-variant leading-relaxed">
              ${nextScheduledDate 
                ? `Next scheduled weekly cycle: <strong class="text-on-surface">${nextScheduledDate}</strong>` 
                : 'The next survey date has not yet been set by your administrator.'}
            </p>
          </div>

          <div class="p-3.5 bg-surface-container-low rounded-2xl text-[11px] text-outline space-y-1">
            <div class="flex items-center gap-1.5 font-semibold text-on-surface">
              <span class="material-symbols-outlined text-[15px] text-tertiary">lock</span>
              <span>Anonymized Workplace Aggregations</span>
            </div>
            <p class="leading-relaxed">
              Individual responses are confidential. Only high-level department trends are shared when at least 5 employees participate.
            </p>
          </div>
        </div>

      </div>

    </div>
  `;
}

// ==========================================
// 2. INTERACTIVE 30-QUESTION RANDOMIZED SURVEY (Sections 6–9)
// ==========================================
function renderSurveyPage() {
  return `
    <div id="survey-interactive-container" class="max-w-3xl mx-auto space-y-6">
      <div class="p-12 text-center text-outline text-xs">
        <span class="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        <p class="mt-2">Initializing your weekly survey...</p>
      </div>
    </div>
  `;
}

// Lifecycle to fetch/start the survey attempt
async function initSurveyLifecycle() {
  const container = document.getElementById('survey-interactive-container');
  if (!container) return;

  try {
    // 1. Fetch current attempt status
    const currentRes = await fetch('/api/employee/survey/current', {
      headers: getAuthHeaders()
    });

    if (!currentRes.ok) {
      container.innerHTML = `<p class="p-8 text-center text-error text-xs">Failed to load survey status.</p>`;
      return;
    }

    const currentData = await currentRes.json();

    // If survey is already completed for this week, render completion screen!
    if (currentData.status === 'completed') {
      renderSurveyCompletedScreen(container, currentData);
      return;
    }

    // If in progress with loaded questions, use it
    if (currentData.status === 'in_progress' && currentData.questions?.length === 30) {
      activeSurveyAttempt = currentData;
      activeQuestionIndex = currentData.currentQuestionIndex || 0;
      isSurveyReviewMode = false;
      renderCurrentQuestionView(container);
      return;
    }

    // Otherwise, start or resume attempt via POST /api/employee/survey/start
    const startRes = await fetch('/api/employee/survey/start', {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!startRes.ok) {
      const errData = await startRes.json();
      if (errData.code === 'ALREADY_COMPLETED') {
        const wellbeingRes = await fetch('/api/employee/wellbeing', { headers: getAuthHeaders() });
        const wellbeingData = await wellbeingRes.json();
        renderSurveyCompletedScreen(container, wellbeingData.latestReport);
        return;
      }
      container.innerHTML = `<p class="p-8 text-center text-error text-xs">${errData.error || 'Failed to start survey'}</p>`;
      return;
    }

    const startData = await startRes.json();
    activeSurveyAttempt = startData;
    activeQuestionIndex = startData.currentQuestionIndex || 0;
    isSurveyReviewMode = false;
    renderCurrentQuestionView(container);

  } catch (err) {
    console.error('Survey lifecycle error:', err);
    container.innerHTML = `<p class="p-8 text-center text-error text-xs">Network error initializing survey.</p>`;
  }
}

// Render one question at a time
function renderCurrentQuestionView(container) {
  if (!activeSurveyAttempt || !activeSurveyAttempt.questions) return;

  const questions = activeSurveyAttempt.questions;
  const total = questions.length;

  // If beyond last question, render review screen
  if (isSurveyReviewMode || activeQuestionIndex >= total) {
    renderSurveyReviewView(container);
    return;
  }

  const q = questions[activeQuestionIndex];
  const responses = activeSurveyAttempt.responses || {};
  const currentAnswer = responses[q.id];
  const hasSelectedAnswer = currentAnswer && typeof currentAnswer.score === 'number';
  const progressPercent = Math.round(((activeQuestionIndex + 1) / total) * 100);

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Distraction-Free Header Bar -->
      <div class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img alt="CalmPop Logo" class="h-6 w-auto" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
            <span class="font-headline-sm text-sm font-bold text-on-surface">Weekly Wellbeing Check-in</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Question ${activeQuestionIndex + 1} of ${total}
            </span>
            <button 
              type="button" 
              onclick="window.saveAndExitSurvey()" 
              class="text-xs text-outline hover:text-on-surface font-semibold px-3 py-1.5 rounded-full hover:bg-surface-container transition-colors flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">logout</span>
              <span>Save & Exit</span>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-surface-container h-2 rounded-full overflow-hidden">
          <div class="bg-primary h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
        </div>
      </div>

      <!-- Main Question Card (ONE QUESTION AT A TIME) -->
      <div class="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container shadow-sm space-y-6">
        
        <!-- Category Badge -->
        <div class="flex items-center justify-between text-xs text-outline">
          <span class="px-3 py-1 rounded-full bg-surface-container font-semibold text-on-surface-variant uppercase tracking-wider text-[10px]">
            ${q.category}
          </span>
          <span class="text-[11px] text-outline font-medium">Select one answer to continue</span>
        </div>

        <!-- Question Heading -->
        <h2 class="font-headline-md text-xl sm:text-2xl font-bold text-on-surface leading-snug">
          ${q.question}
        </h2>

        <!-- Answer Options Cards -->
        <div class="space-y-3 pt-2">
          ${q.options.map((opt, idx) => {
            const isSelected = currentAnswer?.answerIndex === idx;
            return `
              <button 
                type="button" 
                onclick="window.selectSurveyAnswer('${q.id}', ${opt.value}, ${idx}, '${opt.text.replace(/'/g, "\\'")}')"
                class="w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  isSelected 
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs' 
                    : 'border-surface-container bg-surface-container-lowest hover:bg-surface-container-low hover:border-outline-variant text-on-surface'
                }"
              >
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected ? 'border-primary bg-primary text-white' : 'border-outline text-outline group-hover:border-primary'
                  }">
                    ${isSelected ? '✓' : String.fromCharCode(65 + idx)}
                  </div>
                  <span class="text-xs sm:text-sm font-semibold">${opt.text}</span>
                </div>

                <span class="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100 text-primary' : 'text-outline'}">
                  check_circle
                </span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Navigation Buttons: Back and Continue -->
        <div class="pt-6 border-t border-surface-container flex items-center justify-between">
          <button 
            type="button" 
            onclick="window.navigateSurveyQuestion(-1)"
            ${activeQuestionIndex === 0 ? 'disabled' : ''}
            class="px-5 py-2.5 rounded-full border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back</span>
          </button>

          <div class="flex items-center gap-3">
            <span class="text-[11px] text-outline hidden sm:inline">
              ${hasSelectedAnswer ? 'Answer selected' : 'Please select an option'}
            </span>

            <button 
              type="button" 
              onclick="window.navigateSurveyQuestion(1)"
              ${!hasSelectedAnswer ? 'disabled' : ''}
              class="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>${activeQuestionIndex === total - 1 ? 'Review Check-In' : 'Continue'}</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

// Select an answer and save progress to backend
window.selectSurveyAnswer = async function(questionId, score, answerIndex, answerText) {
  if (!activeSurveyAttempt) return;

  if (!activeSurveyAttempt.responses) activeSurveyAttempt.responses = {};
  activeSurveyAttempt.responses[questionId] = {
    score,
    answerIndex,
    answerText
  };

  // Re-render immediately to show visual selection
  const container = document.getElementById('survey-interactive-container');
  if (container) renderCurrentQuestionView(container);

  // Asynchronously persist progress to SQLite database
  try {
    await fetch('/api/employee/survey/save-progress', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        attemptId: activeSurveyAttempt.attemptId,
        questionId,
        score,
        answerIndex,
        answerText,
        currentQuestionIndex: activeQuestionIndex
      })
    });
  } catch (err) {
    console.warn('Background save progress failed:', err);
  }
};

// Navigate between questions
window.navigateSurveyQuestion = function(direction) {
  if (!activeSurveyAttempt || !activeSurveyAttempt.questions) return;
  const total = activeSurveyAttempt.questions.length;

  activeQuestionIndex += direction;

  const container = document.getElementById('survey-interactive-container');
  if (!container) return;

  if (activeQuestionIndex >= total) {
    isSurveyReviewMode = true;
    renderSurveyReviewView(container);
  } else {
    activeQuestionIndex = Math.max(0, activeQuestionIndex);
    isSurveyReviewMode = false;
    renderCurrentQuestionView(container);
  }
};

// Jump directly to a question (e.g. from review screen)
window.jumpToSurveyQuestion = function(index) {
  activeQuestionIndex = index;
  isSurveyReviewMode = false;
  const container = document.getElementById('survey-interactive-container');
  if (container) renderCurrentQuestionView(container);
};

// Save and Exit button
window.saveAndExitSurvey = function() {
  window.showToast("Progress saved securely. You can continue anytime.", "save");
  window.navigateView('employee', 'home');
};

// ==========================================
// REVIEW SCREEN (Section 9 of spec)
// ==========================================
function renderSurveyReviewView(container) {
  if (!activeSurveyAttempt || !activeSurveyAttempt.questions) return;

  const questions = activeSurveyAttempt.questions;
  const responses = activeSurveyAttempt.responses || {};
  const total = questions.length;
  const answeredCount = Object.keys(responses).length;
  const unansweredCount = total - answeredCount;
  const isComplete = unansweredCount === 0;

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Review Header Card -->
      <div class="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            Review Check-In
          </span>
          <span class="text-xs text-outline font-semibold">
            ${answeredCount} of ${total} Answered
          </span>
        </div>

        <h2 class="font-headline-md text-2xl font-bold text-on-surface">
          Review Your 30 Responses
        </h2>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Please confirm your answers before final submission. All 30 questions must be completed.
        </p>

        ${!isComplete ? `
          <div class="p-3.5 bg-error-container/30 border border-error/30 rounded-2xl flex items-center gap-2 text-xs text-error font-semibold">
            <span class="material-symbols-outlined text-[18px]">warning</span>
            <span>You have ${unansweredCount} unanswered questions remaining. Please answer all questions before submitting.</span>
          </div>
        ` : `
          <div class="p-3.5 bg-tertiary-fixed/30 border border-tertiary/20 rounded-2xl flex items-center gap-2 text-xs text-tertiary font-bold">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            <span>All 30 questions are answered and ready for final submission.</span>
          </div>
        `}
      </div>

      <!-- Question Summary List -->
      <div class="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-xs space-y-3">
        <h3 class="font-bold text-xs uppercase tracking-wider text-outline mb-2">Questions Checklist</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
          ${questions.map((q, idx) => {
            const resp = responses[q.id];
            const isAnswered = resp && typeof resp.score === 'number';
            return `
              <div class="p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                isAnswered ? 'bg-surface-container-low border-surface-container' : 'bg-error-container/20 border-error/30 text-error'
              }">
                <div class="min-w-0 flex-1 pr-2">
                  <span class="text-[10px] text-outline font-bold block">Q${idx + 1} • ${q.category}</span>
                  <p class="font-semibold text-on-surface truncate text-[11px]">${q.question}</p>
                  <p class="text-[10px] text-primary font-medium mt-0.5 truncate">${isAnswered ? `Answer: ${resp.answerText}` : 'Unanswered'}</p>
                </div>
                <button 
                  type="button" 
                  onclick="window.jumpToSurveyQuestion(${idx})" 
                  class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-primary transition-colors flex-shrink-0"
                >
                  ${isAnswered ? 'Edit' : 'Answer'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Review Actions -->
      <div class="p-5 bg-surface-container-lowest rounded-3xl border border-surface-container shadow-xs flex items-center justify-between">
        <button 
          type="button" 
          onclick="window.jumpToSurveyQuestion(0)" 
          class="px-5 py-2.5 rounded-full border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface"
        >
          Return to Question 1
        </button>

        <button 
          type="button" 
          id="btn-final-survey-submit"
          onclick="window.submitFinalSurvey()"
          ${!isComplete || isSurveySubmitting ? 'disabled' : ''}
          class="px-7 py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Submit Weekly Check-In</span>
          <span class="material-symbols-outlined text-[18px]">send</span>
        </button>
      </div>

    </div>
  `;
}

// Final submission handler
window.submitFinalSurvey = async function() {
  if (isSurveySubmitting || !activeSurveyAttempt) return;

  const btn = document.getElementById('btn-final-survey-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Submitting...</span><span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>`;
  }
  isSurveySubmitting = true;

  try {
    const res = await fetch('/api/employee/survey/submit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        attemptId: activeSurveyAttempt.attemptId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      window.showToast(data.error || "Failed to submit survey", "error");
      isSurveySubmitting = false;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Submit Weekly Check-In</span><span class="material-symbols-outlined text-[18px]">send</span>`;
      }
      return;
    }

    window.showToast("Weekly check-in submitted successfully!", "task_alt");
    
    // Render completion screen
    const container = document.getElementById('survey-interactive-container');
    if (container) {
      renderSurveyCompletedScreen(container, {
        submitted_at: data.submittedAt,
        stress_index: data.report?.stressIndex,
        wellbeing_category: data.report?.indicatorCategory,
        category_scores: data.report?.categoryScores,
        recommendation: data.report?.recommendation
      });
    }

  } catch (err) {
    console.error('Final submit error:', err);
    window.showToast("Network error submitting survey", "error");
    isSurveySubmitting = false;
  }
};

// ==========================================
// COMPLETION SCREEN (Section 9 of spec)
// ==========================================
function renderSurveyCompletedScreen(container, reportData) {
  const dateStr = reportData?.submitted_at 
    ? new Date(reportData.submitted_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Today';

  const stressIndex = typeof reportData?.stress_index === 'number' ? reportData.stress_index : 32;
  const category = reportData?.wellbeing_category || 'Lower Stress Indicator';
  const categoryScores = reportData?.category_scores || {};

  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6">
      
      <div class="p-8 sm:p-10 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mx-auto shadow-md">
          <span class="material-symbols-outlined text-[32px]">task_alt</span>
        </div>

        <div class="space-y-1.5">
          <h1 class="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
            Thank you for checking in.
          </h1>
          <p class="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Your weekly check-in has been recorded. Take a moment for yourself before returning to your day.
          </p>
        </div>

        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs text-outline font-semibold">
          <span>Recorded on ${dateStr}</span>
          <span>•</span>
          <span class="text-tertiary font-bold">Status: Completed</span>
        </div>

        <!-- Calculated Wellbeing Score Summary -->
        <div class="p-6 bg-surface-container-low rounded-3xl border border-surface-container/60 text-left space-y-4 mt-6">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-bold text-outline">Workplace Wellbeing Indicator</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold ${
              stressIndex <= 35 ? 'text-tertiary bg-tertiary-fixed/40' : stressIndex <= 65 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'
            }">
              ${category}
            </span>
          </div>

          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold font-mono text-on-surface">${stressIndex}%</span>
            <span class="text-xs text-outline">Overall Stress Indicator Index</span>
          </div>

          <div class="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-1000" style="width: ${stressIndex}%"></div>
          </div>

          <p class="text-xs text-on-surface-variant leading-relaxed">
            ${reportData?.recommendation || 'Your pacing indicators have been securely aggregated. Take a moment to stretch and hydrate.'}
          </p>

          <p class="text-[10px] text-outline italic pt-2 border-t border-surface-container/60">
            * Non-clinical indicator based on workplace wellbeing factors. Not a diagnostic tool.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            type="button" 
            onclick="window.navigateView('employee', 'home')"
            class="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-all shadow-xs"
          >
            Return to Home
          </button>

          <button 
            type="button" 
            onclick="window.navigateView('employee', 'games')"
            class="w-full sm:w-auto px-6 py-2.5 rounded-full bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px]">sports_esports</span>
            <span>Visit Games</span>
          </button>
        </div>

      </div>

    </div>
  `;
}

// ==========================================
// 3. MY WELLBEING PAGE (Section 11 of spec)
// ==========================================
function renderWellbeingPage(employee) {
  setTimeout(async () => {
    const content = document.getElementById('wellbeing-content-container');
    if (!content) return;

    try {
      const res = await fetch('/api/employee/wellbeing', {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        content.innerHTML = `<p class="p-8 text-center text-error text-xs">Failed to load wellbeing reports.</p>`;
        return;
      }

      const data = await res.json();
      const history = data.history || [];

      if (history.length === 0) {
        content.innerHTML = `
          <div class="p-12 text-center rounded-3xl bg-surface-container-lowest border border-dashed border-surface-container space-y-4">
            <div class="w-16 h-16 rounded-3xl bg-surface-container text-outline flex items-center justify-center mx-auto">
              <span class="material-symbols-outlined text-[32px]">self_improvement</span>
            </div>
            <h3 class="font-bold text-base text-on-surface">No Survey History Yet</h3>
            <p class="text-xs text-outline max-w-sm mx-auto leading-relaxed">
              Complete your first 30-question weekly check-in to track your personal wellbeing and workload pacing trends over time.
            </p>
            <button onclick="window.navigateView('employee', 'survey')" class="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs shadow-xs">
              Start Weekly Survey
            </button>
          </div>
        `;
        return;
      }

      const latest = history[0];
      const categoryScores = latest.category_scores || {};

      content.innerHTML = `
        <div class="space-y-6">
          
          <!-- Latest Completed Survey Card -->
          <div class="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-outline">Latest Pulse Result</span>
              <span class="text-xs text-outline">${new Date(latest.submitted_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • Week ${latest.week_identifier}</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-3xl sm:text-4xl font-bold font-mono text-primary">${latest.stress_index}%</span>
                <span class="text-xs text-outline block mt-0.5">Calculated Stress Indicator Index</span>
              </div>
              <span class="px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
                latest.stress_index <= 35 ? 'text-tertiary bg-tertiary-fixed/40' : latest.stress_index <= 65 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'
              }">
                ${latest.wellbeing_category || 'Healthy Calm'}
              </span>
            </div>

            <!-- Recommendation & Accessible Explanation -->
            <div class="p-4 bg-surface-container-low rounded-2xl text-xs space-y-2">
              <p class="font-semibold text-on-surface">Workplace Wellbeing Guidance:</p>
              <p class="text-on-surface-variant leading-relaxed">
                ${latest.recommendation || 'Your pacing indicators remain balanced. Maintain intentional hydration and micro-breaks between deliverables.'}
              </p>
            </div>

            <!-- Category Breakdown Bars if available -->
            ${Object.keys(categoryScores).length > 0 ? `
              <div class="pt-4 border-t border-surface-container/60 space-y-3">
                <h4 class="font-bold text-xs uppercase tracking-wider text-outline">Domain Breakdown</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  ${Object.entries(categoryScores).map(([cat, data]) => `
                    <div class="p-3 bg-surface-container-low rounded-xl space-y-1.5">
                      <div class="flex justify-between font-medium">
                        <span class="text-on-surface truncate">${cat}</span>
                        <span class="font-mono text-primary font-bold">${data.averageStress}%</span>
                      </div>
                      <div class="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div class="bg-primary h-full rounded-full" style="width: ${data.averageStress}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Non-Clinical Transparency Disclosure -->
            <p class="text-[10px] text-outline italic pt-2">
              * Note: These metrics represent transparent workplace wellbeing indicators, not clinical or medical diagnoses.
            </p>
          </div>

          <!-- Historical Completed Surveys Timeline -->
          <div class="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container shadow-xs space-y-4">
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Survey History & Trends</h3>
            
            <div class="space-y-3">
              ${history.map((item, idx) => `
                <div class="p-4 bg-surface-container-low rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-center font-mono font-bold text-primary">
                      ${item.stress_index}%
                    </div>
                    <div>
                      <p class="font-bold text-on-surface">${item.wellbeing_category || 'Completed'}</p>
                      <p class="text-[11px] text-outline">Week ${item.week_identifier} • ${new Date(item.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <span class="px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed font-bold text-[11px] self-start sm:self-center">
                    Status: Verified
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;

    } catch (err) {
      console.error('Wellbeing load error:', err);
      content.innerHTML = `<p class="p-8 text-center text-error text-xs">Error retrieving wellbeing data.</p>`;
    }
  }, 30);

  return `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-headline-lg text-2xl font-bold text-on-surface">My Wellbeing</h1>
          <p class="text-xs text-on-surface-variant">Confidential individual check-in trends and workplace pacing analysis</p>
        </div>

        <button onclick="window.navigateView('employee', 'survey')" class="px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-xs">
          New Check-In
        </button>
      </div>

      <div id="wellbeing-content-container">
        <div class="p-12 text-center text-outline text-xs">
          <span class="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
          <p class="mt-2">Loading your wellbeing records from SQLite database...</p>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 4. GAMES PAGE (Interactive 12 Stress-Relief Games Hub)
// ==========================================
function renderGamesPage() {
  return `
    <div id="games-page-root" class="w-full">
      <div class="py-12 text-center text-outline">
        <span class="material-symbols-outlined animate-spin text-[28px] text-primary">progress_activity</span>
        <p class="text-xs mt-2">Loading Mindful Resets & Games...</p>
      </div>
    </div>
  `;
}

// ==========================================
// 5. MY ACCOUNT PAGE (Section 15 of spec)
// ==========================================
function renderAccountPage(employee) {
  return `
    <div class="max-w-2xl mx-auto space-y-6">
      
      <div>
        <h1 class="font-headline-lg text-2xl font-bold text-on-surface">My Account</h1>
        <p class="text-xs text-on-surface-variant">Profile and company association details for authenticated employee</p>
      </div>

      <!-- Account Profile Card -->
      <div class="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container shadow-xs space-y-6">
        
        <div class="flex items-center gap-4 pb-6 border-b border-surface-container/60">
          <div class="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-xs">
            ${(employee.name || 'E').charAt(0)}
          </div>
          <div>
            <h2 class="font-headline-sm text-lg font-bold text-on-surface">${employee.name}</h2>
            <p class="text-xs text-outline">${employee.title || 'Team Member'} • ${employee.department || 'General'}</p>
          </div>
        </div>

        <!-- Detail Fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="p-3.5 bg-surface-container-low rounded-2xl">
            <span class="text-[10px] text-outline uppercase font-semibold block">Full Name</span>
            <span class="font-bold text-on-surface mt-0.5 block">${employee.name}</span>
          </div>

          <div class="p-3.5 bg-surface-container-low rounded-2xl">
            <span class="text-[10px] text-outline uppercase font-semibold block">Username</span>
            <span class="font-bold font-mono text-primary mt-0.5 block">@${employee.username}</span>
          </div>

          <div class="p-3.5 bg-surface-container-low rounded-2xl">
            <span class="text-[10px] text-outline uppercase font-semibold block">Company Name</span>
            <span class="font-bold text-on-surface mt-0.5 block">${employee.companyName}</span>
          </div>

          <div class="p-3.5 bg-surface-container-low rounded-2xl">
            <span class="text-[10px] text-outline uppercase font-semibold block">Company ID</span>
            <span class="font-bold font-mono text-on-surface mt-0.5 block">${employee.companyId}</span>
          </div>

          <div class="p-3.5 bg-surface-container-low rounded-2xl">
            <span class="text-[10px] text-outline uppercase font-semibold block">Email Address</span>
            <span class="font-bold text-on-surface mt-0.5 block">${employee.email || 'N/A'}</span>
          </div>

          <div class="p-3.5 bg-surface-container-low rounded-2xl">
            <span class="text-[10px] text-outline uppercase font-semibold block">Department</span>
            <span class="font-bold text-on-surface mt-0.5 block">${employee.department || 'Platform Engineering'}</span>
          </div>
        </div>

        <!-- Security Privacy Notice -->
        <div class="p-4 bg-surface-container-low rounded-2xl text-[11px] text-outline space-y-1">
          <div class="flex items-center gap-1.5 font-semibold text-on-surface">
            <span class="material-symbols-outlined text-[16px] text-tertiary">security</span>
            <span>Cryptographic Security Protection</span>
          </div>
          <p class="leading-relaxed">
            Your credentials and password hashes are never exposed to the client or company administrator interfaces. Sessions are cryptographically verified using server-managed secure tokens.
          </p>
        </div>

        <!-- Logout Action -->
        <div class="pt-4 border-t border-surface-container/60 flex items-center justify-between">
          <span class="text-xs text-outline">Ready to sign out of this device?</span>
          <button 
            type="button" 
            onclick="window.handleEmployeeLogout()" 
            class="px-5 py-2.5 rounded-full bg-error-container/40 hover:bg-error-container text-error text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>

      </div>

    </div>
  `;
}

// Mobile drawer toggle
window.toggleEmployeeMobileDrawer = function(forceClose) {
  const drawer = document.getElementById('employee-mobile-drawer');
  const icon = document.getElementById('employee-mobile-menu-icon');
  if (!drawer) return;

  const shouldClose = forceClose !== undefined ? forceClose : !drawer.classList.contains('hidden');
  if (shouldClose) {
    drawer.classList.add('hidden');
    if (icon) icon.textContent = 'menu';
  } else {
    drawer.classList.remove('hidden');
    if (icon) icon.textContent = 'close';
  }
};

// Global Logout Handler
window.handleEmployeeLogout = async function() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error('Logout error:', err);
  }

  sessionStorage.removeItem('calmpop_session_token');
  currentEmployeeData = null;
  currentDashboardData = null;
  activeSurveyAttempt = null;

  window.showToast("Logged out successfully", "logout");
  window.navigateView('login');
};
