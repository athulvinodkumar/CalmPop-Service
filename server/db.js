// CalmPop - Real Server Persistent SQLite Database
// Uses Node 24 native DatabaseSync for secure, zero-dependency SQLite storage

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'calmpop.db');
export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS employees (
    id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    title TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (company_id, id),
    UNIQUE (company_id, username),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    remember_me INTEGER DEFAULT 0,
    FOREIGN KEY (company_id, employee_id) REFERENCES employees(company_id, id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    attempt_time INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_login_attempts_lookup 
    ON login_attempts(identifier, attempt_time);

  CREATE TABLE IF NOT EXISTS employee_surveys (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    stress_level INTEGER NOT NULL,
    workload_score INTEGER NOT NULL,
    sentiment TEXT NOT NULL,
    energy_level INTEGER NOT NULL,
    notes TEXT,
    submitted_at TEXT NOT NULL,
    week_identifier TEXT NOT NULL,
    FOREIGN KEY (company_id, employee_id) REFERENCES employees(company_id, id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_employee_surveys_employee
    ON employee_surveys(company_id, employee_id, submitted_at);

  CREATE TABLE IF NOT EXISTS survey_attempts (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    week_identifier TEXT NOT NULL,
    status TEXT NOT NULL, -- 'in_progress' | 'completed'
    question_ids TEXT NOT NULL, -- JSON array of 30 question IDs in stable order
    responses TEXT NOT NULL, -- JSON object: { [qId]: { score, answerIndex, answerText } }
    current_question_index INTEGER DEFAULT 0,
    stress_index INTEGER,
    wellbeing_category TEXT,
    category_scores TEXT, -- JSON object with per-category breakdowns
    recommendation TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    submitted_at TEXT,
    FOREIGN KEY (company_id, employee_id) REFERENCES employees(company_id, id) ON DELETE CASCADE,
    UNIQUE (company_id, employee_id, week_identifier)
  );

  CREATE INDEX IF NOT EXISTS idx_survey_attempts_lookup
    ON survey_attempts(company_id, employee_id, week_identifier);

  CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER,
    elapsed_duration INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL, -- 'in_progress', 'paused', 'completed', 'abandoned'
    selected_settings TEXT, -- JSON string
    completion_status INTEGER DEFAULT 0,
    events_metadata TEXT, -- JSON string of sanitized gameplay events
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id, employee_id) REFERENCES employees(company_id, id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_game_sessions_employee
    ON game_sessions(company_id, employee_id, game_id);

  CREATE TABLE IF NOT EXISTS employee_private_items (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id, employee_id) REFERENCES employees(company_id, id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_employee_private_items_lookup
    ON employee_private_items(company_id, employee_id, item_type);

  -- AI Wellbeing Companion Conversations
  CREATE TABLE IF NOT EXISTS chat_conversations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    mode TEXT NOT NULL DEFAULT 'talk', -- 'talk' | 'solution' | 'unwind' | 'organize'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id, employee_id) REFERENCES employees(company_id, id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_chat_conversations_employee
    ON chat_conversations(company_id, employee_id, updated_at DESC);

  -- AI Wellbeing Companion Messages
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' | 'assistant'
    content TEXT NOT NULL,
    action_card TEXT, -- JSON string or null
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed' | 'failed'
    created_at TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id, employee_id) REFERENCES employees(company_id, id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_chat_messages_lookup
    ON chat_messages(conversation_id, created_at ASC);
`);

console.log('[CalmPop DB] SQLite database initialized successfully at:', DB_PATH);

