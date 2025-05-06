import express from 'express';
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @route   GET /api/quizzes/:id
 * @desc    Dapatkan detail quiz
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id', auth, quizController.getQuizById);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update quiz
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id', auth, quizController.updateQuiz);

/**
 * @route   POST /api/quizzes/:id/questions
 * @desc    Tambah pertanyaan ke quiz
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.post('/:id/questions', auth, quizController.addQuestion);

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Kirim jawaban quiz
 * @access  Private (Student yang enroll)
 */
router.post('/:id/submit', auth, quizController.submitQuiz);

/**
 * @route   PUT /api/quizzes/:id/grade
 * @desc    Nilai jawaban essay
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id/grade', auth, quizController.gradeEssay);

/**
 * @route   GET /api/quizzes/:id/results
 * @desc    Dapatkan hasil quiz untuk semua user
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.get('/:id/results', auth, quizController.getQuizResults);

export default quizRoutes;