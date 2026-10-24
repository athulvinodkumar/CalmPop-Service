// CalmPop - Games Library View
// Displays the complete 12 stress-relief games catalog with category filtering, search,
// milestone indicators, private reflections drawer, and interactive game runner.

import { GAMES_CATALOG, getGameById } from '../catalog.js';
import { GameSessionManager } from '../sessionManager.js';
import { GameShell } from '../gameShell.js';
import { PrivateStorageManager } from '../privateStorage.js';

let activeCategoryFilter = 'All';
let activeSearchQuery = '';
let activeRunningGameId = null;
let currentController = null;

export function renderGamesLibrary(containerId = 'games-page-root') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // If a game is actively running, render its interactive shell
  if (activeRunningGameId) {
    const game = getGameById(activeRunningGameId);
    if (game) {
      launchGameView(game, container);
      return;
    }
  }

  // Filter games
  const filtered = GAMES_CATALOG.filter(g => {
    const matchCat = activeCategoryFilter === 'All' || g.category === activeCategoryFilter;
    const matchSearch = !activeSearchQuery || 
      g.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) || 
      g.description.toLowerCase().includes(activeSearchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = ['All', 'Breathing', 'Puzzles', 'Reflection', 'Creative', 'Grounding', 'Relaxation', 'Stories'];

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- HERO HEADER -->
      <div class="bg-gradient-to-r from-primary/10 via-cyan-500/10 to-lime-500/10 p-6 sm:p-8 rounded-3xl border border-surface-container/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1.5 max-w-xl">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
              Moments of Calm
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-tertiary-fixed/30 text-tertiary-container text-[10px] font-bold">
              12 Fully Playable Activities
            </span>
          </div>
          <h1 class="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
            Mindful Resets & Games
          </h1>
          <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Take a quiet pause between tasks. Short interactive activities designed to help you pause, recharge, and reset during demanding workdays.
          </p>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button 
            type="button" 
            onclick="window.openGlobalPrivateReflectionsModal()"
            class="px-4 py-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container border border-surface-container text-xs font-semibold text-primary shadow-xs transition-all flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[18px]">folder_special</span>
            <span>My Private Reflections</span>
          </button>
        </div>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-low/50 p-3 rounded-2xl border border-surface-container">
        
        <!-- Category Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          ${categories.map(cat => `
            <button 
              type="button" 
              onclick="window.filterGamesCategory('${cat}')"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategoryFilter === cat ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
            >
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Search Input -->
        <div class="relative min-w-[200px] sm:min-w-[240px]">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
          <input 
            type="text" 
            id="games-search-input"
            value="${activeSearchQuery}"
            placeholder="Search activities..."
            oninput="window.handleGamesSearch(this.value)"
            class="w-full pl-9 pr-3 py-1.5 rounded-full bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

      </div>

      <!-- GAMES GRID (12 Interactive Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${filtered.map(game => `
          <div class="group bg-surface-container-lowest rounded-3xl border border-surface-container hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
            
            <!-- Card Header Illustration / Banner -->
            <div class="h-36 bg-gradient-to-tr ${game.color} p-4 flex flex-col justify-between relative overflow-hidden">
              <div class="flex items-center justify-between z-10">
                <span class="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[10px] font-bold text-on-surface shadow-xs">
                  ${game.category}
                </span>
                <span class="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-[10px] font-semibold text-outline">
                  ${game.typicalDuration}
                </span>
              </div>

              <!-- Center Big Icon & Subtle Art -->
              <div class="w-16 h-16 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center shadow-xs mx-auto group-hover:scale-110 transition-transform duration-300">
                <span class="material-symbols-outlined text-[36px]">${game.icon}</span>
              </div>

              <div class="flex items-center justify-between z-10 text-[10px] font-medium text-outline">
                <span class="px-2 py-0.5 rounded-full bg-surface-container-lowest/60">${game.badge}</span>
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Ready to play</span>
              </div>
            </div>

            <!-- Card Body Content -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 class="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                  ${game.title}
                </h3>
                <p class="text-xs text-on-surface-variant leading-relaxed mt-1 line-clamp-2">
                  ${game.description}
                </p>
              </div>

              <!-- Play Action Button -->
              <div class="pt-2">
                <button 
                  type="button" 
                  onclick="window.launchCalmGame('${game.id}')"
                  class="w-full py-2.5 rounded-full bg-surface-container hover:bg-primary text-on-surface hover:text-on-primary text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Play Activity</span>
                </button>
              </div>
            </div>

          </div>
        `).join('')}
      </div>

      ${filtered.length === 0 ? `
        <div class="text-center py-12 bg-surface-container-low/40 rounded-3xl border border-surface-container space-y-2">
          <span class="material-symbols-outlined text-[36px] text-outline">search_off</span>
          <p class="font-bold text-sm text-on-surface">No activities match your search</p>
          <p class="text-xs text-outline">Try selecting a different category or clearing your search query.</p>
        </div>
      ` : ''}

    </div>

    <!-- GLOBAL SAVED REFLECTIONS MODAL -->
    <dialog id="global-reflections-modal" class="modal-dialog">
      <div class="modal-card max-w-lg w-full bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-surface-container">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">folder_special</span>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">My Private Saved Reflections</h3>
          </div>
          <button type="button" onclick="document.getElementById('global-reflections-modal').close()" class="p-1 rounded-xl hover:bg-surface-container text-outline">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p class="text-xs text-outline">
          These personal items are private to your authenticated account and are never included in company analytics or reports.
        </p>

        <div id="global-reflections-list" class="max-h-80 overflow-y-auto space-y-2.5 pr-1 text-xs">
          <!-- Dynamically populated -->
        </div>

        <div class="pt-2 text-right">
          <button type="button" onclick="document.getElementById('global-reflections-modal').close()" class="px-5 py-2 rounded-full bg-surface-container text-xs font-semibold text-on-surface">
            Close
          </button>
        </div>
      </div>
    </dialog>
  `;
}

function launchGameView(game, container) {
  // Clean up any old running controller
  if (currentController && typeof currentController.destroy === 'function') {
    currentController.destroy();
    currentController = null;
  }

  const sessionManager = new GameSessionManager(game.id, {
    durationSeconds: game.defaultDuration || 180,
    employeeId: sessionStorage.getItem('calmpop_employee_id') || 'current_user',
    companyId: sessionStorage.getItem('calmpop_company_id') || 'current_org',
    settings: {
      autoCompleteOnDuration: false
    }
  });

  const shell = new GameShell({
    game,
    sessionManager,
    defaultDuration: game.defaultDuration || 180,
    durationOptions: game.durationOptions || [120, 180, 300],
    onExit: () => {
      activeRunningGameId = null;
      if (currentController && typeof currentController.destroy === 'function') {
        currentController.destroy();
        currentController = null;
      }
      renderGamesLibrary('games-page-root');
    }
  });

  // Render game inner HTML
  const innerHtml = game.render(sessionManager, {});
  container.innerHTML = shell.renderShell(innerHtml);

  // Hook listeners and instantiate controller
  shell.attachListeners();
  currentController = game.createController(sessionManager, {});
  currentController.init();

  // Start session
  sessionManager.start();
}

// Global actions exposed to window
if (typeof window !== 'undefined') {
  window.filterGamesCategory = function(cat) {
    activeCategoryFilter = cat;
    renderGamesLibrary('games-page-root');
  };

  window.handleGamesSearch = function(query) {
    activeSearchQuery = query;
    renderGamesLibrary('games-page-root');
  };

  window.launchCalmGame = function(gameId) {
    activeRunningGameId = gameId;
    const container = document.getElementById('games-page-root');
    if (container) {
      const game = getGameById(gameId);
      if (game) launchGameView(game, container);
    }
  };

  window.openGlobalPrivateReflectionsModal = async function() {
    const modal = document.getElementById('global-reflections-modal');
    const list = document.getElementById('global-reflections-list');
    if (!modal || !list) return;

    list.innerHTML = `
      <div class="text-center py-6 text-outline">
        <span class="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
        <p class="text-xs mt-1.5">Loading private reflections...</p>
      </div>
    `;
    modal.showModal();

    const items = await PrivateStorageManager.getPrivateItems();
    if (!items || items.length === 0) {
      list.innerHTML = `<p class="text-outline text-center py-8">You have no saved private reflections yet.</p>`;
      return;
    }

    list.innerHTML = items.map(item => {
      const data = item.content || {};
      const date = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      let typeLabel = 'Reflection';
      let summaryText = '';
      if (item.itemType === 'thought_reframer') {
        typeLabel = 'CBT Thought Reframe';
        summaryText = `"${data.thought || 'Untitled'}"`;
      } else if (item.itemType === 'weather_report') {
        typeLabel = 'Weather Scene';
        summaryText = `Elements: ${(data.elements || []).join(', ')}. ${data.privateNote ? `Note: "${data.privateNote}"` : ''}`;
      } else if (item.itemType === 'paper_crane') {
        typeLabel = 'Paper Crane Action';
        summaryText = `"${data.action || 'Untitled action'}" (${data.category})`;
      } else if (item.itemType === 'worry_balloon') {
        typeLabel = 'Worry Balloon Release';
        summaryText = `Category: ${data.category}. ${data.worryText ? `Worry: "${data.worryText}"` : ''}`;
      } else if (item.itemType === 'inkstorm_art') {
        typeLabel = 'Inkstorm Artwork';
        summaryText = `Custom fluid painting (${data.strokes || 0} strokes)`;
      }

      return `
        <div class="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container/60 space-y-1.5">
          <div class="flex items-center justify-between text-[11px] text-outline">
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">${typeLabel}</span>
            <div class="flex items-center gap-3">
              <span>${date}</span>
              <button 
                type="button" 
                onclick="window.deleteGlobalReflectionItem('${item.id}', '${item.itemType}')"
                class="text-error hover:underline flex items-center gap-0.5"
                title="Delete Permanently"
              >
                <span class="material-symbols-outlined text-[14px]">delete</span>
                <span>Delete</span>
              </button>
            </div>
          </div>
          <p class="font-medium text-on-surface text-xs leading-relaxed">${summaryText}</p>
        </div>
      `;
    }).join('');
  };

  window.deleteGlobalReflectionItem = async function(id, itemType) {
    if (confirm('Permanently delete this private reflection?')) {
      await PrivateStorageManager.deletePrivateItem(id, itemType);
      window.showToast?.('Reflection deleted permanently.', 'delete');
      window.openGlobalPrivateReflectionsModal();
    }
  };
}
