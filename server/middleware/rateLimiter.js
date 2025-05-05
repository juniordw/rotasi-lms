const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Buat Redis client jika konfigurasi ada
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

/**
 * Rate limiter global untuk semua request API
 * Membatasi jumlah request per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // 100 request per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi nanti.'
  },
  // Gunakan Redis store jika tersedia, atau memory store sebagai fallback
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:global:'
      })
    : undefined
});

/**
 * Rate limiter untuk API authentication
 * Lebih ketat untuk mencegah brute force
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 menit
  max: 5, // 5 request per IP per 60 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 60 menit.'
  },
  // Gunakan Redis store jika tersedia, atau memory store sebagai fallback
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:auth:'
      })
    : undefined
});

module.exports = {
  globalLimiter,
  authLimiter
};