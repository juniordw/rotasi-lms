const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Dapatkan semua notifikasi user
 * @access  Private
 */
router.get('/', auth, notificationController.getUserNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Tandai notifikasi sebagai telah dibaca
 * @access  Private
 */
router.put('/:id/read', auth, notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Tandai semua notifikasi sebagai telah dibaca
 * @access  Private
 */
router.put('/read-all', auth, notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Hapus notifikasi
 * @access  Private
 */
router.delete('/:id', auth, notificationController.deleteNotification);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Dapatkan jumlah notifikasi yang belum dibaca
 * @access  Private
 */
router.get('/unread-count', auth, notificationController.getUnreadCount);

module.exports = router;