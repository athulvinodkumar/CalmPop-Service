// CalmPop - Server Authentication Utilities
// Provides scrypt password hashing, timing-safe verification, and secure token generation

import crypto from 'node:crypto';

const KEY_LENGTH = 64;

/**
 * Hashes a plaintext password using scrypt with a random 16-byte salt
 * Returns string in format: <salt_hex>:<hash_hex>
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored <salt>:<hash> string
 * Uses timingSafeEqual to protect against timing side-channel attacks
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;

  const [salt, expectedHashHex] = parts;
  try {
    const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH);
    const expectedBuffer = Buffer.from(expectedHashHex, 'hex');
    
    if (derivedKey.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  } catch (err) {
    console.error('[AuthUtils] Error verifying password:', err);
    return false;
  }
}

/**
 * Generates a 256-bit cryptographically secure random session token
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
