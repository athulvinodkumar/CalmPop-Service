// CalmPop - Games Gallery View
// Displays the four core interactive stress-relief activities:
// 1. Zen Sand, 2. Calm Keys, 3. Star Catcher, 4. Mandala Bloom
// with category & recommended mood filters, search, and dedicated game views.

import { GAMES_CATALOG, getGameById } from '../catalog.js';
import { GameSessionManager } from '../sessionManager.js';
import { GameShell } from '../gameShell.js';
import { PrivateStorageManager } from '../privateStorage.js';

let activeCategoryFilter = 'All';
let activeMoodFilter = 'All';
let activeSearchQuery = '';
let activeRunningGameId = null;
let currentController = null;

export function renderGamesLibrary(containerId = 'games-page-root', requestedGameId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // If a specific game was requested via route or active state
  const targetGameId = requestedGameId || activeRunningGameId;
  if (targetGameId) {
    const game = getGameById(targetGameId);
    if (game) {
      activeRunningGameId = targetGameId;
      launchGameView(game, container);
      return;
    }
  }

  // Filter games based on Category, Mood, and Search
  const filtered = GAMES_CATALOG.filter(g => {
    const matchCat = activeCategoryFilter === 'All' || g.category === activeCategoryFilter;
    const matchMood = activeMoodFilter === 'All' || (g.recommendedMoods && g.recommendedMoods.includes(activeMoodFilter));
    const matchSearch = !activeSearchQuery || 
      g.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) || 
      g.description.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      (g.recommendedMoods && g.recommendedMoods.some(m => m.toLowerCase().includes(activeSearchQuery.toLowerCase())));
    return matchCat && matchMood && matchSearch;
  });

  const categories = ['All', 'Focus', 'Auditory', 'Creative'];
  const moods = ['All', 'Tired', 'Overwhelmed', 'Anxious', 'Sad', 'Restless', 'Okay'];

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- HERO HEADER -->
      <div class="bg-gradient-to-r from-primary/10 via-cyan-500/10 to-lime-500/10 p-6 sm:p-8 rounded-3xl border border-surface-container/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1.5 max-w-xl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
              Moments of Calm
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-tertiary-fixed/40 text-tertiary-container text-[10px] font-bold">
              5 Interactive Mindful Experiences
            </span>
          </div>
          <h1 class="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
            Mindful Resets & Games
          </h1>
          <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Take a gentle pause during demanding workdays. Five interactive sensory experiences crafted for tactile focus, pure auditory calm, celestial release, generative soundscapes, and creative flow.
          </p>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button 
            type="button" 
            onclick="window.openGlobalPrivateReflectionsModal()"
            class="px-4 py-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container border border-surface-container text-xs font-semibold text-primary shadow-xs transition-all flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[18px]">folder_special</span>
            <span>My Saved Artwork</span>
          </button>
        </div>
      </div>

      <!-- FILTER & SEARCH CONTROLS -->
      <div class="space-y-3 bg-surface-container-low/50 p-4 rounded-3xl border border-surface-container">
        
        <!-- Category & Search Bar -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <!-- Category Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-outline text-[11px] font-semibold uppercase tracking-wider mr-1 hidden sm:inline">Category:</span>
            ${categories.map(cat => `
              <button 
                type="button" 
                onclick="window.filterGamesCategory('${cat}')"
                class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategoryFilter === cat ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-surface-container/60'}"
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
              placeholder="Search by game or mood..."
              oninput="window.handleGamesSearch(this.value)"
              class="w-full pl-9 pr-3 py-1.5 rounded-full bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

        </div>

        <!-- Recommended Moods Filter Row -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-surface-container/40">
          <span class="text-outline text-[11px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] text-tertiary">mood</span>
            <span>Recommended Mood:</span>
          </span>
          ${moods.map(mood => `
            <button 
              type="button" 
              onclick="window.filterGamesMood('${mood}')"
              class="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${activeMoodFilter === mood ? 'bg-tertiary-fixed text-on-tertiary-fixed font-bold shadow-xs' : 'text-outline hover:text-on-surface hover:bg-surface-container-high'}"
            >
              ${mood}
            </button>
          `).join('')}
        </div>

      </div>

      <!-- FOUR POLISHED GAME CARDS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${filtered.map(game => `
          <div class="group bg-surface-container-lowest rounded-3xl border border-surface-container hover:border-primary/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            
            <!-- Card Header: Custom Graphical SVG Preview Thumbnail -->
            <div class="h-48 w-full relative overflow-hidden bg-slate-100 flex items-center justify-center border-b border-surface-container/60">
              ${game.thumbnailSvg}

              <!-- Floating Badges Overlay -->
              <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                <span class="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[11px] font-bold text-on-surface shadow-xs flex items-center gap-1 border border-white/60">
                  <span class="material-symbols-outlined text-[14px] text-primary">${game.icon}</span>
                  <span>${game.category}</span>
                </span>
                <span class="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[11px] font-semibold text-outline shadow-xs border border-white/60">
                  ${game.typicalDuration}
                </span>
              </div>

              <!-- Top Right Badge -->
              <div class="absolute top-3 right-3 z-10">
                <span class="px-2.5 py-1 rounded-full bg-primary/10 backdrop-blur-md text-primary font-bold text-[10px] tracking-wide uppercase border border-primary/20">
                  ${game.badge}
                </span>
              </div>
            </div>

            <!-- Card Body Content -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                
                <div class="flex items-center justify-between">
                  <h2 class="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    ${game.title}
                  </h2>
                </div>

                <p class="text-xs text-on-surface-variant leading-relaxed">
                  ${game.description}
                </p>

                <!-- Recommended Moods Pills -->
                <div class="pt-2 flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] text-outline uppercase font-semibold">Recommended for:</span>
                  ${(game.recommendedMoods || []).map(m => `
                    <span class="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[11px] font-medium border border-surface-container">
                      ${m}
                    </span>
                  `).join('')}
                </div>

                <!-- Acoustic / Sound Signature note -->
                <div class="pt-1 flex items-center gap-1.5 text-[11px] text-outline">
                  <span class="material-symbols-outlined text-[14px] text-primary">graphic_eq</span>
                  <span class="truncate">${game.soundDescription}</span>
                </div>

              </div>

              <!-- Play Action Button -->
              <div class="pt-3 border-t border-surface-container/60">
                <button 
                  type="button" 
                  onclick="window.launchCalmGame('${game.id}')"
                  class="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                >
                  <span class="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Play ${game.title}</span>
                </button>
              </div>

            </div>

          </div>
        `).join('')}
      </div>

      ${filtered.length === 0 ? `
        <div class="text-center py-16 bg-surface-container-low/40 rounded-3xl border border-surface-container space-y-3">
          <span class="material-symbols-outlined text-[40px] text-outline">search_off</span>
          <p class="font-bold text-base text-on-surface">No activities match your filters</p>
          <p class="text-xs text-outline max-w-sm mx-auto">Try resetting the category and mood filters to view all four mindful experiences.</p>
          <button 
            type="button" 
            onclick="window.filterGamesCategory('All'); window.filterGamesMood('All');" 
            class="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold"
          >
            Show All 4 Games
          </button>
        </div>
      ` : ''}

    </div>

    <!-- SAVED ARTWORK & PRIVATE ITEMS MODAL -->
    <dialog id="global-reflections-modal" class="modal-dialog">
      <div class="modal-card max-w-lg w-full bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-surface-container">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">folder_special</span>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">My Saved Artwork & Creations</h3>
          </div>
          <button type="button" onclick="document.getElementById('global-reflections-modal').close()" class="p-1 rounded-xl hover:bg-surface-container text-outline">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p class="text-xs text-outline">
          Creations saved during your moments of calm are stored strictly private to your browser account and are never shared with employers or administrators.
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

export function launchGameView(game, container) {
  // Clean up any previously running controller
  if (currentController && typeof currentController.destroy === 'function') {
    currentController.destroy();
    currentController = null;
  }

  activeRunningGameId = game.id;

  // Sync window route hash
  if (window.location.hash !== `#employee/games/${game.id}`) {
    history.pushState(null, '', `#employee/games/${game.id}`);
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
      history.pushState(null, '', '#employee/games');
      renderGamesLibrary('games-page-root');
    }
  });

  // Render game inside shell
  const innerHtml = game.render(sessionManager, {});
  container.innerHTML = shell.renderShell(innerHtml);

  // Hook shell listeners and initialize game controller
  shell.attachListeners();
  currentController = game.createController(sessionManager, {});
  currentController.init();

  // Start mindful session
  sessionManager.start();
}

// Global actions exposed to window
if (typeof window !== 'undefined') {
  window.filterGamesCategory = function(cat) {
    activeCategoryFilter = cat;
    renderGamesLibrary('games-page-root');
  };

  window.filterGamesMood = function(mood) {
    activeMoodFilter = mood;
    renderGamesLibrary('games-page-root');
  };

  window.handleGamesSearch = function(query) {
    activeSearchQuery = query;
    renderGamesLibrary('games-page-root');
  };

  window.launchCalmGame = function(gameId) {
    const game = getGameById(gameId);
    const container = document.getElementById('games-page-root');
    if (game && container) {
      launchGameView(game, container);
    }
  };

  window.openGlobalPrivateReflectionsModal = async function() {
    const modal = document.getElementById('global-reflections-modal');
    const list = document.getElementById('global-reflections-list');
    if (!modal || !list) return;

    list.innerHTML = `
      <div class="text-center py-6 text-outline">
        <span class="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
        <p class="text-xs mt-1.5">Loading saved items...</p>
      </div>
    `;
    modal.showModal();

    const items = await PrivateStorageManager.getPrivateItems();
    if (!items || items.length === 0) {
      list.innerHTML = `<p class="text-outline text-center py-8">No saved artwork yet. Create and save a design in Mandala Bloom!</p>`;
      return;
    }

    list.innerHTML = items.map(item => {
      const data = item.content || {};
      const date = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      return `
        <div class="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container/60 space-y-1.5">
          <div class="flex items-center justify-between text-[11px] text-outline">
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">${item.itemType === 'mandala_art' ? 'Mandala Bloom Artwork' : 'Saved Creation'}</span>
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
          <p class="font-medium text-on-surface text-xs leading-relaxed">${data.title || 'Saved Artwork'}</p>
        </div>
      `;
    }).join('');
  };

  window.deleteGlobalReflectionItem = async function(id, itemType) {
    if (confirm('Permanently delete this saved creation?')) {
      await PrivateStorageManager.deletePrivateItem(id, itemType);
      window.showToast?.('Artwork deleted permanently.', 'delete');
      window.openGlobalPrivateReflectionsModal();
    }
  };
}
