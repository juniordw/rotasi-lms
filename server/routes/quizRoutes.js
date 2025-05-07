import express from 'express';
import { addQuestion, getQuizById, getQuizResults, gradeEssay, submitQuiz, updateQuiz } from '../controllers/quizController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/quizzes/:id
 * @desc    Dapatkan detail quiz
 * @access  Private (Enrolled User, Instructor, Admin)
 */
router.get('/:id', auth, getQuizById);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update quiz
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id', auth, updateQuiz);

/**
 * @route   POST /api/quizzes/:id/questions
 * @desc    Tambah pertanyaan ke quiz
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.post('/:id/questions', auth, addQuestion);

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Kirim jawaban quiz
 * @access  Private (Student yang enroll)
 */
router.post('/:id/submit', auth, submitQuiz);

/**
 * @route   PUT /api/quizzes/:id/grade
 * @desc    Nilai jawaban essay
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.put('/:id/grade', auth, gradeEssay);

/**
 * @route   GET /api/quizzes/:id/results
 * @desc    Dapatkan hasil quiz untuk semua user
 * @access  Private (Instructor yang membuat course, Admin)
 */
router.get('/:id/results', auth, getQuizResults);

export default router;