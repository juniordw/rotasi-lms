import express from 'express';
import { upload, handleUploadError } from '../middleware/upload.js';
import { 
  completeLesson, 
  deleteLesson, 
  getLessonById, 
  reorderLesson, 
  updateLesson, 
  uploadContent 
} from '../controllers/lessonController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/lessons/:id
 * @desc    Dapatkan detail materi pembelajaran
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id', auth, getLessonById);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update materi pembelajaran
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id', auth, updateLesson);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Hapus materi pembelajaran
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.delete('/:id', auth, deleteLesson);

/**
 * @route   PUT /api/lessons/:id/reorder
 * @desc    Ubah urutan materi pembelajaran dalam modul
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id/reorder', auth, reorderLesson);

/**
 * @route   PUT /api/lessons/:id/complete
 * @desc    Tandai materi pembelajaran selesai
 * @access  Private (Student yang enroll)
 */
router.put('/:id/complete', auth, completeLesson);

/**
 * @route   POST /api/lessons/:id/content
 * @desc    Upload konten materi pembelajaran
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.post(
  '/:id/content',
  auth,
  upload.single('lesson_content'),
  handleUploadError,
  uploadContent
);

export default router;