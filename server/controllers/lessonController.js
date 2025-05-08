import { Lesson, Module, Course, Enrollment, Progress, Quiz, Question, Notification } from '../models/index.js';
import { validateLesson } from '../utils/validators.js';
import { Op } from 'sequelize';

/**
 * @desc    Dapatkan detail materi pembelajaran
 * @route   GET /api/lessons/:id
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getLessonById = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    // Get lesson with module and course
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Module,
          as: 'module',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title', 'instructor_id', 'status']
            }
          ]
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'passing_score', 'time_limit_minutes']
        }
      ]
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Materi pembelajaran tidak ditemukan'
      });
    }
    
    const userId = req.user.id;
    const course = lesson.module.course;
    
    // Cek akses: jika kursus draft, hanya instructor atau admin yang bisa melihat
    if (course.status === 'draft') {
      if (course.instructor_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Kursus belum dipublish'
        });
      }
    } else {
      // Jika kursus published, cek apakah user sudah enroll (kecuali instructor atau admin)
      if (course.instructor_id !== userId && req.user.role !== 'admin') {
        const enrollment = await Enrollment.findOne({
          where: {
            user_id: userId,
            course_id: course.id
          }
        });
        
        if (!enrollment) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda belum terdaftar di kursus ini'
          });
        }
        
        // Jika user adalah student, update progress
        if (req.user.role === 'student') {
          // Cek apakah sudah ada progress berdasarkan user_id, course_id, dan lesson_id
          let progress = await Progress.findOne({
            where: {
              user_id: userId,
              course_id: course.id,
              lesson_id: lessonId
            }
          });
          
          if (progress) {
            // Update last_accessed
            await progress.update({
              last_accessed: new Date(),
              status: progress.status === 'not_started' ? 'in_progress' : progress.status
            });
          } else {
            // Buat progress baru
            progress = await Progress.create({
              user_id: userId,
              course_id: course.id,
              lesson_id: lessonId,
              status: 'in_progress',
              last_accessed: new Date(),
              time_spent_minutes: 0
            });
          }
          
          // Tambahkan data progress ke response
          lesson.dataValues.progress = {
            status: progress.status,
            last_accessed: progress.last_accessed,
            time_spent_minutes: progress.time_spent_minutes
          };
        }
      }
    }
    
    // Jika tipe konten adalah quiz, tambahkan jumlah pertanyaan
    if (lesson.content_type === 'quiz' && lesson.quiz) {
      const questionCount = await Question.count({
        where: { quiz_id: lesson.quiz.id }
      });
      
      lesson.quiz.dataValues.questionCount = questionCount;
    }
    
    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Get lesson by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update materi pembelajaran
 * @route   PUT /api/lessons/:id
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    // Validasi input
    const { error } = validateLesson(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const {
      title,
      content_type,
      content_url,
      content_text,
      duration_minutes,
      is_required
    } = req.body;
    
    // Get lesson
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Module,
          as: 'module',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['instructor_id']
            }
          ]
        }
      ]
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Materi pembelajaran tidak ditemukan'
      });
    }
    
    // Cek kepemilikan (sudah dicek di middleware, ini hanya untuk keamanan tambahan)
    const instructorId = lesson.module.course.instructor_id;
    if (instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan instructor dari kursus ini'
      });
    }
    
    // Update lesson
    await lesson.update({
      title,
      content_type,
      content_url,
      content_text,
      duration_minutes,
      is_required,
      updated_at: new Date()
    });
    
    // Jika tipe konten berubah menjadi quiz, buat quiz baru jika belum ada
    if (content_type === 'quiz') {
      const existingQuiz = await Quiz.findOne({
        where: { lesson_id: lessonId }
      });
      
      if (!existingQuiz) {
        await Quiz.create({
          lesson_id: lessonId,
          title: `Quiz - ${title}`,
          passing_score: 70,
          time_limit_minutes: 30
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Materi pembelajaran berhasil diupdate',
      data: lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Hapus materi pembelajaran
 * @route   DELETE /api/lessons/:id
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    // Get lesson
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Module,
          as: 'module',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['instructor_id']
            }
          ]
        }
      ]
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Materi pembelajaran tidak ditemukan'
      });
    }
    
    // Cek kepemilikan (sudah dicek di middleware, ini hanya untuk keamanan tambahan)
    const instructorId = lesson.module.course.instructor_id;
    if (instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan instructor dari kursus ini'
      });
    }
    
    // Cek apakah ada progress untuk lesson ini
    const progressCount = await Progress.count({
      where: { lesson_id: lessonId }
    });
    
    if (progressCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Materi pembelajaran tidak dapat dihapus karena sudah ada kemajuan belajar'
      });
    }
    
    // Hapus quiz terkait jika ada
    await Quiz.destroy({
      where: { lesson_id: lessonId }
    });
    
    // Hapus lesson
    await lesson.destroy();
    
    res.json({
      success: true,
      message: 'Materi pembelajaran berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Ubah urutan materi pembelajaran dalam modul
 * @route   PUT /api/lessons/:id/reorder
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const reorderLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const { new_order } = req.body;
    
    if (new_order === undefined || new_order < 1) {
      return res.status(400).json({
        success: false,
        message: 'Urutan baru tidak valid'
      });
    }
    
    // Get lesson
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Module,
          as: 'module'
        }
      ]
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Materi pembelajaran tidak ditemukan'
      });
    }
    
    // Get module lessons
    const lessons = await Lesson.findAll({
      where: { module_id: lesson.module_id },
      order: [['order_number', 'ASC']]
    });
    
    if (new_order > lessons.length) {
      return res.status(400).json({
        success: false,
        message: `Urutan baru tidak valid. Maksimal: ${lessons.length}`
      });
    }
    
    const oldOrder = lesson.order_number;
    
    // Reorder lessons
    if (oldOrder < new_order) {
      // Moving down: update lessons between old and new order
      for (const les of lessons) {
        if (les.id === lessonId) {
          await les.update({ order_number: new_order });
        } else if (les.order_number > oldOrder && les.order_number <= new_order) {
          await les.update({ order_number: les.order_number - 1 });
        }
      }
    } else if (oldOrder > new_order) {
      // Moving up: update lessons between new and old order
      for (const les of lessons) {
        if (les.id === lessonId) {
          await les.update({ order_number: new_order });
        } else if (les.order_number >= new_order && les.order_number < oldOrder) {
          await les.update({ order_number: les.order_number + 1 });
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Urutan materi pembelajaran berhasil diubah'
    });
  } catch (error) {
    console.error('Reorder lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Tandai materi pembelajaran selesai
 * @route   PUT /api/lessons/:id/complete
 * @access  Private (Student yang enroll)
 */
export const completeLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.id;
    const { time_spent_minutes } = req.body;
    
    // Get lesson with module and course
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Module,
          as: 'module',
          include: [
            {
              model: Course,
              as: 'course'
            }
          ]
        }
      ]
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Materi pembelajaran tidak ditemukan'
      });
    }
    
    const courseId = lesson.module.course.id;
    
    // Get enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        user_id: userId,
        course_id: courseId
      }
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda belum terdaftar di kursus ini'
      });
    }
    
    // Karena enrollment_id adalah INTEGER, kita gunakan user_id sebagai enrollment_id
    // dan kita akan memastikan course_id benar di level aplikasi
    const enrollmentId = userId; // Menggunakan user_id sebagai pengganti enrollment_id
    
    // Cek apakah progress sudah ada
    let progress = await Progress.findOne({
      where: {
        enrollment_id: enrollmentId,
        lesson_id: lessonId
      }
    });
    
    if (progress) {
      // Update existing progress
      await progress.update({
        status: 'completed',
        last_accessed: new Date(),
        time_spent_minutes: time_spent_minutes || progress.time_spent_minutes
      });
    } else {
      // Create new progress
      progress = await Progress.create({
        enrollment_id: enrollmentId,
        lesson_id: lessonId,
        status: 'completed',
        last_accessed: new Date(),
        time_spent_minutes: time_spent_minutes || 0
      });
    }
    
    // Cek apakah semua lesson dalam course sudah selesai
    const allLessonsInCourse = await Lesson.findAll({
      include: [
        {
          model: Module,
          as: 'module',
          where: { course_id: courseId },
          required: true
        }
      ]
    });
    
    const requiredLessons = allLessonsInCourse.filter(l => l.is_required);
    
    // Get completed lessons
    const completedLessons = await Progress.findAll({
      where: {
        enrollment_id: enrollmentId,
        status: 'completed',
        lesson_id: {
          [Op.in]: requiredLessons.map(l => l.id)
        }
      }
    });
    
    // Jika semua required lesson sudah selesai, update status enrollment
    if (requiredLessons.length > 0 && requiredLessons.length === completedLessons.length) {
      await enrollment.update({
        completion_status: 'completed',
        completion_date: new Date()
      });
      
      // Tambahkan notifikasi
      await Notification.create({
        user_id: userId,
        type: 'course_completed',
        message: `Selamat! Anda telah menyelesaikan kursus "${lesson.module.course.title}"`,
        is_read: false,
        created_at: new Date()
      });
    } else if (enrollment.completion_status !== 'in_progress') {
      // Update status menjadi in_progress jika belum
      await enrollment.update({
        completion_status: 'in_progress'
      });
    }
    
    res.json({
      success: true,
      message: 'Materi pembelajaran berhasil ditandai selesai',
      data: {
        progress,
        completionStatus: enrollment.completion_status
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Upload konten materi pembelajaran
 * @route   POST /api/lessons/:id/content
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const uploadContent = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    // Pastikan file terupload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload'
      });
    }
    
    // Dapatkan file path
    const contentUrl = `/uploads/lessons/${req.file.filename}`;
    
    // Update content_url lesson
    const [updated] = await Lesson.update(
      { content_url: contentUrl },
      { where: { id: lessonId } }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Materi pembelajaran tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Konten berhasil diupload',
      data: {
        content_url: contentUrl
      }
    });
  } catch (error) {
    console.error('Upload lesson content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};