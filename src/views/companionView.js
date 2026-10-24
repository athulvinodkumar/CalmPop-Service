// CalmPop - AI Wellbeing Companion View
// Authenticated employee conversational assistant with real AI model integration,
// multi-mode reasoning, conversation memory, action cards, and safety guardrails.

import { getAuthHeaders } from './employeePortal.js';

let activeConversationId = null;
let currentConversations = [];
let activeMode = 'talk'; // 'talk' | 'solution' | 'unwind' | 'organize'
let isResponding = false;
let currentSummary = null;
let lastFailedMessage = null;
let aiStatus = null;

const MODES = [
  { id: 'talk', label: 'Talk It Through', icon: 'chat_bubble', hint: 'Empathetic listening and open questions' },
  { id: 'solution', label: 'Find a Solution', icon: 'lightbulb', hint: 'Deconstruct challenges & practical next steps' },
  { id: 'unwind', label: 'Help Me Unwind', icon: 'spa', hint: 'Gentle relaxation & sensory grounding' },
  { id: 'organize', label: 'Organize My Thoughts', icon: 'splitscreen', hint: 'Untangle facts, priorities & actions' }
];

const SUGGESTED_PROMPTS = [
  "I'm feeling stressed about work.",
  "I have too many tasks to manage.",
  "I'm struggling to stay motivated.",
  "I had a difficult conversation today.",
  "Help me organize my thoughts.",
  "I just need someone to listen."
];

export async function renderCompanionView(containerId = 'companion-view-root') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Render initial frame with sidebar and main chat panel
  container.innerHTML = `
    <div class="h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-surface-container-lowest rounded-3xl border border-surface-container shadow-xs overflow-hidden">
      
      <!-- DESKTOP / TABLET CONVERSATION SIDEBAR -->
      <aside id="companion-sidebar" class="hidden md:flex flex-col w-72 lg:w-80 bg-surface-container-low/60 border-r border-surface-container flex-shrink-0">
        <!-- New Chat Action -->
        <div class="p-4 border-b border-surface-container flex items-center justify-between gap-2">
          <button 
            type="button" 
            onclick="window.startNewCompanionChat()"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-all"
            aria-label="Start a new chat"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Chat</span>
          </button>
        </div>

        <!-- Conversation History List -->
        <div class="flex-1 overflow-y-auto p-3 space-y-1" id="companion-history-list">
          <div class="p-4 text-center text-xs text-outline animate-pulse">Loading previous chats...</div>
        </div>

        <!-- Privacy & AI Info Footer -->
        <div class="p-3 border-t border-surface-container bg-surface-container-lowest/80 text-[11px] text-outline space-y-1">
          <div class="flex items-center gap-1.5 font-semibold text-on-surface-variant">
            <span class="material-symbols-outlined text-[15px] text-primary">verified_user</span>
            <span>Private & Confidential</span>
          </div>
          <p class="leading-relaxed text-[10px]">Your conversations are strictly private. They are never shared with HR, managers, or company administrators.</p>
        </div>
      </aside>

      <!-- MAIN CHAT DISPLAY AREA -->
      <div class="flex-1 min-w-0 flex flex-col h-full bg-background/50 relative">
        
        <!-- Chat Header Bar -->
        <header class="px-4 sm:px-6 py-3.5 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between flex-shrink-0 z-10">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Mobile Toggle Chats Drawer Button -->
            <button 
              type="button"
              onclick="window.toggleCompanionMobileChats()"
              class="md:hidden p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
              aria-label="Open conversation history"
            >
              <span class="material-symbols-outlined text-[20px]">history</span>
            </button>

            <!-- AI Avatar & Title -->
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <span class="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="font-bold text-sm sm:text-base text-on-surface truncate">CalmPop AI Companion</h2>
                <span id="ai-status-badge" class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>AI Active</span>
                </span>
              </div>
              <p class="text-xs text-outline truncate">A space to talk things through at your own pace.</p>
            </div>
          </div>

          <!-- Header Controls: Summary, Rename, Clear, New -->
          <div class="flex items-center gap-1 sm:gap-2">
            <!-- Summarize Button -->
            <button 
              type="button"
              id="btn-summarize-chat"
              onclick="window.requestConversationSummary()"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container-low text-xs font-semibold text-on-surface-variant transition-colors"
              title="Generate personal summary"
            >
              <span class="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
              <span>Summarize</span>
            </button>

            <!-- Rename Button -->
            <button 
              type="button"
              id="btn-rename-chat"
              onclick="window.promptRenameConversation()"
              class="p-2 rounded-xl hover:bg-surface-container-low text-outline hover:text-on-surface transition-colors"
              title="Rename conversation"
              aria-label="Rename conversation"
            >
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>

            <!-- Clear Conversation Button -->
            <button 
              type="button"
              id="btn-clear-chat"
              onclick="window.confirmClearConversation()"
              class="p-2 rounded-xl hover:bg-surface-container-low text-outline hover:text-error transition-colors"
              title="Clear conversation messages"
              aria-label="Clear conversation"
            >
              <span class="material-symbols-outlined text-[18px]">delete_sweep</span>
            </button>
          </div>
        </header>

        <!-- MOBILE CHATS DRAWER (OVERLAY) -->
        <div id="companion-mobile-chats-drawer" class="hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex md:hidden">
          <div class="w-72 max-w-[80%] bg-surface-container-lowest h-full shadow-2xl flex flex-col p-4 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-surface-container">
              <span class="font-bold text-sm text-on-surface">Conversations</span>
              <button onclick="window.toggleCompanionMobileChats(false)" class="p-1 rounded-lg text-outline hover:text-on-surface">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <button 
              type="button" 
              onclick="window.startNewCompanionChat(); window.toggleCompanionMobileChats(false);"
              class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-primary text-on-primary text-xs font-bold shadow-xs"
            >
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>New Chat</span>
            </button>
            <div class="flex-1 overflow-y-auto space-y-1" id="companion-mobile-history-list"></div>
          </div>
          <div class="flex-1" onclick="window.toggleCompanionMobileChats(false)"></div>
        </div>

        <!-- Scrollable Messages Container -->
        <div id="companion-messages-stream" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
          <!-- Initial welcome and messages rendered dynamically -->
        </div>

        <!-- AI Thinking / Loading Bar -->
        <div id="companion-loading-bar" class="hidden px-6 py-2 bg-surface-container-low/40 flex items-center gap-2 text-xs text-primary font-semibold">
          <span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span>CalmPop companion is thinking...</span>
        </div>

        <!-- End of Conversation Summary Modal/Card Overlay -->
        <div id="companion-summary-card" class="hidden mx-4 sm:mx-6 mb-2 p-4 rounded-2xl bg-surface-container-lowest border border-primary/30 shadow-md"></div>

        <!-- Missing API Key Notice (Dev Guidance) -->
        <div id="companion-config-notice" class="hidden mx-4 sm:mx-6 mb-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs space-y-2">
          <div class="flex items-center gap-2 font-bold">
            <span class="material-symbols-outlined text-[20px] text-amber-700">info</span>
            <span>AI Model API Key Required</span>
          </div>
          <p id="companion-config-notice-text" class="leading-relaxed text-amber-800">
            To generate real AI responses, please configure <strong>GEMINI_API_KEY</strong> in your server environment or <code>.env</code> file.
          </p>
          <div class="text-[11px] text-amber-800/80 font-mono bg-white/60 p-2 rounded-lg border border-amber-500/20">
            GEMINI_API_KEY=your_gemini_api_key_here<br>
            AI_MODEL=gemini-2.5-flash
          </div>
        </div>

        <!-- Chat Input & Controls Section -->
        <div class="p-3 sm:p-4 bg-surface-container-lowest border-t border-surface-container flex-shrink-0 space-y-2.5">
          
          <!-- Mode Selector Chips -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="radiogroup" aria-label="Conversation Mode">
            <span class="text-[10px] font-bold uppercase tracking-wider text-outline px-1 flex-shrink-0">Mode:</span>
            ${MODES.map(mode => `
              <button 
                type="button" 
                onclick="window.selectCompanionMode('${mode.id}')"
                id="btn-mode-${mode.id}"
                class="companion-mode-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${activeMode === mode.id ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs' : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:border-outline'}"
                title="${mode.hint}"
              >
                <span class="material-symbols-outlined text-[16px]">${mode.icon}</span>
                <span>${mode.label}</span>
              </button>
            `).join('')}
          </div>

          <!-- Message Input Box -->
          <form id="companion-chat-form" onsubmit="window.handleSendCompanionMessage(event)" class="relative flex items-end gap-2 bg-surface-container-low rounded-2xl p-2 border border-surface-container focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea 
              id="companion-message-input"
              rows="1"
              placeholder="Talk about work stress, tasks, or everyday challenges... (Shift+Enter for new line)"
              class="flex-1 bg-transparent border-0 outline-none resize-none px-2 py-1.5 text-xs sm:text-sm text-on-surface placeholder:text-outline max-h-32 min-h-[36px]"
              oninput="window.autoResizeCompanionInput(this)"
              onkeydown="window.handleCompanionInputKey(event)"
              aria-label="Message to CalmPop AI Companion"
            ></textarea>
            
            <button 
              type="submit"
              id="companion-send-btn"
              class="p-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex-shrink-0"
              title="Send message (Enter)"
              aria-label="Send message"
            >
              <span class="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>

          <!-- Input Footer Note -->
          <div class="flex items-center justify-between text-[10px] text-outline px-1">
            <span>CalmPop Companion is an AI assistant, not a human therapist or medical service.</span>
            <span class="hidden sm:inline">Press <kbd class="px-1 py-0.5 rounded bg-surface-container border text-[9px] font-mono">Enter</kbd> to send, <kbd class="px-1 py-0.5 rounded bg-surface-container border text-[9px] font-mono">Shift+Enter</kbd> for line</span>
          </div>

        </div>

      </div>

    </div>
  `;

  // Initialize companion data and active chat
  await initCompanionLifecycle();
}

/**
 * Initializes conversation list, status, and loads active conversation.
 */
async function initCompanionLifecycle() {
  try {
    // 1. Check AI operational status
    const statusRes = await fetch('/api/employee/companion/status', {
      headers: getAuthHeaders()
    });
    if (statusRes.ok) {
      aiStatus = await statusRes.json();
      updateStatusBadge(aiStatus);
    }

    // 2. Fetch conversation history
    await refreshConversationsList();

    // 3. Select first conversation or start a new one
    if (currentConversations.length > 0) {
      await loadConversation(currentConversations[0].id);
    } else {
      await createNewConversation('New Conversation', activeMode);
    }

  } catch (err) {
    console.error('[CalmPop Companion] Error initializing:', err);
    renderInitialWelcome();
  }
}

function updateStatusBadge(status) {
  const badge = document.getElementById('ai-status-badge');
  if (!badge) return;

  if (status?.operational) {
    badge.className = 'hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>${status.label || 'AI Active'}</span>`;
  } else {
    badge.className = 'hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span><span>Key Required</span>`;
  }
}

/**
 * Fetches list of conversations for this employee and updates sidebar
 */
async function refreshConversationsList() {
  try {
    const res = await fetch('/api/employee/companion/conversations', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return;

    const data = await res.json();
    currentConversations = data.conversations || [];
    renderHistoryList();
  } catch (err) {
    console.error('Failed to load conversations:', err);
  }
}

function renderHistoryList() {
  const desktopList = document.getElementById('companion-history-list');
  const mobileList = document.getElementById('companion-mobile-history-list');

  const content = currentConversations.length === 0 ? `
    <div class="p-4 text-center text-xs text-outline">
      No previous chats yet.<br>Start your first conversation above!
    </div>
  ` : currentConversations.map(conv => {
    const isActive = conv.id === activeConversationId;
    const timeStr = formatRelativeDate(conv.updated_at);

    return `
      <div 
        class="group relative flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all cursor-pointer ${isActive ? 'bg-primary/10 text-primary font-bold shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-high'}"
        onclick="window.selectCompanionConversation('${conv.id}')"
      >
        <div class="min-w-0 flex-1 pr-2">
          <p class="truncate font-semibold">${escapeHtml(conv.title || 'Untitled Chat')}</p>
          <p class="text-[10px] text-outline truncate">${timeStr} • ${conv.message_count || 0} msgs</p>
        </div>
        
        <!-- Delete Conversation Button -->
        <button 
          type="button"
          onclick="event.stopPropagation(); window.deleteCompanionConversation('${conv.id}')"
          class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-all"
          title="Delete chat"
          aria-label="Delete chat"
        >
          <span class="material-symbols-outlined text-[15px]">delete</span>
        </button>
      </div>
    `;
  }).join('');

  if (desktopList) desktopList.innerHTML = content;
  if (mobileList) mobileList.innerHTML = content;
}

/**
 * Loads a conversation and its messages into the stream
 */
async function loadConversation(convId) {
  activeConversationId = convId;
  renderHistoryList();

  const stream = document.getElementById('companion-messages-stream');
  if (!stream) return;

  stream.innerHTML = `
    <div class="p-8 text-center space-y-2 text-outline">
      <span class="material-symbols-outlined text-[28px] animate-spin text-primary">progress_activity</span>
      <p class="text-xs">Loading conversation...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/employee/companion/conversations/${convId}/messages`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      stream.innerHTML = `<div class="p-4 text-center text-xs text-error">Failed to load messages.</div>`;
      return;
    }

    const data = await res.json();
    const conversation = data.conversation;
    const messages = data.messages || [];

    // Sync mode with conversation
    if (conversation?.mode) {
      selectModeInternal(conversation.mode);
    }

    // Render Welcome message + messages
    renderStreamContent(messages);

  } catch (err) {
    console.error('Error loading conversation:', err);
    stream.innerHTML = `<div class="p-4 text-center text-xs text-error">Error loading conversation.</div>`;
  }
}

/**
 * Renders the welcome banner, prompt chips, and message bubbles
 */
function renderStreamContent(messages) {
  const stream = document.getElementById('companion-messages-stream');
  if (!stream) return;

  let html = `
    <!-- WELCOME CARD -->
    <div class="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-surface-container/80 shadow-xs space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
          <span class="material-symbols-outlined text-[24px]">self_improvement</span>
        </div>
        <div>
          <h3 class="font-bold text-sm sm:text-base text-on-surface">Welcome to your AI Wellbeing Companion</h3>
          <p class="text-[11px] text-outline">Intelligent, confidential workplace support</p>
        </div>
      </div>

      <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
        Hi! I'm your CalmPop companion. If something has been weighing on you, we can talk it through together. Tell me what's on your mind, and we'll explore some practical next steps at your own pace.
      </p>

      <div class="pt-1 flex items-center gap-1.5 text-[11px] text-outline border-t border-surface-container/60">
        <span class="material-symbols-outlined text-[15px] text-primary">info</span>
        <span>I am an AI assistant designed for wellbeing and workload reflection, not a licensed therapist or crisis service.</span>
      </div>
    </div>
  `;

  // If conversation has no user messages yet, show suggested conversation starter chips
  if (!messages || messages.length === 0) {
    html += `
      <div class="space-y-2 pt-2">
        <p class="text-xs font-semibold text-on-surface-variant">Suggested conversation starters:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${SUGGESTED_PROMPTS.map(prompt => `
            <button 
              type="button" 
              onclick="window.sendSuggestedPrompt('${escapeForAttribute(prompt)}')"
              class="text-left p-3 rounded-2xl bg-surface-container-lowest hover:bg-primary/5 border border-surface-container hover:border-primary/40 text-xs text-on-surface transition-all flex items-center justify-between group shadow-2xs"
            >
              <span>${prompt}</span>
              <span class="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">arrow_forward</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    // Render message bubbles
    messages.forEach(msg => {
      html += renderMessageBubble(msg);
    });
  }

  stream.innerHTML = html;
  scrollStreamToBottom();
}

/**
 * Renders an individual message bubble
 */
function renderMessageBubble(msg) {
  const isUser = msg.role === 'user';
  const timeStr = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return `
      <div class="flex justify-end gap-2 pl-8 sm:pl-16">
        <div class="space-y-1 max-w-xl">
          <div class="p-3.5 sm:p-4 rounded-3xl rounded-tr-xs bg-primary text-on-primary text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap">
            ${escapeHtml(msg.content)}
          </div>
          <div class="text-right text-[10px] text-outline px-2">${timeStr}</div>
        </div>
      </div>
    `;
  }

  // Assistant bubble
  const actionCardHtml = msg.actionCard ? renderActionCardHtml(msg.actionCard) : '';
  const crisisCardHtml = msg.isCrisis ? renderCrisisCardHtml() : '';

  return `
    <div class="flex items-start gap-2.5 pr-8 sm:pr-16 group">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center text-[16px] shadow-2xs flex-shrink-0 mt-1">
        <span class="material-symbols-outlined text-[18px]">smart_toy</span>
      </div>

      <div class="space-y-2 max-w-xl flex-1">
        <div class="p-4 rounded-3xl rounded-tl-xs bg-surface-container-lowest border border-surface-container text-xs sm:text-sm text-on-surface leading-relaxed shadow-xs space-y-2 whitespace-pre-wrap">
          ${formatMarkdownMessage(msg.content)}
        </div>

        ${actionCardHtml}
        ${crisisCardHtml}

        <!-- Assistant Message Controls: Copy, Time -->
        <div class="flex items-center gap-3 text-[10px] text-outline px-2">
          <span>${timeStr}</span>
          <button 
            type="button" 
            onclick="window.copyCompanionMessage('${escapeForAttribute(msg.content)}', this)"
            class="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity flex items-center gap-1"
            title="Copy message text"
          >
            <span class="material-symbols-outlined text-[13px]">content_copy</span>
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders structured interactive Action Cards connecting to real CalmPop games/features
 */
function renderActionCardHtml(card) {
  if (!card) return '';

  let clickHandler = '';
  if (card.action === 'game' && card.gameId) {
    clickHandler = `window.navigateView('employee', 'games'); setTimeout(() => window.selectGame('${card.gameId}'), 200);`;
  } else if (card.action === 'view' && card.route) {
    clickHandler = `window.navigateView('employee', '${card.route}');`;
  } else {
    clickHandler = `window.navigateView('employee', 'games');`;
  }

  return `
    <div class="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 shadow-xs flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-[20px]">${card.icon || 'spa'}</span>
        </div>
        <div class="min-w-0">
          <p class="font-bold text-xs text-on-surface truncate">${escapeHtml(card.title || 'CalmPop Activity')}</p>
          <p class="text-[11px] text-outline truncate">${escapeHtml(card.description || 'Take a restorative moment.')}</p>
        </div>
      </div>

      <button 
        type="button" 
        onclick="${clickHandler}"
        class="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1 shadow-2xs flex-shrink-0"
      >
        <span>Open</span>
        <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  `;
}

/**
 * Renders verified India & International crisis helpline card
 */
function renderCrisisCardHtml() {
  return `
    <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2.5 shadow-xs">
      <div class="flex items-center gap-2 font-bold text-xs text-rose-900">
        <span class="material-symbols-outlined text-[18px] text-rose-600">call</span>
        <span>Verified Free 24/7 Crisis Support Numbers</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div class="p-2 rounded-xl bg-white/80 border border-rose-200">
          <p class="font-bold text-rose-900">Tele-MANAS (Govt. of India)</p>
          <p class="font-mono font-bold text-rose-700 text-sm">14416 / 1800 891 4416</p>
          <p class="text-[10px] text-rose-800">Toll-free 24/7 National Mental Health</p>
        </div>
        <div class="p-2 rounded-xl bg-white/80 border border-rose-200">
          <p class="font-bold text-rose-900">Vandrevala Foundation</p>
          <p class="font-mono font-bold text-rose-700 text-sm">+91 9999 666 555</p>
          <p class="text-[10px] text-rose-800">Confidential round-the-clock support</p>
        </div>
        <div class="p-2 rounded-xl bg-white/80 border border-rose-200">
          <p class="font-bold text-rose-900">Emergency Services</p>
          <p class="font-mono font-bold text-rose-700 text-sm">112</p>
          <p class="text-[10px] text-rose-800">All-India Emergency Response</p>
        </div>
        <div class="p-2 rounded-xl bg-white/80 border border-rose-200">
          <p class="font-bold text-rose-900">KIRAN Helpline</p>
          <p class="font-mono font-bold text-rose-700 text-sm">1800-599-0019</p>
          <p class="text-[10px] text-rose-800">Mental Health Rehabilitation</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handles sending employee message
 */
export async function handleSendMessage(rawText = null) {
  const input = document.getElementById('companion-message-input');
  const messageText = (rawText || input?.value || '').trim();

  if (!messageText || isResponding) return;

  // Clear input
  if (input) {
    input.value = '';
    input.style.height = 'auto';
  }

  // Ensure active conversation exists
  if (!activeConversationId) {
    await createNewConversation('New Conversation', activeMode);
  }

  isResponding = true;
  toggleInputState(true);
  hideConfigNotice();

  // Optimistically append user message to stream
  appendUserMessageOptimistically(messageText);

  try {
    const res = await fetch(`/api/employee/companion/conversations/${activeConversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content: messageText,
        mode: activeMode
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 503 && data.error === 'AI_KEY_MISSING') {
        showConfigNotice(data.message, data.setupHelp);
        appendErrorMessage(data.message, messageText);
      } else if (res.status === 429) {
        appendErrorMessage('Rate limit reached. Please wait a moment and click Retry.', messageText);
      } else {
        appendErrorMessage(data.message || data.error || 'Failed to generate response.', messageText);
      }
      return;
    }

    // Success: append real assistant response
    appendAssistantMessageToStream(data.assistantMessage);
    lastFailedMessage = null;

    // Refresh conversation list in sidebar to update preview & title
    refreshConversationsList();

  } catch (err) {
    console.error('Error sending message:', err);
    appendErrorMessage('Network connection lost. Please check your connection and retry.', messageText);
  } finally {
    isResponding = false;
    toggleInputState(false);
  }
}

function appendUserMessageOptimistically(content) {
  const stream = document.getElementById('companion-messages-stream');
  if (!stream) return;

  // If initial starter chips are showing, clear them
  const starterContainer = stream.querySelector('.grid');
  if (starterContainer && starterContainer.parentElement) {
    starterContainer.parentElement.remove();
  }

  const bubbleHtml = renderMessageBubble({
    role: 'user',
    content,
    createdAt: new Date().toISOString()
  });

  stream.insertAdjacentHTML('beforeend', bubbleHtml);
  scrollStreamToBottom();
}

function appendAssistantMessageToStream(assistantMessage) {
  const stream = document.getElementById('companion-messages-stream');
  if (!stream) return;

  const bubbleHtml = renderMessageBubble(assistantMessage);
  stream.insertAdjacentHTML('beforeend', bubbleHtml);
  scrollStreamToBottom();
}

function appendErrorMessage(errorText, unsentContent) {
  const stream = document.getElementById('companion-messages-stream');
  if (!stream) return;

  lastFailedMessage = unsentContent;

  const errorHtml = `
    <div class="flex items-start gap-2.5 pr-8 sm:pr-16">
      <div class="w-8 h-8 rounded-xl bg-error/10 text-error flex items-center justify-center text-[16px] flex-shrink-0 mt-1">
        <span class="material-symbols-outlined text-[18px]">error</span>
      </div>
      <div class="p-4 rounded-3xl bg-error-container/20 border border-error/30 text-xs text-error space-y-2 max-w-xl">
        <p class="font-semibold">${escapeHtml(errorText)}</p>
        <div class="flex items-center gap-2 pt-1">
          <button 
            type="button" 
            onclick="window.retryLastFailedMessage()"
            class="px-3 py-1.5 rounded-xl bg-error text-white font-bold text-xs hover:bg-error/90 transition-all flex items-center gap-1 shadow-xs"
          >
            <span class="material-symbols-outlined text-[14px]">refresh</span>
            <span>Retry</span>
          </button>
        </div>
      </div>
    </div>
  `;

  stream.insertAdjacentHTML('beforeend', errorHtml);
  scrollStreamToBottom();
}

function toggleInputState(loading) {
  const input = document.getElementById('companion-message-input');
  const btn = document.getElementById('companion-send-btn');
  const loader = document.getElementById('companion-loading-bar');

  if (input) input.disabled = loading;
  if (btn) btn.disabled = loading;
  if (loader) {
    if (loading) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
  }
}

function showConfigNotice(message, setupHelp) {
  const notice = document.getElementById('companion-config-notice');
  const text = document.getElementById('companion-config-notice-text');
  if (notice && text) {
    text.innerHTML = `<strong>AI Model Not Configured:</strong> ${escapeHtml(message)}<br><span class="text-amber-900/80">${escapeHtml(setupHelp || '')}</span>`;
    notice.classList.remove('hidden');
  }
}

function hideConfigNotice() {
  const notice = document.getElementById('companion-config-notice');
  if (notice) notice.classList.add('hidden');
}

/**
 * Creates a new conversation
 */
async function createNewConversation(title = 'New Conversation', mode = 'talk') {
  try {
    const res = await fetch('/api/employee/companion/conversations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, mode })
    });

    if (!res.ok) return;

    const data = await res.json();
    const newConv = data.conversation;
    activeConversationId = newConv.id;

    await refreshConversationsList();
    await loadConversation(newConv.id);

  } catch (err) {
    console.error('Failed to create new chat:', err);
  }
}

function selectModeInternal(modeId) {
  activeMode = modeId;
  document.querySelectorAll('.companion-mode-chip').forEach(chip => {
    chip.className = 'companion-mode-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border bg-surface-container-low border-surface-container text-on-surface-variant hover:border-outline';
  });

  const activeBtn = document.getElementById(`btn-mode-${modeId}`);
  if (activeBtn) {
    activeBtn.className = 'companion-mode-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border bg-primary/10 border-primary text-primary font-bold shadow-xs';
  }

  // Update conversation mode on server if active
  if (activeConversationId) {
    fetch(`/api/employee/companion/conversations/${activeConversationId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mode: modeId })
    }).catch(() => {});
  }
}

function scrollStreamToBottom() {
  const stream = document.getElementById('companion-messages-stream');
  if (stream) {
    setTimeout(() => {
      stream.scrollTop = stream.scrollHeight;
    }, 50);
  }
}

/**
 * Generates and displays an end-of-conversation summary card
 */
async function generateAndDisplaySummary() {
  if (!activeConversationId) return;

  const card = document.getElementById('companion-summary-card');
  if (!card) return;

  card.classList.remove('hidden');
  card.innerHTML = `
    <div class="p-4 text-center space-y-2 text-xs text-primary font-semibold">
      <span class="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
      <p>Generating your confidential conversation summary...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/employee/companion/conversations/${activeConversationId}/summarize`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      card.innerHTML = `<div class="p-3 text-xs text-error">Failed to generate summary.</div>`;
      return;
    }

    const data = await res.json();
    const summary = data.summary;
    currentSummary = summary;

    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-surface-container">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
            <span class="font-bold text-xs sm:text-sm text-on-surface">Conversation Takeaway Summary</span>
          </div>
          <button onclick="document.getElementById('companion-summary-card').classList.add('hidden')" class="p-1 rounded-lg hover:bg-surface-container text-outline">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div class="space-y-2 text-xs text-on-surface">
          <div>
            <span class="font-bold text-outline uppercase text-[10px] tracking-wider block">Topic / Focus:</span>
            <p class="font-semibold text-on-surface">${escapeHtml(summary.topic || 'Workplace Discussion')}</p>
          </div>

          <div>
            <span class="font-bold text-outline uppercase text-[10px] tracking-wider block">Key Insights:</span>
            <ul class="list-disc list-inside space-y-1 text-on-surface-variant">
              ${(summary.keyPoints || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
          </div>

          <div>
            <span class="font-bold text-outline uppercase text-[10px] tracking-wider block">Possible Next Steps:</span>
            <ul class="list-disc list-inside space-y-1 text-on-surface-variant">
              ${(summary.nextSteps || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}
            </ul>
          </div>

          ${summary.suggestedResources?.length ? `
            <div>
              <span class="font-bold text-outline uppercase text-[10px] tracking-wider block">Suggested Activities:</span>
              <p class="text-on-surface-variant">${summary.suggestedResources.map(escapeHtml).join(', ')}</p>
            </div>
          ` : ''}
        </div>

        <div class="pt-2 flex items-center justify-between border-t border-surface-container">
          <span class="text-[10px] text-outline">Confidential • For your eyes only</span>
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="window.copyCompanionSummary(this)"
              class="px-3 py-1.5 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container-low text-xs font-semibold text-on-surface transition-colors flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[14px]">content_copy</span>
              <span>Copy</span>
            </button>
            <button 
              type="button" 
              onclick="document.getElementById('companion-summary-card').classList.add('hidden')"
              class="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Error generating summary:', err);
    card.innerHTML = `<div class="p-3 text-xs text-error">Failed to generate summary.</div>`;
  }
}

// ==========================================
// Global Window Event Handlers
// ==========================================
window.startNewCompanionChat = async function() {
  await createNewConversation('New Conversation', activeMode);
};

window.selectCompanionConversation = async function(convId) {
  if (convId === activeConversationId) return;
  await loadConversation(convId);
};

window.selectCompanionMode = function(modeId) {
  selectModeInternal(modeId);
};

window.handleSendCompanionMessage = function(e) {
  if (e) e.preventDefault();
  handleSendMessage();
};

window.sendSuggestedPrompt = function(promptText) {
  handleSendMessage(promptText);
};

window.retryLastFailedMessage = function() {
  if (lastFailedMessage) {
    handleSendMessage(lastFailedMessage);
  }
};

window.promptRenameConversation = async function() {
  if (!activeConversationId) return;
  const current = currentConversations.find(c => c.id === activeConversationId);
  const newTitle = window.prompt("Rename this conversation:", current?.title || '');
  if (!newTitle || !newTitle.trim()) return;

  try {
    const res = await fetch(`/api/employee/companion/conversations/${activeConversationId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: newTitle.trim() })
    });
    if (res.ok) {
      await refreshConversationsList();
      window.showToast?.("Conversation renamed", "check");
    }
  } catch (err) {
    console.error('Rename failed:', err);
  }
};

window.confirmClearConversation = async function() {
  if (!activeConversationId) return;
  if (!confirm("Are you sure you want to clear all messages in this conversation?")) return;

  try {
    const res = await fetch(`/api/employee/companion/conversations/${activeConversationId}/messages`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      await loadConversation(activeConversationId);
      await refreshConversationsList();
      window.showToast?.("Conversation messages cleared", "delete");
    }
  } catch (err) {
    console.error('Failed to clear conversation:', err);
  }
};

window.deleteCompanionConversation = async function(convId) {
  if (!confirm("Delete this conversation and its history?")) return;

  try {
    const res = await fetch(`/api/employee/companion/conversations/${convId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      await refreshConversationsList();
      if (convId === activeConversationId) {
        if (currentConversations.length > 0) {
          await loadConversation(currentConversations[0].id);
        } else {
          await createNewConversation('New Conversation', activeMode);
        }
      }
      window.showToast?.("Conversation deleted", "delete");
    }
  } catch (err) {
    console.error('Failed to delete chat:', err);
  }
};

window.requestConversationSummary = function() {
  generateAndDisplaySummary();
};

window.copyCompanionMessage = function(text, btn) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined text-[13px] text-emerald-600">check</span><span class="text-emerald-600">Copied</span>`;
      setTimeout(() => btn.innerHTML = orig, 1500);
    }
  });
};

window.copyCompanionSummary = function(btn) {
  if (!currentSummary || !navigator.clipboard) return;
  const text = `CalmPop AI Companion Summary:
Topic: ${currentSummary.topic}
Key Insights:
${(currentSummary.keyPoints || []).map(p => `• ${p}`).join('\n')}
Next Steps:
${(currentSummary.nextSteps || []).map(s => `• ${s}`).join('\n')}
Suggested CalmPop Tools: ${(currentSummary.suggestedResources || []).join(', ')}`;

  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined text-[14px] text-emerald-600">check</span><span>Copied!</span>`;
      setTimeout(() => btn.innerHTML = orig, 1500);
    }
  });
};

window.autoResizeCompanionInput = function(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
};

window.handleCompanionInputKey = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};

window.toggleCompanionMobileChats = function(forceState) {
  const drawer = document.getElementById('companion-mobile-chats-drawer');
  if (!drawer) return;
  if (typeof forceState === 'boolean') {
    if (forceState) drawer.classList.remove('hidden');
    else drawer.classList.add('hidden');
  } else {
    drawer.classList.toggle('hidden');
  }
};

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeForAttribute(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatMarkdownMessage(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);
  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Bullet lists
  escaped = escaped.replace(/^-\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
  return escaped;
}

function formatRelativeDate(isoDate) {
  if (!isoDate) return 'Just now';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
