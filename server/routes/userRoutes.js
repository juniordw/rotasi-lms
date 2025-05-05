const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const upload = require('../middleware/upload'); // Middleware untuk upload file

/**
 * @route   GET /api/users
 * @desc    Dapatkan semua users (dengan paginasi dan filter)
 * @access  Private (Admin only)
 */
router.get('/', auth, roleAuth('admin'), userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Dapatkan detail user berdasarkan ID
 * @access  Private (Admin or same user)
 */
router.get('/:id', auth, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update data user
 * @access  Private (Admin or same user)
 */
router.put('/:id', auth, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Hapus user
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth('admin'), userController.deleteUser);

/**
 * @route   POST /api/users/:id/change-role
 * @desc    Ubah role user
 * @access  Private (Admin only)
 */
router.post('/:id/change-role', auth, roleAuth('admin'), userController.changeUserRole);

/**
 * @route   PUT /api/users/profile
 * @desc    Update profile user sendiri
 * @access  Private
 */
router.put('/profile', auth, userController.updateProfile);

/**
 * @route   POST /api/users/profile/avatar
 * @desc    Upload avatar profil
 * @access  Private
 */
router.post('/profile/avatar', auth, upload.single('avatar'), userController.uploadAvatar);

/**
 * @route   GET /api/users/profile/certificates
 * @desc    Dapatkan semua sertifikat user
 * @access  Private
 */
router.get('/profile/certificates', auth, userController.getUserCertificates);

/**
 * @route   GET /api/users/stats/dashboard
 * @desc    Dapatkan statistik user untuk dashboard
 * @access  Private
 */
router.get('/stats/dashboard', auth, userController.getUserDashboardStats);

module.exports = router;