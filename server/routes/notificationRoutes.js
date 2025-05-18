import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { deleteNotification, getUnreadCount, getUserNotifications, markAllAsRead, markAsRead } from '../controllers/notificationController.js';

/**
 * @route   GET /api/notifications
 * @desc    Dapatkan semua notifikasi user
 * @access  Private
 */
router.get('/', auth, getUserNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Tandai notifikasi sebagai telah dibaca
 * @access  Private
 */
router.put('/:id/read', auth, markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Tandai semua notifikasi sebagai telah dibaca
 * @access  Private
 */
router.put('/read-all', auth, markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Hapus notifikasi
 * @access  Private
 */
router.delete('/:id', auth, deleteNotification);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Dapatkan jumlah notifikasi yang belum dibaca
 * @access  Private
 */
router.get('/unread-count', auth, getUnreadCount);

export default router;