// Test node:sqlite and scrypt password hashing
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const testDbPath = path.resolve('data/test.db');
if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });

const db = new DatabaseSync(testDbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS test_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
  )
`);

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync('CalmPop@2026!', salt, 64).toString('hex');
const storedHash = `${salt}:${hash}`;

const insert = db.prepare('INSERT OR REPLACE INTO test_users (id, username, password_hash) VALUES (?, ?, ?)');
insert.run('1', 'aaravpatel', storedHash);

const query = db.prepare('SELECT * FROM test_users WHERE username = ?');
const user = query.get('aaravpatel');

console.log('User fetched from SQLite:', user.username);

// Verify password
const [userSalt, expectedHash] = user.password_hash.split(':');
const verifyHash = crypto.scryptSync('CalmPop@2026!', userSalt, 64).toString('hex');
const isMatch = crypto.timingSafeEqual(Buffer.from(verifyHash, 'hex'), Buffer.from(expectedHash, 'hex'));
console.log('Password match test:', isMatch);

// Clean up test DB
db.close();
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
console.log('Test completed successfully!');
