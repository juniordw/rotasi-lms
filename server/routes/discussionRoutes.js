import express from 'express';
import auth from '../middleware/auth.js';
import { addComment, createDiscussion, getCourseDiscussions, getDiscussionById, getLessonDiscussions } from '../controllers/discussionController.js';
const router = express.Router();


/**
 * @route   GET /api/discussions/course/:courseId
 * @desc    Dapatkan semua diskusi dalam kursus
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/course/:courseId', auth, getCourseDiscussions);

/**
 * @route   GET /api/discussions/lesson/:lessonId
 * @desc    Dapatkan semua diskusi dalam lesson
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/lesson/:lessonId', auth, getLessonDiscussions);

/**
 * @route   GET /api/discussions/:id
 * @desc    Dapatkan detail diskusi dengan komentar
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id', auth, getDiscussionById);

/**
 * @route   POST /api/discussions
 * @desc    Buat diskusi baru
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.post('/', auth, createDiscussion);

/**
 * @route   POST /api/discussions/:id/comments
 * @desc    Tambah komentar ke diskusi
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.post('/:id/comments', auth, addComment);

export default router;