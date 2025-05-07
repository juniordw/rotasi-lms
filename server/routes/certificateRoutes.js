import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import roleAuth from '../middleware/roleAuth.js';
import { generateCertificate } from '../controllers/certificateController.js';
import { getUserCertificates, getCertificateById, downloadCertificate, verifyCertificate } from '../controllers/certificateController.js';

/**
 * @route   GET /api/certificates
 * @desc    Dapatkan semua sertifikat user
 * @access  Private
 */
router.get('/', auth, getUserCertificates);

/**
 * @route   GET /api/certificates/:id
 * @desc    Dapatkan sertifikat berdasarkan ID
 * @access  Private
 */
router.get('/:id', auth, getCertificateById);

/**
 * @route   POST /api/certificates/generate
 * @desc    Generate sertifikat untuk user
 * @access  Private (Admin, Instructor)
 */
router.post('/generate', auth, roleAuth('admin', 'instructor'), generateCertificate);

/**
 * @route   GET /api/certificates/:id/download
 * @desc    Download sertifikat
 * @access  Private
 */
router.get('/:id/download', auth, downloadCertificate);

/**
 * @route   POST /api/certificates/verify
 * @desc    Verifikasi sertifikat
 * @access  Public
 */
router.post('/verify', verifyCertificate);

// authRoutes.js
const authRoutes = () => {
    // routes code here
  };

  export default router;