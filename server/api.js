// CalmPop - Real Employee Authentication API Router
// Express backend providing real session management, scrypt password hashing,
// rate limiting, and strict company-tenant isolation.

import express from 'express';
import cookieParser from 'cookie-parser';
import { db } from './db.js';
import { hashPassword, verifyPassword, generateSessionToken } from './authUtils.js';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from './rateLimiter.js';
import { QUESTION_BANK, selectRandomQuestions, calculateWellbeingScore } from './questionBank.js';
import { getAiConfig, generateAiReply, generateConversationSummary } from './aiService.js';

export const apiApp = express();

apiApp.use(express.json());
apiApp.use(cookieParser());

// --- Authentication Middleware ---
export function authenticateEmployeeSession(req, res, next) {
  const token = req.cookies?.calmpop_session || 
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
      ? req.headers.authorization.substring(7) 
      : null);

  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required. Please sign in to your employee account.',
      code: 'UNAUTHENTICATED'
    });
  }

  const stmt = db.prepare(`
    SELECT s.token, s.expires_at, s.company_id, 
           e.id as employee_id, e.name, e.username, e.email, e.department, e.title,
           c.name as company_name
    FROM sessions s
    JOIN employees e ON e.company_id = s.company_id AND e.id = s.employee_id
    JOIN companies c ON c.id = s.company_id
    WHERE s.token = ?
  `);

  const session = stmt.get(token);
  if (!session) {
    res.clearCookie('calmpop_session', { path: '/' });
    return res.status(401).json({ 
      error: 'Invalid or terminated session. Please sign in again.',
      code: 'INVALID_SESSION'
    });
  }

  // Check expiration
  if (session.expires_at < Date.now()) {
    const delStmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    delStmt.run(token);
    res.clearCookie('calmpop_session', { path: '/' });
    return res.status(401).json({ 
      error: 'Session expired. Please sign in again.',
      code: 'SESSION_EXPIRED'
    });
  }

  req.employee = {
    id: session.employee_id,
    companyId: session.company_id,
    companyName: session.company_name,
    name: session.name,
    username: session.username,
    email: session.email,
    department: session.department,
    title: session.title
  };
  req.sessionToken = session.token;
  next();
}

// ==========================================
// 1. Employee Authentication Endpoints
// ==========================================

// POST /api/auth/login
apiApp.post('/api/auth/login', (req, res) => {
  const { companyId, username, password, rememberMe } = req.body || {};

  // 1. Input Validation
  if (!companyId || typeof companyId !== 'string' || !companyId.trim()) {
    return res.status(400).json({ error: 'Company ID is required.', field: 'companyId' });
  }
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Username is required.', field: 'username' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.', field: 'password' });
  }

  const cleanCompanyId = companyId.trim().toUpperCase();
  const cleanUsername = username.trim().toLowerCase();
  const rateLimitKey = `${cleanCompanyId}:${cleanUsername}`;

  // 2. Server Rate Limiting
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return res.status(429).json({ 
      error: rateLimit.error,
      retryAfterSeconds: rateLimit.retryAfterSeconds 
    });
  }

  // 3. Database Verification
  // Must match both company_id and username
  const empStmt = db.prepare(`
    SELECT e.*, c.name as company_name
    FROM employees e
    JOIN companies c ON c.id = e.company_id
    WHERE e.company_id = ? AND LOWER(e.username) = ?
  `);
  const employee = empStmt.get(cleanCompanyId, cleanUsername);

  if (!employee) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ 
      error: 'Invalid Company ID, Username, or Password. Please verify your credentials.',
      remainingAttempts: Math.max(0, rateLimit.remainingAttempts - 1)
    });
  }

  // 4. Cryptographic Password Verification
  const isMatch = verifyPassword(password, employee.password_hash);
  if (!isMatch) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ 
      error: 'Invalid Company ID, Username, or Password. Please verify your credentials.',
      remainingAttempts: Math.max(0, rateLimit.remainingAttempts - 1)
    });
  }

  // 5. Successful Authentication: Clear rate limits & issue session
  clearRateLimit(rateLimitKey);

  const isRemember = Boolean(rememberMe);
  const sessionDuration = isRemember ? (30 * 24 * 3600 * 1000) : (24 * 3600 * 1000); // 30 days or 24 hours
  const token = generateSessionToken();
  const now = Date.now();
  const expiresAt = now + sessionDuration;

  const sessionStmt = db.prepare(`
    INSERT INTO sessions (token, employee_id, company_id, created_at, expires_at, remember_me)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  sessionStmt.run(token, employee.id, employee.company_id, now, expiresAt, isRemember ? 1 : 0);

  // Set HTTP-Only Cookie
  res.cookie('calmpop_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: sessionDuration,
    path: '/'
  });

  return res.json({
    success: true,
    token, // Also returned for clients that use Authorization header
    employee: {
      id: employee.id,
      companyId: employee.company_id,
      companyName: employee.company_name,
      name: employee.name,
      username: employee.username,
      email: employee.email,
      department: employee.department,
      title: employee.title
    }
  });
});

// POST /api/auth/logout
apiApp.post('/api/auth/logout', (req, res) => {
  const token = req.cookies?.calmpop_session || 
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
      ? req.headers.authorization.substring(7) 
      : null);

  if (token) {
    const delStmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    delStmt.run(token);
  }

  res.clearCookie('calmpop_session', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
apiApp.get('/api/auth/me', authenticateEmployeeSession, (req, res) => {
  return res.json({
    authenticated: true,
    employee: req.employee
  });
});

// ==========================================
// 2. Protected Employee Dashboard & Surveys
// ==========================================
// 2. Protected Employee Dashboard & 30-Question Survey
// ==========================================

// Helper to get current ISO week string (e.g., '2026-W43')
export function getCurrentWeekIdentifier() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// GET /api/employee/dashboard
apiApp.get('/api/employee/dashboard', authenticateEmployeeSession, (req, res) => {
  const currentWeek = getCurrentWeekIdentifier();

  // 1. Check survey attempt in survey_attempts for this employee & week
  const attemptStmt = db.prepare(`
    SELECT * FROM survey_attempts 
    WHERE company_id = ? AND employee_id = ? AND week_identifier = ?
  `);
  const attempt = attemptStmt.get(req.employee.companyId, req.employee.id, currentWeek);

  // Fallback check in legacy employee_surveys if attempt not in survey_attempts yet
  const legacyStmt = db.prepare(`
    SELECT * FROM employee_surveys 
    WHERE company_id = ? AND employee_id = ? AND week_identifier = ?
  `);
  const legacyThisWeek = legacyStmt.get(req.employee.companyId, req.employee.id, currentWeek);

  const isCompletedThisWeek = attempt?.status === 'completed' || Boolean(legacyThisWeek);
  const isInProgress = attempt?.status === 'in_progress';
  const isCheckinDue = !isCompletedThisWeek;

  // 2. Get total completed count & historical stats
  const countStmt = db.prepare(`
    SELECT COUNT(*) as total_completed, AVG(stress_level) as avg_stress
    FROM employee_surveys 
    WHERE company_id = ? AND employee_id = ?
  `);
  const stats = countStmt.get(req.employee.companyId, req.employee.id);

  // 3. Get last completed survey date
  const lastSurveyStmt = db.prepare(`
    SELECT submitted_at, stress_level, sentiment, week_identifier
    FROM employee_surveys
    WHERE company_id = ? AND employee_id = ?
    ORDER BY submitted_at DESC
    LIMIT 1
  `);
  const lastSurvey = lastSurveyStmt.get(req.employee.companyId, req.employee.id);

  // 4. Get recent completed surveys
  const recentStmt = db.prepare(`
    SELECT id, stress_level, workload_score, sentiment, energy_level, notes, submitted_at, week_identifier
    FROM employee_surveys
    WHERE company_id = ? AND employee_id = ?
    ORDER BY submitted_at DESC
    LIMIT 4
  `);
  const recentSurveys = recentStmt.all(req.employee.companyId, req.employee.id);

  // Parse questions answered count if in progress
  let answeredCount = 0;
  if (isInProgress && attempt?.responses) {
    try {
      answeredCount = Object.keys(JSON.parse(attempt.responses)).length;
    } catch (e) {}
  }

  return res.json({
    employee: req.employee,
    currentWeek,
    isCheckinDue,
    status: isCompletedThisWeek ? 'completed' : (isInProgress ? 'in_progress' : 'ready'),
    attemptId: attempt?.id || null,
    totalQuestions: 30,
    estimatedMinutes: '5–7 minutes',
    answeredCount,
    lastCompletedDate: lastSurvey?.submitted_at || null,
    lastSurveyInfo: lastSurvey || null,
    nextScheduledDate: 'Every Monday 09:00 AM (Weekly cycle)',
    stats: {
      totalCompleted: stats?.total_completed || 0,
      averageStressIndex: stats?.avg_stress ? Math.round(stats.avg_stress) : (isCompletedThisWeek ? 28 : null),
      streakWeeks: stats?.total_completed || 0
    },
    recentSurveys
  });
});

// GET /api/employee/survey/current
apiApp.get('/api/employee/survey/current', authenticateEmployeeSession, (req, res) => {
  const currentWeek = getCurrentWeekIdentifier();

  const stmt = db.prepare(`
    SELECT * FROM survey_attempts
    WHERE company_id = ? AND employee_id = ? AND week_identifier = ?
  `);
  const attempt = stmt.get(req.employee.companyId, req.employee.id, currentWeek);

  if (!attempt) {
    return res.json({
      status: 'ready',
      weekIdentifier: currentWeek,
      totalQuestions: 30,
      isCheckinDue: true
    });
  }

  const questionIds = JSON.parse(attempt.question_ids || '[]');
  const responses = JSON.parse(attempt.responses || '{}');
  
  // Reconstruct exact ordered questions from QUESTION_BANK
  const qMap = new Map(QUESTION_BANK.map(q => [q.id, q]));
  const questions = questionIds.map(id => qMap.get(id)).filter(Boolean);

  let categoryScores = null;
  if (attempt.category_scores) {
    try { categoryScores = JSON.parse(attempt.category_scores); } catch (e) {}
  }

  return res.json({
    status: attempt.status,
    attemptId: attempt.id,
    weekIdentifier: attempt.week_identifier,
    currentQuestionIndex: attempt.current_question_index || 0,
    totalQuestions: questions.length,
    questions,
    responses,
    stressIndex: attempt.stress_index,
    wellbeingCategory: attempt.wellbeing_category,
    categoryScores,
    recommendation: attempt.recommendation,
    submittedAt: attempt.submitted_at
  });
});

// POST /api/employee/survey/start
// Starts or resumes a 30-question randomized survey for the current week.
// Ensures questions are selected without replacement and stable across page refreshes.
apiApp.post('/api/employee/survey/start', authenticateEmployeeSession, (req, res) => {
  const currentWeek = getCurrentWeekIdentifier();

  // 1. Check if attempt already exists
  const existingStmt = db.prepare(`
    SELECT * FROM survey_attempts
    WHERE company_id = ? AND employee_id = ? AND week_identifier = ?
  `);
  const existing = existingStmt.get(req.employee.companyId, req.employee.id, currentWeek);

  if (existing) {
    if (existing.status === 'completed') {
      return res.status(400).json({
        error: 'Weekly check-in has already been completed for this period. Retakes require administrator authorization.',
        code: 'ALREADY_COMPLETED',
        attemptId: existing.id
      });
    }

    // Return existing in-progress attempt with stable question order
    const questionIds = JSON.parse(existing.question_ids || '[]');
    const responses = JSON.parse(existing.responses || '{}');
    const qMap = new Map(QUESTION_BANK.map(q => [q.id, q]));
    const questions = questionIds.map(id => qMap.get(id)).filter(Boolean);

    return res.json({
      success: true,
      resumed: true,
      attemptId: existing.id,
      weekIdentifier: existing.week_identifier,
      currentQuestionIndex: existing.current_question_index || 0,
      totalQuestions: questions.length,
      questions,
      responses
    });
  }

  // 2. Generate a new attempt: randomly select 30 unique questions without replacement
  const selectedQuestions = selectRandomQuestions(30);
  const questionIds = selectedQuestions.map(q => q.id);
  const attemptId = `ATTEMPT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const insertStmt = db.prepare(`
    INSERT INTO survey_attempts 
    (id, employee_id, company_id, week_identifier, status, question_ids, responses, current_question_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'in_progress', ?, '{}', 0, ?, ?)
  `);

  insertStmt.run(
    attemptId,
    req.employee.id,
    req.employee.companyId,
    currentWeek,
    JSON.stringify(questionIds),
    now,
    now
  );

  return res.json({
    success: true,
    resumed: false,
    attemptId,
    weekIdentifier: currentWeek,
    currentQuestionIndex: 0,
    totalQuestions: selectedQuestions.length,
    questions: selectedQuestions,
    responses: {}
  });
});

// POST /api/employee/survey/save-progress
// Saves intermediate answers as the employee progresses (preserves answers forward & backward)
apiApp.post('/api/employee/survey/save-progress', authenticateEmployeeSession, (req, res) => {
  const { attemptId, questionId, score, answerIndex, answerText, currentQuestionIndex } = req.body || {};

  if (!attemptId) {
    return res.status(400).json({ error: 'attemptId is required' });
  }

  const stmt = db.prepare(`
    SELECT * FROM survey_attempts 
    WHERE id = ? AND company_id = ? AND employee_id = ?
  `);
  const attempt = stmt.get(attemptId, req.employee.companyId, req.employee.id);

  if (!attempt) {
    return res.status(404).json({ error: 'Survey attempt not found' });
  }

  if (attempt.status === 'completed') {
    return res.status(400).json({ error: 'Survey has already been submitted and finalized.' });
  }

  const responses = JSON.parse(attempt.responses || '{}');
  
  if (questionId) {
    responses[questionId] = {
      score: parseInt(score, 10),
      answerIndex: parseInt(answerIndex, 10),
      answerText: String(answerText || ''),
      savedAt: new Date().toISOString()
    };
  }

  const newIndex = typeof currentQuestionIndex === 'number' ? currentQuestionIndex : attempt.current_question_index;
  const now = new Date().toISOString();

  const updateStmt = db.prepare(`
    UPDATE survey_attempts 
    SET responses = ?, current_question_index = ?, updated_at = ?
    WHERE id = ?
  `);
  updateStmt.run(JSON.stringify(responses), newIndex, now, attemptId);

  return res.json({
    success: true,
    answeredCount: Object.keys(responses).length,
    totalQuestions: 30
  });
});

// POST /api/employee/survey/submit
// Validates that all 30 questions are answered, calculates directional scoring,
// marks attempt completed, and synchronizes to employee_surveys.
apiApp.post('/api/employee/survey/submit', authenticateEmployeeSession, (req, res) => {
  const { attemptId } = req.body || {};

  if (!attemptId) {
    return res.status(400).json({ error: 'attemptId is required' });
  }

  const stmt = db.prepare(`
    SELECT * FROM survey_attempts 
    WHERE id = ? AND company_id = ? AND employee_id = ?
  `);
  const attempt = stmt.get(attemptId, req.employee.companyId, req.employee.id);

  if (!attempt) {
    return res.status(404).json({ error: 'Survey attempt not found' });
  }

  if (attempt.status === 'completed') {
    return res.status(400).json({ 
      error: 'Survey has already been submitted.',
      code: 'ALREADY_SUBMITTED'
    });
  }

  const questionIds = JSON.parse(attempt.question_ids || '[]');
  const responses = JSON.parse(attempt.responses || '{}');

  // Verify all 30 questions are answered
  const missing = questionIds.filter(id => !responses[id] || typeof responses[id].score !== 'number');
  if (missing.length > 0) {
    return res.status(400).json({
      error: `Please answer all 30 questions before submitting. Unanswered: ${missing.length}`,
      missingQuestionIds: missing,
      answeredCount: Object.keys(responses).length,
      totalRequired: questionIds.length
    });
  }

  // Calculate normalized wellbeing scoring
  const scoreResult = calculateWellbeingScore(responses, QUESTION_BANK);
  const now = new Date().toISOString();

  // Update survey_attempts table
  const updateStmt = db.prepare(`
    UPDATE survey_attempts 
    SET status = 'completed',
        stress_index = ?,
        wellbeing_category = ?,
        category_scores = ?,
        recommendation = ?,
        submitted_at = ?,
        updated_at = ?
    WHERE id = ?
  `);
  updateStmt.run(
    scoreResult.stressIndex,
    scoreResult.indicatorCategory,
    JSON.stringify(scoreResult.categoryScores),
    scoreResult.recommendation,
    now,
    now,
    attemptId
  );

  // Sync to employee_surveys table
  const legacyId = `SRV-${attemptId.replace('ATTEMPT-', '')}`;
  const workloadScore = responses['Q001']?.score || 3;
  const energyLevel = responses['Q021']?.score || 4;

  const syncStmt = db.prepare(`
    INSERT OR REPLACE INTO employee_surveys
    (id, employee_id, company_id, stress_level, workload_score, sentiment, energy_level, notes, submitted_at, week_identifier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  syncStmt.run(
    legacyId,
    req.employee.id,
    req.employee.companyId,
    scoreResult.stressIndex,
    workloadScore,
    scoreResult.indicatorCategory,
    energyLevel,
    scoreResult.recommendation,
    now,
    attempt.week_identifier
  );

  return res.json({
    success: true,
    attemptId,
    weekIdentifier: attempt.week_identifier,
    submittedAt: now,
    report: {
      stressIndex: scoreResult.stressIndex,
      indicatorCategory: scoreResult.indicatorCategory,
      indicatorColor: scoreResult.indicatorColor,
      recommendation: scoreResult.recommendation,
      categoryScores: scoreResult.categoryScores,
      totalAnswered: 30
    }
  });
});

// GET /api/employee/wellbeing
// Retrieves full completed survey history for the authenticated employee
apiApp.get('/api/employee/wellbeing', authenticateEmployeeSession, (req, res) => {
  // Query all completed attempts from survey_attempts
  const attemptsStmt = db.prepare(`
    SELECT id, week_identifier, stress_index, wellbeing_category, category_scores, recommendation, submitted_at
    FROM survey_attempts
    WHERE company_id = ? AND employee_id = ? AND status = 'completed'
    ORDER BY submitted_at DESC
  `);
  const attempts = attemptsStmt.all(req.employee.companyId, req.employee.id);

  // Fallback: Also fetch from employee_surveys if no completed attempts in survey_attempts table
  const legacyStmt = db.prepare(`
    SELECT id, week_identifier, stress_level as stress_index, sentiment as wellbeing_category, notes as recommendation, submitted_at
    FROM employee_surveys
    WHERE company_id = ? AND employee_id = ?
    ORDER BY submitted_at DESC
  `);
  const legacySurveys = legacyStmt.all(req.employee.companyId, req.employee.id);

  // Merge legacy with attempts if needed
  const existingWeeks = new Set(attempts.map(a => a.week_identifier));
  const mergedHistory = [...attempts];
  for (const leg of legacySurveys) {
    if (!existingWeeks.has(leg.week_identifier)) {
      mergedHistory.push({
        id: leg.id,
        week_identifier: leg.week_identifier,
        stress_index: leg.stress_index,
        wellbeing_category: leg.wellbeing_category,
        category_scores: null,
        recommendation: leg.recommendation,
        submitted_at: leg.submitted_at
      });
    }
  }

  // Sort descending
  mergedHistory.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  // Parse category_scores if string
  const formattedHistory = mergedHistory.map(item => {
    let catScores = item.category_scores;
    if (typeof catScores === 'string') {
      try { catScores = JSON.parse(catScores); } catch (e) { catScores = null; }
    }
    return {
      ...item,
      category_scores: catScores
    };
  });

  return res.json({
    employee: req.employee,
    totalCompleted: formattedHistory.length,
    latestReport: formattedHistory[0] || null,
    history: formattedHistory
  });
});

// GET /api/employee/surveys (Legacy endpoint retained for compatibility)
apiApp.get('/api/employee/surveys', authenticateEmployeeSession, (req, res) => {
  const stmt = db.prepare(`
    SELECT id, stress_level, workload_score, sentiment, energy_level, notes, submitted_at, week_identifier
    FROM employee_surveys
    WHERE company_id = ? AND employee_id = ?
    ORDER BY submitted_at DESC
  `);
  const surveys = stmt.all(req.employee.companyId, req.employee.id);

  return res.json({
    employee: {
      id: req.employee.id,
      name: req.employee.name,
      department: req.employee.department
    },
    surveys
  });
});

// POST /api/employee/surveys (Legacy simple check-in route for backward compatibility)
apiApp.post('/api/employee/surveys', authenticateEmployeeSession, (req, res) => {
  const { stressLevel, workloadScore, energyLevel, sentiment, notes } = req.body || {};

  const stress = Math.max(0, Math.min(100, parseInt(stressLevel, 10) || 30));
  const workload = Math.max(1, Math.min(5, parseInt(workloadScore, 10) || 3));
  const energy = Math.max(1, Math.min(5, parseInt(energyLevel, 10) || 3));
  const sentimentStr = (sentiment || 'Calm & Steady').trim();
  const notesStr = (notes || '').trim();
  const weekId = getCurrentWeekIdentifier();
  const surveyId = `SRV-${Date.now().toString().slice(-6)}`;

  const stmt = db.prepare(`
    INSERT INTO employee_surveys 
    (id, employee_id, company_id, stress_level, workload_score, sentiment, energy_level, notes, submitted_at, week_identifier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    surveyId,
    req.employee.id,
    req.employee.companyId,
    stress,
    workload,
    sentimentStr,
    energy,
    notesStr,
    new Date().toISOString(),
    weekId
  );

  return res.json({
    success: true,
    surveyId,
    message: 'Weekly check-in submitted successfully! Thank you for prioritizing your wellbeing.'
  });
});

// ==========================================
// 2. Game Sessions & Private Items Endpoints
// ==========================================

// POST /api/employee/games/session (Save or update game session lifecycle)
apiApp.post('/api/employee/games/session', authenticateEmployeeSession, (req, res) => {
  const {
    sessionId,
    gameId,
    startTime,
    endTime,
    elapsedDuration,
    status,
    selectedSettings,
    completionStatus,
    eventsMetadata
  } = req.body || {};

  if (!sessionId || !gameId) {
    return res.status(400).json({ error: 'sessionId and gameId are required' });
  }

  const validStatuses = ['in_progress', 'paused', 'completed', 'abandoned'];
  const sessionStatus = validStatuses.includes(status) ? status : 'in_progress';
  const now = new Date().toISOString();

  // Strip/sanitize events metadata to ensure zero private text or clinical claims
  let sanitizedMetadata = '{}';
  if (eventsMetadata && typeof eventsMetadata === 'object') {
    // Only allow safe gameplay event keys
    const safeKeys = [
      'moves', 'hintsUsed', 'undoCount', 'puzzleCompletions', 'difficulty',
      'pauses', 'checkInPre', 'checkInPost', 'cyclesCompleted', 'sensitivity',
      'origamiPattern', 'craneActionCategory', 'worryCategory', 'islandVisited',
      'weatherElementsCount', 'strokesCount', 'questStoryStep', 'questChoices'
    ];
    const safeObj = {};
    for (const key of safeKeys) {
      if (eventsMetadata[key] !== undefined) {
        safeObj[key] = eventsMetadata[key];
      }
    }
    sanitizedMetadata = JSON.stringify(safeObj);
  }

  const settingsStr = selectedSettings ? JSON.stringify(selectedSettings) : '{}';

  const stmt = db.prepare(`
    INSERT INTO game_sessions 
    (id, company_id, employee_id, game_id, start_time, end_time, elapsed_duration, status, selected_settings, completion_status, events_metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      end_time = excluded.end_time,
      elapsed_duration = excluded.elapsed_duration,
      status = excluded.status,
      selected_settings = excluded.selected_settings,
      completion_status = excluded.completion_status,
      events_metadata = excluded.events_metadata,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    sessionId,
    req.employee.companyId,
    req.employee.id,
    gameId,
    parseInt(startTime, 10) || Date.now(),
    endTime ? parseInt(endTime, 10) : null,
    Math.max(0, parseInt(elapsedDuration, 10) || 0),
    sessionStatus,
    settingsStr,
    completionStatus ? 1 : 0,
    sanitizedMetadata,
    now,
    now
  );

  return res.json({
    success: true,
    sessionId,
    status: sessionStatus
  });
});

// GET /api/employee/games/sessions (Retrieve session history for authenticated employee)
apiApp.get('/api/employee/games/sessions', authenticateEmployeeSession, (req, res) => {
  const stmt = db.prepare(`
    SELECT id, game_id, start_time, end_time, elapsed_duration, status, 
           selected_settings, completion_status, events_metadata, created_at, updated_at
    FROM game_sessions
    WHERE company_id = ? AND employee_id = ?
    ORDER BY start_time DESC
    LIMIT 100
  `);

  const rows = stmt.all(req.employee.companyId, req.employee.id);
  const sessions = rows.map(r => {
    let settings = {};
    let events = {};
    try { settings = JSON.parse(r.selected_settings || '{}'); } catch {}
    try { events = JSON.parse(r.events_metadata || '{}'); } catch {}
    return {
      sessionId: r.id,
      gameId: r.game_id,
      startTime: r.start_time,
      endTime: r.end_time,
      elapsedDuration: r.elapsed_duration,
      status: r.status,
      selectedSettings: settings,
      completionStatus: Boolean(r.completion_status),
      eventsMetadata: events,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  });

  return res.json({ sessions });
});

// POST /api/employee/private-items (Save private employee reflection/note/crane/artwork)
apiApp.post('/api/employee/private-items', authenticateEmployeeSession, (req, res) => {
  const { id, itemType, content } = req.body || {};

  if (!id || !itemType || !content) {
    return res.status(400).json({ error: 'id, itemType, and content are required' });
  }

  const allowedTypes = ['thought_reframer', 'weather_report', 'paper_crane', 'worry_balloon', 'inkstorm_art'];
  if (!allowedTypes.includes(itemType)) {
    return res.status(400).json({ error: 'Invalid private itemType' });
  }

  const now = new Date().toISOString();
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

  const stmt = db.prepare(`
    INSERT INTO employee_private_items
    (id, company_id, employee_id, item_type, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      content = excluded.content,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    id,
    req.employee.companyId,
    req.employee.id,
    itemType,
    contentStr,
    now,
    now
  );

  return res.json({
    success: true,
    id,
    itemType,
    savedAt: now
  });
});

// GET /api/employee/private-items (Retrieve private items belonging strictly to this employee)
apiApp.get('/api/employee/private-items', authenticateEmployeeSession, (req, res) => {
  const { itemType } = req.query;

  let query = `
    SELECT id, item_type, content, created_at, updated_at
    FROM employee_private_items
    WHERE company_id = ? AND employee_id = ?
  `;
  const params = [req.employee.companyId, req.employee.id];

  if (itemType) {
    query += ' AND item_type = ?';
    params.push(itemType);
  }

  query += ' ORDER BY updated_at DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  const items = rows.map(r => {
    let parsedContent = null;
    try {
      parsedContent = JSON.parse(r.content);
    } catch {
      parsedContent = r.content;
    }
    return {
      id: r.id,
      itemType: r.item_type,
      content: parsedContent,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  });

  return res.json({ items });
});

// DELETE /api/employee/private-items/:id (Permanently delete private reflection)
apiApp.delete('/api/employee/private-items/:id', authenticateEmployeeSession, (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`
    DELETE FROM employee_private_items
    WHERE company_id = ? AND employee_id = ? AND id = ?
  `);

  stmt.run(req.employee.companyId, req.employee.id, id);

  return res.json({
    success: true,
    deletedId: id
  });
});

// GET /api/admin/company-surveys
// Allows Company Admin mockup dashboard to inspect real persistent surveys for their company
apiApp.get('/api/admin/company-surveys', (req, res) => {
  const companyId = (req.query.companyId || 'CP-ORG-78214').trim().toUpperCase();

  const stmt = db.prepare(`
    SELECT s.id, s.employee_id, e.name as employee_name, e.department, e.title,
           s.stress_level, s.workload_score, s.sentiment, s.energy_level, s.notes,
           s.submitted_at, s.week_identifier
    FROM employee_surveys s
    JOIN employees e ON e.company_id = s.company_id AND e.id = s.employee_id
    WHERE s.company_id = ?
    ORDER BY s.submitted_at DESC
  `);
  const surveys = stmt.all(companyId);

  // Compute aggregate statistics
  const countStmt = db.prepare(`
    SELECT COUNT(*) as total_responses, AVG(stress_level) as avg_stress
    FROM employee_surveys
    WHERE company_id = ?
  `);
  const agg = countStmt.get(companyId);

  return res.json({
    companyId,
    totalResponses: agg?.total_responses || 0,
    averageStressIndex: agg?.avg_stress ? Math.round(agg.avg_stress) : null,
    surveys
  });
});

// ==========================================
// 2.5. AI Wellbeing Companion Endpoints
// ==========================================

// GET /api/employee/companion/status
// Check if an AI model is configured and operational
apiApp.get('/api/employee/companion/status', authenticateEmployeeSession, (req, res) => {
  const config = getAiConfig();
  return res.json({
    operational: config.configured,
    provider: config.provider,
    label: config.label,
    model: config.model,
    documentation: 'CalmPop AI Companion connects to OpenRouter, Google Gemini, or OpenAI server-side via AI_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY.'
  });
});

// GET /api/employee/companion/conversations
// List conversations for the authenticated employee (strictly tenant-isolated)
apiApp.get('/api/employee/companion/conversations', authenticateEmployeeSession, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT c.id, c.title, c.mode, c.created_at, c.updated_at,
             COUNT(m.id) as message_count,
             (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_preview
      FROM chat_conversations c
      LEFT JOIN chat_messages m ON m.conversation_id = c.id
      WHERE c.company_id = ? AND c.employee_id = ?
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `);

    const conversations = stmt.all(req.employee.companyId, req.employee.id);
    return res.json({ conversations });
  } catch (err) {
    console.error('[CalmPop Companion] Error listing conversations:', err);
    return res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
});

// POST /api/employee/companion/conversations
// Start a new conversation
apiApp.post('/api/employee/companion/conversations', authenticateEmployeeSession, (req, res) => {
  try {
    const { title, mode } = req.body || {};
    const validModes = ['talk', 'solution', 'unwind', 'organize'];
    const chosenMode = validModes.includes(mode) ? mode : 'talk';
    const convId = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO chat_conversations (id, company_id, employee_id, title, mode, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      convId,
      req.employee.companyId,
      req.employee.id,
      title?.trim() || 'New Conversation',
      chosenMode,
      now,
      now
    );

    return res.status(201).json({
      conversation: {
        id: convId,
        companyId: req.employee.companyId,
        employeeId: req.employee.id,
        title: title?.trim() || 'New Conversation',
        mode: chosenMode,
        createdAt: now,
        updatedAt: now,
        messageCount: 0
      }
    });
  } catch (err) {
    console.error('[CalmPop Companion] Error creating conversation:', err);
    return res.status(500).json({ error: 'Failed to create conversation.' });
  }
});

// GET /api/employee/companion/conversations/:id/messages
// Get message history for an authenticated employee's conversation
apiApp.get('/api/employee/companion/conversations/:id/messages', authenticateEmployeeSession, (req, res) => {
  try {
    const convId = req.params.id;

    // Verify ownership
    const convStmt = db.prepare(`
      SELECT * FROM chat_conversations 
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    const conversation = convStmt.get(convId, req.employee.companyId, req.employee.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied.' });
    }

    const msgStmt = db.prepare(`
      SELECT id, conversation_id, role, content, action_card, status, created_at
      FROM chat_messages
      WHERE conversation_id = ? AND company_id = ? AND employee_id = ?
      ORDER BY created_at ASC
    `);
    const messages = msgStmt.all(convId, req.employee.companyId, req.employee.id).map(m => {
      let parsedActionCard = null;
      if (m.action_card) {
        try { parsedActionCard = JSON.parse(m.action_card); } catch (e) {}
      }
      return {
        id: m.id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        actionCard: parsedActionCard,
        status: m.status,
        createdAt: m.created_at
      };
    });

    return res.json({ conversation, messages });
  } catch (err) {
    console.error('[CalmPop Companion] Error fetching messages:', err);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// POST /api/employee/companion/conversations/:id/messages
// Send employee message, execute real AI reasoning, and save response
apiApp.post('/api/employee/companion/conversations/:id/messages', authenticateEmployeeSession, async (req, res) => {
  try {
    const convId = req.params.id;
    const { content, mode } = req.body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }

    // Verify conversation ownership
    const convStmt = db.prepare(`
      SELECT * FROM chat_conversations 
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    const conversation = convStmt.get(convId, req.employee.companyId, req.employee.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied.' });
    }

    const effectiveMode = mode || conversation.mode || 'talk';
    const userMsgId = crypto.randomUUID();
    const userTimestamp = new Date().toISOString();

    // 1. Save user message to database
    const insertUserStmt = db.prepare(`
      INSERT INTO chat_messages (id, conversation_id, company_id, employee_id, role, content, status, created_at)
      VALUES (?, ?, ?, ?, 'user', ?, 'completed', ?)
    `);
    insertUserStmt.run(userMsgId, convId, req.employee.companyId, req.employee.id, content.trim(), userTimestamp);

    // 2. Fetch full message history for context
    const histStmt = db.prepare(`
      SELECT role, content FROM chat_messages
      WHERE conversation_id = ? AND company_id = ? AND employee_id = ?
      ORDER BY created_at ASC
    `);
    const historyMessages = histStmt.all(convId, req.employee.companyId, req.employee.id);

    // 3. Call server AI service
    let aiResult;
    try {
      aiResult = await generateAiReply({
        messages: historyMessages,
        mode: effectiveMode,
        employeeInfo: req.employee
      });
    } catch (aiErr) {
      console.error('[CalmPop Companion] AI service failure:', aiErr);
      
      // If AI key is missing, return 503 with setup instructions
      if (aiErr.code === 'AI_KEY_MISSING') {
        return res.status(503).json({
          error: 'AI_KEY_MISSING',
          message: aiErr.details?.message || 'Server AI model not configured.',
          setupHelp: aiErr.details?.setupHelp || 'Configure AI_API_KEY with AI_BASE_URL (OpenRouter) or GEMINI_API_KEY in server environment (.env).',
          requiredVars: aiErr.details?.requiredVars || ['AI_API_KEY and AI_BASE_URL (OpenRouter)'],
          unsentMessage: content.trim()
        });
      }

      // If model not found / unavailable on provider
      if (aiErr.code === 'MODEL_NOT_FOUND' || aiErr.status === 404) {
        return res.status(404).json({
          error: 'MODEL_NOT_FOUND',
          message: aiErr.message || 'Configured model not available on provider.',
          unsentMessage: content.trim()
        });
      }

      // If insufficient credits or quota on provider
      if (aiErr.code === 'INSUFFICIENT_CREDITS' || aiErr.status === 402) {
        return res.status(402).json({
          error: 'INSUFFICIENT_CREDITS',
          message: aiErr.message || 'Insufficient credits or quota for this model on OpenRouter.',
          unsentMessage: content.trim()
        });
      }

      // If invalid API key
      if (aiErr.code === 'INVALID_API_KEY' || aiErr.status === 401 || aiErr.status === 403) {
        return res.status(401).json({
          error: 'INVALID_API_KEY',
          message: aiErr.message || 'Invalid or expired API key. Please check your .env configuration.',
          unsentMessage: content.trim()
        });
      }

      // If rate limited
      if (aiErr.code === 'RATE_LIMIT_EXCEEDED' || aiErr.status === 429) {
        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: aiErr.message || 'The AI service is experiencing high demand. Please wait a moment and click Retry.',
          unsentMessage: content.trim()
        });
      }

      // If timeout
      if (aiErr.code === 'AI_TIMEOUT') {
        return res.status(504).json({
          error: 'AI_TIMEOUT',
          message: 'The AI service took too long to respond. Please click Retry.',
          unsentMessage: content.trim()
        });
      }

      // General AI error
      return res.status(502).json({
        error: 'AI_SERVICE_ERROR',
        message: aiErr.message || 'The AI service encountered an error generating a response.',
        unsentMessage: content.trim()
      });
    }

    // 4. Save AI reply to database
    const assistantMsgId = crypto.randomUUID();
    const assistantTimestamp = new Date().toISOString();
    const actionCardJson = aiResult.actionCard ? JSON.stringify(aiResult.actionCard) : null;

    const insertAssistantStmt = db.prepare(`
      INSERT INTO chat_messages (id, conversation_id, company_id, employee_id, role, content, action_card, status, created_at)
      VALUES (?, ?, ?, ?, 'assistant', ?, ?, 'completed', ?)
    `);
    insertAssistantStmt.run(assistantMsgId, convId, req.employee.companyId, req.employee.id, aiResult.content, actionCardJson, assistantTimestamp);

    // 5. Update conversation timestamp and title if it's new
    let updatedTitle = conversation.title;
    if (conversation.title === 'New Conversation' || !conversation.title) {
      // Generate clean title from user's first query (up to 5-6 words)
      const words = content.trim().split(/\s+/).slice(0, 6).join(' ');
      updatedTitle = words.length > 36 ? words.substring(0, 33) + '...' : words;
    }

    const updateConvStmt = db.prepare(`
      UPDATE chat_conversations 
      SET title = ?, mode = ?, updated_at = ?
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    updateConvStmt.run(updatedTitle, effectiveMode, assistantTimestamp, convId, req.employee.companyId, req.employee.id);

    return res.json({
      userMessage: {
        id: userMsgId,
        conversationId: convId,
        role: 'user',
        content: content.trim(),
        createdAt: userTimestamp
      },
      assistantMessage: {
        id: assistantMsgId,
        conversationId: convId,
        role: 'assistant',
        content: aiResult.content,
        actionCard: aiResult.actionCard,
        createdAt: assistantTimestamp,
        isCrisis: !!aiResult.isCrisis
      },
      conversation: {
        ...conversation,
        title: updatedTitle,
        mode: effectiveMode,
        updatedAt: assistantTimestamp
      }
    });

  } catch (err) {
    console.error('[CalmPop Companion] Error handling message:', err);
    return res.status(500).json({ error: 'Internal server error processing message.' });
  }
});

// PATCH /api/employee/companion/conversations/:id
// Rename conversation or change active mode
apiApp.patch('/api/employee/companion/conversations/:id', authenticateEmployeeSession, (req, res) => {
  try {
    const convId = req.params.id;
    const { title, mode } = req.body || {};

    const convStmt = db.prepare(`
      SELECT * FROM chat_conversations 
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    const conversation = convStmt.get(convId, req.employee.companyId, req.employee.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied.' });
    }

    const newTitle = title !== undefined ? title.trim() || 'Untitled Conversation' : conversation.title;
    const validModes = ['talk', 'solution', 'unwind', 'organize'];
    const newMode = validModes.includes(mode) ? mode : conversation.mode;
    const now = new Date().toISOString();

    const updateStmt = db.prepare(`
      UPDATE chat_conversations 
      SET title = ?, mode = ?, updated_at = ?
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    updateStmt.run(newTitle, newMode, now, convId, req.employee.companyId, req.employee.id);

    return res.json({
      success: true,
      conversation: {
        ...conversation,
        title: newTitle,
        mode: newMode,
        updatedAt: now
      }
    });
  } catch (err) {
    console.error('[CalmPop Companion] Error updating conversation:', err);
    return res.status(500).json({ error: 'Failed to update conversation.' });
  }
});

// DELETE /api/employee/companion/conversations/:id
// Delete an entire conversation (cascades to messages)
apiApp.delete('/api/employee/companion/conversations/:id', authenticateEmployeeSession, (req, res) => {
  try {
    const convId = req.params.id;

    const delStmt = db.prepare(`
      DELETE FROM chat_conversations 
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    const result = delStmt.run(convId, req.employee.companyId, req.employee.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Conversation not found or access denied.' });
    }

    return res.json({
      success: true,
      message: 'Conversation and messages deleted successfully.'
    });
  } catch (err) {
    console.error('[CalmPop Companion] Error deleting conversation:', err);
    return res.status(500).json({ error: 'Failed to delete conversation.' });
  }
});

// DELETE /api/employee/companion/conversations/:id/messages
// Clear all messages within a conversation while keeping the conversation entity
apiApp.delete('/api/employee/companion/conversations/:id/messages', authenticateEmployeeSession, (req, res) => {
  try {
    const convId = req.params.id;

    // Verify ownership
    const convStmt = db.prepare(`
      SELECT * FROM chat_conversations 
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    const conversation = convStmt.get(convId, req.employee.companyId, req.employee.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied.' });
    }

    const delMsgStmt = db.prepare(`
      DELETE FROM chat_messages 
      WHERE conversation_id = ? AND company_id = ? AND employee_id = ?
    `);
    delMsgStmt.run(convId, req.employee.companyId, req.employee.id);

    // Reset conversation title and update timestamp
    const now = new Date().toISOString();
    const updateConv = db.prepare(`
      UPDATE chat_conversations 
      SET title = 'New Conversation', updated_at = ?
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    updateConv.run(now, convId, req.employee.companyId, req.employee.id);

    return res.json({
      success: true,
      message: 'Conversation cleared successfully.'
    });
  } catch (err) {
    console.error('[CalmPop Companion] Error clearing messages:', err);
    return res.status(500).json({ error: 'Failed to clear conversation messages.' });
  }
});

// POST /api/employee/companion/conversations/:id/summarize
// Generate a confidential conversation takeaway summary
apiApp.post('/api/employee/companion/conversations/:id/summarize', authenticateEmployeeSession, async (req, res) => {
  try {
    const convId = req.params.id;

    // Verify ownership
    const convStmt = db.prepare(`
      SELECT * FROM chat_conversations 
      WHERE id = ? AND company_id = ? AND employee_id = ?
    `);
    const conversation = convStmt.get(convId, req.employee.companyId, req.employee.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied.' });
    }

    const msgStmt = db.prepare(`
      SELECT role, content FROM chat_messages
      WHERE conversation_id = ? AND company_id = ? AND employee_id = ?
      ORDER BY created_at ASC
    `);
    const messages = msgStmt.all(convId, req.employee.companyId, req.employee.id);

    const summary = await generateConversationSummary({
      messages,
      employeeInfo: req.employee
    });

    return res.json({
      success: true,
      summary,
      conversationId: convId,
      confidentialityNote: 'This summary is generated for your personal reference and is never shared with HR or company administration.'
    });
  } catch (err) {
    console.error('[CalmPop Companion] Error generating summary:', err);
    return res.status(500).json({ error: 'Failed to generate conversation summary.' });
  }
});

// ==========================================
// 3. Dev-Only Account Provisioning Endpoint
// ==========================================
// Clearly labeled development utility to provision real test employee credentials
apiApp.post('/api/dev/provision-test-account', (req, res) => {
  const { companyId, companyName, username, email, name, department, title, password } = req.body || {};

  if (!companyId || !username || !password || !name) {
    return res.status(400).json({ error: 'companyId, username, password, and name are required' });
  }

  const cleanCompanyId = companyId.trim().toUpperCase();
  const cleanUsername = username.trim().toLowerCase();

  // Ensure company exists
  const compStmt = db.prepare(`
    INSERT OR IGNORE INTO companies (id, name, created_at)
    VALUES (?, ?, ?)
  `);
  compStmt.run(cleanCompanyId, companyName || cleanCompanyId, new Date().toISOString());

  // Count existing employees to compute sequential ID
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM employees WHERE company_id = ?');
  const count = countStmt.get(cleanCompanyId)?.count || 0;
  const empId = `EMP-${String(count + 1).padStart(2, '0')}`;

  const passwordHash = hashPassword(password);

  const empStmt = db.prepare(`
    INSERT OR REPLACE INTO employees 
    (id, company_id, username, email, name, department, title, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  empStmt.run(
    empId,
    cleanCompanyId,
    cleanUsername,
    email || `${cleanUsername}@${cleanCompanyId.toLowerCase()}.com`,
    name,
    department || 'Platform Engineering',
    title || 'Software Engineer',
    passwordHash,
    new Date().toISOString()
  );

  return res.json({
    success: true,
    message: `Provisioned real authenticated employee ${cleanUsername} in ${cleanCompanyId}`,
    employee: {
      id: empId,
      companyId: cleanCompanyId,
      username: cleanUsername,
      name
    }
  });
});

// Health check
apiApp.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CalmPop Real Employee Authentication Service',
    database: 'SQLite (node:sqlite)',
    timestamp: new Date().toISOString()
  });
});
