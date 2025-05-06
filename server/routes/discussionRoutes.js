import express from 'express';
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @route   GET /api/discussions/course/:courseId
 * @desc    Dapatkan semua diskusi dalam kursus
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/course/:courseId', auth, discussionController.getCourseDiscussions);

/**
 * @route   GET /api/discussions/lesson/:lessonId
 * @desc    Dapatkan semua diskusi dalam lesson
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/lesson/:lessonId', auth, discussionController.getLessonDiscussions);

/**
 * @route   GET /api/discussions/:id
 * @desc    Dapatkan detail diskusi dengan komentar
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id', auth, discussionController.getDiscussionById);

/**
 * @route   POST /api/discussions
 * @desc    Buat diskusi baru
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.post('/', auth, discussionController.createDiscussion);

/**
 * @route   POST /api/discussions/:id/comments
 * @desc    Tambah komentar ke diskusi
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.post('/:id/comments', auth, discussionController.addComment);

export default discussionRoutes;
