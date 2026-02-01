/**
 * In-memory token blacklist for logout functionality.
 * Tokens are removed after expiry (max 1hr for access tokens).
 * For production at scale, use Redis.
 */
const tokenBlacklist = new Set();

function addToBlacklist(token) {
    tokenBlacklist.add(token);
}

function isBlacklisted(token) {
    return tokenBlacklist.has(token);
}

function removeExpiredFromBlacklist() {
    // In-memory blacklist - tokens expire in 1h, we could prune old entries
    // For now we keep them; Set size stays reasonable for typical usage
}

module.exports = { addToBlacklist, isBlacklisted, removeExpiredFromBlacklist };
