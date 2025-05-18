import express from 'express';
const router = express.Router();
import * as courseController from '../controllers/courseController.js';
import auth from '../middleware/auth.js';
import roleAuth from '../middleware/roleAuth.js';
import ownershipCheck from '../middleware/ownershipCheck.js';
import { Course } from '../models/index.js';

/**
 * @route   GET /api/courses
 * @desc    Dapatkan semua kursus yang dipublish
 * @access  Public
 */
router.get('/', courseController.getAllPublishedCourses);

/**
 * @route   GET /api/courses/all
 * @desc    Dapatkan semua kursus (termasuk draft)
 * @access  Private (Admin, Instructor)
 */
router.get('/all', auth, roleAuth('admin', 'instructor'), courseController.getAllCourses);

/**
 * @route   GET /api/courses/my-courses
 * @desc    Dapatkan kursus yang dibuat oleh instructor
 * @access  Private (Instructor)
 */
router.get('/my-courses', auth, roleAuth('instructor'), courseController.getInstructorCourses);

/**
 * @route   GET /api/courses/enrolled
 * @desc    Dapatkan kursus yang diikuti oleh user
 * @access  Private
 */
router.get('/enrolled', auth, courseController.getEnrolledCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Dapatkan detail kursus berdasarkan ID
 * @access  Public untuk kursus published, Private untuk draft
 */
router.get('/:id', courseController.getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Buat kursus baru
 * @access  Private (Admin, Instructor)
 */
router.post('/', auth, roleAuth('admin', 'instructor'), courseController.createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update kursus
 * @access  Private (Admin, Instructor yang membuat kursus)
 */
router.put('/:id', 
  auth, 
  roleAuth('admin', 'instructor'), 
  ownershipCheck(Course, 'id', 'instructor_id'),
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Hapus kursus
 * @access  Private (Admin saja)
 */
router.delete('/:id', auth, roleAuth('admin'), courseController.deleteCourse);

/**
 * @route   POST /api/courses/:id/publish
 * @desc    Publish kursus
 * @access  Private (Admin, Instructor yang membuat kursus)
 */
router.post('/:id/publish', 
  auth, 
  roleAuth('admin', 'instructor'), 
  ownershipCheck(Course, 'id', 'instructor_id'),
  courseController.publishCourse
);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll user ke kursus
 * @access  Private
 */
router.post('/:id/enroll', auth, courseController.enrollCourse);

/**
 * @route   GET /api/courses/:id/modules
 * @desc    Dapatkan semua modul dari kursus
 * @access  Private (Enrolled User)
 */
router.get('/:id/modules', auth, courseController.getCourseModules);

/**
 * @route   POST /api/courses/:id/modules
 * @desc    Tambah modul ke kursus
 * @access  Private (Admin, Instructor yang membuat kursus)
 */
router.post('/:id/modules', 
  auth, 
  roleAuth('admin', 'instructor'), 
  ownershipCheck(Course, 'id', 'instructor_id'),
  courseController.addModule
);

/**
 * @route   GET /api/courses/:id/students
 * @desc    Dapatkan semua siswa yang terdaftar di kursus
 * @access  Private (Admin, Instructor yang membuat kursus)
 */
router.get('/:id/students', 
  auth, 
  roleAuth('admin', 'instructor'), 
  ownershipCheck(Course, 'id', 'instructor_id'),
  courseController.getCourseStudents
);

/**
 * @route   POST /api/courses/:id/certificate
 * @desc    Generate sertifikat untuk user yang telah menyelesaikan kursus
 * @access  Private
 */
router.post('/:id/certificate', auth, courseController.generateCertificate);

export default router;