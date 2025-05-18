import express from 'express';
const router = express.Router();
import { changePassword, getCurrentUser, login, logout, refreshToken, register } from '../controllers/authController.js'; 
import auth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

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
router.post('/register', registerLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user dan dapatkan token
 * @access  Public
 */
router.post('/login', loginLimiter, login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token menggunakan refresh token
 * @access  Public (with refresh token)
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user dan invalidate refresh token
 * @access  Private
 */
router.post('/logout', auth, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Dapatkan info user yang sedang login
 * @access  Private
 */
router.get('/me', auth, getCurrentUser);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Ubah password user
 * @access  Private
 */
router.put('/change-password', auth, changePassword);

export default router;