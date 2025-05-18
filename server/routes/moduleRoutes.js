import express from 'express';
import { Module, Course } from '../models/index.js';
import auth from '../middleware/auth.js';
import { addLesson, deleteModule, getModuleById, getModuleLessons, reorderModule, updateModule } from '../controllers/moduleController.js';

const router = express.Router();

/**
 * Middleware khusus untuk cek kepemilikan modul oleh instructor
 * Lebih kompleks karena perlu cek instructor_id di tabel Course
 */
const moduleOwnershipCheck = async (req, res, next) => {
  try {
    // Admin selalu memiliki akses
    if (req.user.role === 'admin') {
      return next();
    }

    const moduleId = req.params.id;
    
    if (!moduleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parameter id tidak ditemukan' 
      });
    }

    // Ambil modul beserta course-nya
    const module = await Module.findByPk(moduleId, {
      include: [{ model: Course, as: 'course' }]
    });
    
    if (!module) {
      return res.status(404).json({ 
        success: false, 
        message: 'Modul tidak ditemukan' 
      });
    }

    // Cek apakah user adalah instructor dari course
    if (module.course.instructor_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak. Anda bukan instructor dari course ini' 
      });
    }

    // Tambahkan module ke request
    req.module = module;
    
    next();
  } catch (error) {
    console.error('Module ownership check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/modules/:id
 * @desc    Dapatkan detail modul
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id', auth, getModuleById);

/**
 * @route   PUT /api/modules/:id
 * @desc    Update modul
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id', auth, moduleOwnershipCheck, updateModule);

/**
 * @route   DELETE /api/modules/:id
 * @desc    Hapus modul
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.delete('/:id', auth, moduleOwnershipCheck, deleteModule);

/**
 * @route   POST /api/modules/:id/lessons
 * @desc    Tambah materi pembelajaran ke modul
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.post('/:id/lessons', auth, moduleOwnershipCheck, addLesson);

/**
 * @route   PUT /api/modules/:id/reorder
 * @desc    Ubah urutan modul dalam course
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id/reorder', auth, moduleOwnershipCheck, reorderModule);

/**
 * @route   GET /api/modules/:id/lessons
 * @desc    Dapatkan semua materi pembelajaran dalam modul
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id/lessons', auth, getModuleLessons);

export default router;