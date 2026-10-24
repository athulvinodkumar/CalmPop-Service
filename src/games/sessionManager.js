// CalmPop - Reusable Game Session Manager
// Coordinates lifecycle, elapsed active time tracking, pause/resume, early-exit,
// sanitized gameplay telemetry, and server synchronization across all 12 games.

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_session_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export class GameSessionManager {
  constructor(gameId, options = {}) {
    this.gameId = gameId;
    this.employeeId = options.employeeId || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_employee_id') : null) || 'anonymous';
    this.companyId = options.companyId || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_company_id') : null) || 'unknown';
    
    this.targetDurationSeconds = options.durationSeconds || 180; // Default 3 min
    this.settings = { ...options.settings, durationSeconds: this.targetDurationSeconds };
    
    this.sessionId = this.generateSessionId();
    this.status = 'initialized'; // 'initialized' | 'in_progress' | 'paused' | 'completed' | 'abandoned'
    this.startTime = null;
    this.endTime = null;
    
    // Active time calculation
    this.elapsedSeconds = 0;
    this.activeIntervalStartTime = null;
    this.timerInterval = null;
    
    // Sanitized gameplay events metadata (NEVER raw reflections)
    this.eventsMetadata = {
      moves: 0,
      hintsUsed: 0,
      undoCount: 0,
      puzzleCompletions: 0,
      pauses: 0,
      cyclesCompleted: 0
    };
    
    // Callbacks
    this.onTick = options.onTick || null; // (elapsed, target, progress)
    this.onStatusChange = options.onStatusChange || null; // (status)
    this.onComplete = options.onComplete || null;

    // Visibility listener for handling browser tab suspension
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  generateSessionId() {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GS-${Date.now()}-${rand}`;
  }

  start() {
    if (this.status === 'in_progress') return;

    const now = Date.now();
    this.startTime = this.startTime || now;
    this.activeIntervalStartTime = now;
    this.status = 'in_progress';

    this.startTimerTicker();
    this.notifyStatus();
    this.syncToServer();
  }

  pause() {
    if (this.status !== 'in_progress') return;

    // Accumulate active elapsed duration up to this moment
    if (this.activeIntervalStartTime) {
      const delta = (Date.now() - this.activeIntervalStartTime) / 1000;
      this.elapsedSeconds += delta;
      this.activeIntervalStartTime = null;
    }

    this.stopTimerTicker();
    this.status = 'paused';
    this.eventsMetadata.pauses = (this.eventsMetadata.pauses || 0) + 1;

    this.notifyStatus();
    this.syncToServer();
  }

  resume() {
    if (this.status !== 'paused') return;

    this.activeIntervalStartTime = Date.now();
    this.status = 'in_progress';

    this.startTimerTicker();
    this.notifyStatus();
    this.syncToServer();
  }

  complete() {
    if (this.status === 'completed') return;

    // Accumulate final time
    if (this.activeIntervalStartTime) {
      const delta = (Date.now() - this.activeIntervalStartTime) / 1000;
      this.elapsedSeconds += delta;
      this.activeIntervalStartTime = null;
    }

    this.stopTimerTicker();
    this.status = 'completed';
    this.endTime = Date.now();

    this.notifyStatus();
    this.syncToServer(true);

    if (this.onComplete) {
      this.onComplete(this.getSessionSummary());
    }
  }

  earlyExit() {
    // If user explicitly leaves before completing, record 'abandoned'
    if (this.status === 'completed') return;

    if (this.activeIntervalStartTime) {
      const delta = (Date.now() - this.activeIntervalStartTime) / 1000;
      this.elapsedSeconds += delta;
      this.activeIntervalStartTime = null;
    }

    this.stopTimerTicker();
    this.status = 'abandoned';
    this.endTime = Date.now();

    this.notifyStatus();
    this.syncToServer(false);
    this.cleanup();
  }

  restart() {
    // Cleanly archive the current session as abandoned if incomplete,
    // and initialize a fresh, independent session id
    if (this.status !== 'completed' && this.status !== 'initialized') {
      this.earlyExit();
    }

    this.cleanup();
    
    // Reset properties for new session
    this.sessionId = this.generateSessionId();
    this.status = 'initialized';
    this.startTime = null;
    this.endTime = null;
    this.elapsedSeconds = 0;
    this.activeIntervalStartTime = null;
    this.eventsMetadata = {
      moves: 0,
      hintsUsed: 0,
      undoCount: 0,
      puzzleCompletions: 0,
      pauses: 0,
      cyclesCompleted: 0
    };

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.start();
  }

  recordEvent(eventName, payload = 1) {
    // Only record safe gameplay telemetry
    if (typeof payload === 'number') {
      this.eventsMetadata[eventName] = (this.eventsMetadata[eventName] || 0) + payload;
    } else if (typeof payload === 'string' || typeof payload === 'boolean') {
      this.eventsMetadata[eventName] = payload;
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Browser tab was minimized or backgrounded:
      // Tally active segment up to now, but keep status in_progress so it continues seamlessly
      if (this.status === 'in_progress' && this.activeIntervalStartTime) {
        const delta = (Date.now() - this.activeIntervalStartTime) / 1000;
        this.elapsedSeconds += delta;
        this.activeIntervalStartTime = null;
      }
    } else {
      // Returned to active tab
      if (this.status === 'in_progress' && !this.activeIntervalStartTime) {
        this.activeIntervalStartTime = Date.now();
      }
    }
  }

  startTimerTicker() {
    this.stopTimerTicker();
    this.timerInterval = setInterval(() => {
      let currentActiveElapsed = this.elapsedSeconds;
      if (this.activeIntervalStartTime) {
        currentActiveElapsed += (Date.now() - this.activeIntervalStartTime) / 1000;
      }

      const totalSec = Math.floor(currentActiveElapsed);
      const progress = Math.min(1, currentActiveElapsed / Math.max(1, this.targetDurationSeconds));

      if (this.onTick) {
        this.onTick(totalSec, this.targetDurationSeconds, progress);
      }

      // Check for duration target reach if guided
      if (currentActiveElapsed >= this.targetDurationSeconds && this.status === 'in_progress') {
        // Can trigger completion or mark target reached
        if (this.settings.autoCompleteOnDuration) {
          this.complete();
        }
      }
    }, 500);
  }

  stopTimerTicker() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getTrueElapsedSeconds() {
    let current = this.elapsedSeconds;
    if (this.status === 'in_progress' && this.activeIntervalStartTime) {
      current += (Date.now() - this.activeIntervalStartTime) / 1000;
    }
    return Math.floor(current);
  }

  notifyStatus() {
    if (this.onStatusChange) {
      this.onStatusChange(this.status, this.getSessionSummary());
    }
  }

  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      gameId: this.gameId,
      employeeId: this.employeeId,
      startTime: this.startTime,
      endTime: this.endTime,
      elapsedDuration: this.getTrueElapsedSeconds(),
      targetDuration: this.targetDurationSeconds,
      status: this.status,
      selectedSettings: this.settings,
      completionStatus: this.status === 'completed',
      eventsMetadata: { ...this.eventsMetadata }
    };
  }

  async syncToServer(isFinal = false) {
    const summary = this.getSessionSummary();

    // 1. Local backup
    try {
      const localStore = JSON.parse(localStorage.getItem('calmpop_game_sessions') || '[]');
      const existingIdx = localStore.findIndex(s => s.sessionId === summary.sessionId);
      if (existingIdx >= 0) {
        localStore[existingIdx] = summary;
      } else {
        localStore.unshift(summary);
      }
      localStorage.setItem('calmpop_game_sessions', JSON.stringify(localStore.slice(0, 50)));
    } catch {}

    // 2. Server API sync (if authenticated)
    const token = sessionStorage.getItem('calmpop_session_token');
    if (!token) return;

    try {
      await fetch('/api/employee/games/session', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(summary)
      });
    } catch (err) {
      // Offline or network hiccup; local copy preserved
    }
  }

  cleanup() {
    this.stopTimerTicker();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}
