import express from 'express';
import { 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    updateProfile,
    uploadAvatar,
    getUserCertificates,
    getUserDashboardStats
  } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
const router = express.Router();
import roleAuth from '../middleware/roleAuth.js';
import { upload, handleUploadError } from '../middleware/upload.js'; // Middleware untuk upload file

/**
 * @route   GET /api/users
 * @desc    Dapatkan semua users (dengan paginasi dan filter)
 * @access  Private (Admin only)
 */
router.get('/', auth, roleAuth('admin'), getAllUsers);

/**
 * @route   GET /api/users/stats/dashboard
 * @desc    Dapatkan statistik user untuk dashboard
 * @access  Private
 */
router.get('/stats/dashboard', auth, getUserDashboardStats);

/**
 * @route   PUT /api/users/profile
 * @desc    Update profile user sendiri
 * @access  Private
 */
router.put('/profile', auth, updateProfile);

/**
 * @route   POST /api/users/profile/avatar
 * @desc    Upload avatar profil
 * @access  Private
 */
router.post('/profile/avatar', auth, upload.single('avatar'), handleUploadError, uploadAvatar);

/**
 * @route   GET /api/users/profile/certificates
 * @desc    Dapatkan semua sertifikat user
 * @access  Private
 */
router.get('/profile/certificates', auth, getUserCertificates);

/**
 * @route   GET /api/users/:id
 * @desc    Dapatkan detail user berdasarkan ID
 * @access  Private (Admin or same user)
 */
router.get('/:id', auth, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update data user
 * @access  Private (Admin or same user)
 */
router.put('/:id', auth, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Hapus user
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth('admin'), deleteUser);

/**
 * @route   POST /api/users/:id/change-role
 * @desc    Ubah role user
 * @access  Private (Admin only)
 */
router.post('/:id/change-role', auth, roleAuth('admin'), changeUserRole);

export default router;