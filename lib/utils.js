// lib/utils.js

/**
 * Validates environment variables
 * @returns {boolean} - Returns true if all required environment variables are set
 */
function validateEnv() {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  return true;
}

/**
 * Format error response
 * @param {Error} error - The error object
 * @param {string} errorCode - Optional error code
 * @returns {Object} - Formatted error response
 */
function formatError(error, errorCode = 'UNKNOWN_ERROR') {
  return {
    status: 'error',
    message: error.message || 'An unexpected error occurred',
    error_code: errorCode,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format success response
 * @param {*} data - The data to return
 * @param {string} message - Optional success message
 * @returns {Object} - Formatted success response
 */
function formatSuccess(data, message = 'Request successful') {
  return {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Sanitize input string
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[{}]/g, '')  // Remove potential JSON injection
    .substring(0, 10000);  // Limit length
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} - True if valid UUID
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate random ID
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} - Parsed pagination parameters
 */
function parsePagination(query) {
  const limit = Math.min(parseInt(query.limit) || 20, 100); // Max 100 items
  const offset = parseInt(query.offset) || 0;

  return { limit, offset };
}

/**
 * Calculate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} limit - Items per page
 * @param {number} offset - Current offset
 * @returns {Object} - Pagination metadata
 */
function calculatePagination(total, limit, offset) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNext = offset + limit < total;
  const hasPrevious = offset > 0;

  return {
    current_page: currentPage,
    total_pages: totalPages,
    total_items: total,
    items_per_page: limit,
    has_next: hasNext,
    has_previous: hasPrevious,
    next_offset: hasNext ? offset + limit : null,
    previous_offset: hasPrevious ? Math.max(0, offset - limit) : null
  };
}

/**
 * Delay function for rate limiting
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rate limiter using simple in-memory store
 * @param {string} key - Unique key for rate limiting
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if request is allowed
 */
const rateLimitStore = new Map();

function isRateLimited(key, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const requests = rateLimitStore.get(key);

  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);

  if (validRequests.length >= maxRequests) {
    return true; // Rate limited
  }

  // Add current request
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);

  return false; // Not rate limited
}

/**
 * Clean up rate limit store (call periodically)
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  const oneHourAgo = now - 3600000; // 1 hour

  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > oneHourAgo);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
}

// Clean up rate limit store every 10 minutes
setInterval(cleanupRateLimitStore, 600000);

module.exports = {
  validateEnv,
  formatError,
  formatSuccess,
  sanitizeInput,
  isValidUUID,
  generateId,
  isValidEmail,
  parsePagination,
  calculatePagination,
  delay,
  isRateLimited,
  cleanupRateLimitStore
};