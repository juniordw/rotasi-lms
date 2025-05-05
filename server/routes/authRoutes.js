const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter untuk endpoint login
 * Membatasi percobaan login ke 5 kali dalam 15 menit
 * Mencegah brute force attack
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 permintaan per IP
  message: { 
    success: false, 
    message: 'Terlalu banyak percobaan login. Coba lagi setelah 15 menit' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter untuk endpoint register
 * Membatasi percobaan register ke 3 kali dalam 60 menit
 * Mencegah spam registrasi
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 menit
  max: 3, // maksimal 3 permintaan per IP
  message: { 
    success: false, 
    message: 'Terlalu banyak percobaan registrasi. Coba lagi nanti' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/auth/register
 * @desc    Register user baru
 * @access  Public
 */
router.post('/register', registerLimiter, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user dan dapatkan token
 * @access  Public
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token menggunakan refresh token
 * @access  Public (with refresh token)
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user dan invalidate refresh token
 * @access  Private
 */
router.post('/logout', auth, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Dapatkan info user yang sedang login
 * @access  Private
 */
router.get('/me', auth, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Ubah password user
 * @access  Private
 */
router.put('/change-password', auth, authController.changePassword);

module.exports = router;