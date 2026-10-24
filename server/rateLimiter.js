// CalmPop - Server Rate Limiting for Employee Authentication
// Prevents brute-force credential stuffing and password guessing

import { db } from './db.js';

const WINDOW_MS = 15 * 60 * 1000; // 15-minute rolling window
const MAX_ATTEMPTS = 5;            // Max 5 failed attempts per identifier

export function checkRateLimit(identifier) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Prune expired attempts
  const pruneStmt = db.prepare('DELETE FROM login_attempts WHERE attempt_time < ?');
  pruneStmt.run(windowStart);

  // Count recent failed attempts for this identifier
  const countStmt = db.prepare('SELECT COUNT(*) as count, MIN(attempt_time) as oldest FROM login_attempts WHERE identifier = ? AND attempt_time >= ?');
  const result = countStmt.get(cleanId, windowStart);

  const count = result?.count || 0;
  if (count >= MAX_ATTEMPTS) {
    const oldest = result.oldest || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - count,
    retryAfterSeconds: 0
  };
}

export function recordFailedAttempt(identifier) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const stmt = db.prepare('INSERT INTO login_attempts (identifier, attempt_time) VALUES (?, ?)');
  stmt.run(cleanId, Date.now());
}

export function clearRateLimit(identifier) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const stmt = db.prepare('DELETE FROM login_attempts WHERE identifier = ?');
  stmt.run(cleanId);
}
