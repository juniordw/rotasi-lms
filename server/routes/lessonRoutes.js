const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const ownershipCheck = require('../middleware/ownershipCheck');
const { upload, handleUploadError } = require('../middleware/upload');

/**
 * @route   GET /api/lessons/:id
 * @desc    Dapatkan detail materi pembelajaran
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id', auth, lessonController.getLessonById);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update materi pembelajaran
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id', auth, lessonController.updateLesson);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Hapus materi pembelajaran
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.delete('/:id', auth, lessonController.deleteLesson);

/**
 * @route   PUT /api/lessons/:id/reorder
 * @desc    Ubah urutan materi pembelajaran dalam modul
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id/reorder', auth, lessonController.reorderLesson);

/**
 * @route   PUT /api/lessons/:id/complete
 * @desc    Tandai materi pembelajaran selesai
 * @access  Private (Student yang enroll)
 */
router.put('/:id/complete', auth, lessonController.completeLesson);

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
  lessonController.uploadContent
);

module.exports = router;