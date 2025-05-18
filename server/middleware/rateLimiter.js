import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Create Redis client if configuration exists
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

/**
 * Global rate limiter for all API requests
 * Limits requests per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi nanti.'
  },
  // Use Redis store if available, or memory store as fallback
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:global:'
      })
    : undefined
});

/**
 * Rate limiter for auth API endpoints
 * Stricter to prevent brute force
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5, // 5 requests per IP per 60 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 60 menit.'
  },
  // Use Redis store if available, or memory store as fallback
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:auth:'
      })
    : undefined
});