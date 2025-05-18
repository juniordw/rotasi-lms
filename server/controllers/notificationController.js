import { Notification, User } from '../models/index.js';

/**
 * @desc    Dapatkan semua notifikasi user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const is_read = req.query.is_read;
    
    // Filter options
    const whereOptions = {
      user_id: userId
    };
    
    if (is_read !== undefined) {
      whereOptions.is_read = is_read === 'true';
    }
    
    // Get notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereOptions,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    // Get unread count
    const unreadCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          totalNotifications: count,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Tandai notifikasi sebagai telah dibaca
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Get notification
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }
    
    // Cek kepemilikan
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }
    
    // Update notifikasi
    await notification.update({
      is_read: true
    });
    
    res.json({
      success: true,
      message: 'Notifikasi berhasil ditandai sebagai telah dibaca',
      data: notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Tandai semua notifikasi sebagai telah dibaca
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update semua notifikasi yang belum dibaca
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
    
    res.json({
      success: true,
      message: 'Semua notifikasi berhasil ditandai sebagai telah dibaca'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Hapus notifikasi
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Get notification
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }
    
    // Cek kepemilikan
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }
    
    // Hapus notifikasi
    await notification.destroy();
    
    res.json({
      success: true,
      message: 'Notifikasi berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Dapatkan jumlah notifikasi yang belum dibaca
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get unread count
    const unreadCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });
    
    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};