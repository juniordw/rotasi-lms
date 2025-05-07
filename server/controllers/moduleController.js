import { Module, Lesson, Quiz, Course, Enrollment, Progress } from '../models/index.js';

/**
 * @desc    Dapatkan detail modul
 * @route   GET /api/modules/:id
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getModuleById = async (req, res) => {
  try {
    const moduleId = req.params.id;
    
    // Get module with lessons
    const module = await Module.findByPk(moduleId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructor_id', 'status']
        },
        {
          model: Lesson,
          as: 'lessons',
          order: [['order_number', 'ASC']]
        }
      ]
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    const userId = req.user.id;
    const course = module.course;
    
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
      }
    }
    
    res.json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Get module by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update modul
 * @route   PUT /api/modules/:id
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const updateModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Judul modul wajib diisi'
      });
    }
    
    // Check if module exists and get course info for authorization
    const existingModule = await Module.findByPk(moduleId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'instructor_id']
        }
      ]
    });
    
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    // Check authorization
    const userId = req.user.id;
    if (existingModule.course.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah modul ini'
      });
    }
    
    // Update module
    const [updated] = await Module.update(
      {
        title,
        description,
        updated_at: new Date()
      },
      {
        where: { id: moduleId }
      }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    // Get updated module
    const module = await Module.findByPk(moduleId);
    
    res.json({
      success: true,
      message: 'Modul berhasil diupdate',
      data: module
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Hapus modul
 * @route   DELETE /api/modules/:id
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    
    // Check if module exists and get course info for authorization
    const existingModule = await Module.findByPk(moduleId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'instructor_id']
        }
      ]
    });
    
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    // Check authorization
    const userId = req.user.id;
    if (existingModule.course.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk menghapus modul ini'
      });
    }
    
    // Cek apakah ada lesson di modul ini
    const lessonCount = await Lesson.count({
      where: { module_id: moduleId }
    });
    
    if (lessonCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Modul tidak dapat dihapus karena masih memiliki materi pembelajaran'
      });
    }
    
    // Delete module
    const deleted = await Module.destroy({
      where: { id: moduleId }
    });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Modul berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Tambah materi pembelajaran ke modul
 * @route   POST /api/modules/:id/lessons
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const addLesson = async (req, res) => {
  try {
    const moduleId = req.params.id;
    
    // Check if module exists and get course info for authorization
    const existingModule = await Module.findByPk(moduleId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'instructor_id']
        }
      ]
    });
    
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    // Check authorization
    const userId = req.user.id;
    if (existingModule.course.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk menambah materi ke modul ini'
      });
    }
    
    // Validasi input
    const { 
      title, 
      content_type, 
      content_url, 
      content_text, 
      duration_minutes,
      is_required
    } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Judul materi wajib diisi'
      });
    }
    
    if (!content_type) {
      return res.status(400).json({
        success: false,
        message: 'Tipe konten wajib diisi'
      });
    }
    
    // Validasi tipe konten
    const validTypes = ['video', 'document', 'quiz', 'article', 'presentation', 'link'];
    if (!validTypes.includes(content_type)) {
      return res.status(400).json({
        success: false,
        message: `Tipe konten tidak valid. Tipe yang diizinkan: ${validTypes.join(', ')}`
      });
    }
    
    // Validasi konten berdasarkan tipe
    if (content_type !== 'article' && !content_url) {
      return res.status(400).json({
        success: false,
        message: 'URL konten wajib diisi untuk tipe konten ini'
      });
    }
    
    if (content_type === 'article' && !content_text) {
      return res.status(400).json({
        success: false,
        message: 'Teks konten wajib diisi untuk tipe artikel'
      });
    }
    
    // Dapatkan urutan terakhir lesson dalam modul
    const lastLesson = await Lesson.findOne({
      where: { module_id: moduleId },
      order: [['order_number', 'DESC']]
    });
    
    const orderNumber = lastLesson ? lastLesson.order_number + 1 : 1;
    
    // Buat lesson baru
    const lesson = await Lesson.create({
      module_id: moduleId,
      title,
      content_type,
      content_url,
      content_text,
      duration_minutes: duration_minutes || 0,
      is_required: is_required !== false, // Default true
      order_number: orderNumber,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Jika tipe konten adalah quiz, buat quiz kosong
    if (content_type === 'quiz') {
      await Quiz.create({
        lesson_id: lesson.id,
        title: `Quiz - ${title}`,
        passing_score: 70,
        time_limit_minutes: 30
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Materi pembelajaran berhasil ditambahkan',
      data: lesson
    });
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Ubah urutan modul dalam course
 * @route   PUT /api/modules/:id/reorder
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const reorderModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const { new_order } = req.body;
    
    if (new_order === undefined || new_order < 1) {
      return res.status(400).json({
        success: false,
        message: 'Urutan baru tidak valid'
      });
    }
    
    // Get module with course info for authorization
    const module = await Module.findByPk(moduleId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'instructor_id']
        }
      ]
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    // Check authorization
    const userId = req.user.id;
    if (module.course.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah urutan modul ini'
      });
    }
    
    // Get course modules
    const modules = await Module.findAll({
      where: { course_id: module.course_id },
      order: [['order_number', 'ASC']]
    });
    
    if (new_order > modules.length) {
      return res.status(400).json({
        success: false,
        message: `Urutan baru tidak valid. Maksimal: ${modules.length}`
      });
    }
    
    const oldOrder = module.order_number;
    
    // Don't reorder if the position is the same
    if (oldOrder === new_order) {
      return res.json({
        success: true,
        message: 'Urutan modul tidak berubah'
      });
    }
    
    // Reorder modules
    if (oldOrder < new_order) {
      // Moving down: update modules between old and new order
      for (const mod of modules) {
        if (mod.id === moduleId) {
          await mod.update({ order_number: new_order });
        } else if (mod.order_number > oldOrder && mod.order_number <= new_order) {
          await mod.update({ order_number: mod.order_number - 1 });
        }
      }
    } else if (oldOrder > new_order) {
      // Moving up: update modules between new and old order
      for (const mod of modules) {
        if (mod.id === moduleId) {
          await mod.update({ order_number: new_order });
        } else if (mod.order_number >= new_order && mod.order_number < oldOrder) {
          await mod.update({ order_number: mod.order_number + 1 });
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Urutan modul berhasil diubah'
    });
  } catch (error) {
    console.error('Reorder module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Dapatkan semua materi pembelajaran dalam modul
 * @route   GET /api/modules/:id/lessons
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getModuleLessons = async (req, res) => {
  try {
    const moduleId = req.params.id;
    
    // Get module
    const module = await Module.findByPk(moduleId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructor_id', 'status']
        }
      ]
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Modul tidak ditemukan'
      });
    }
    
    const userId = req.user.id;
    const course = module.course;
    
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
      }
    }
    
    // Get lessons
    const lessons = await Lesson.findAll({
      where: { module_id: moduleId },
      order: [['order_number', 'ASC']]
    });
    
    // Jika user adalah student yang enroll, tambahkan data progress
    if (req.user.role === 'student') {
      // Dapatkan enrollment
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: course.id
        }
      });
      
      if (enrollment) {
        // Dapatkan semua progress untuk enrollment ini
        const progresses = await Progress.findAll({
          where: { 
            enrollment_id: enrollment.id,
            lesson_id: lessons.map(lesson => lesson.id)
          }
        });
        
        // Map progress ke lesson
        const progressMap = new Map();
        for (const progress of progresses) {
          progressMap.set(progress.lesson_id, progress);
        }
        
        // Tambahkan data progress ke setiap lesson
        for (const lesson of lessons) {
          const progress = progressMap.get(lesson.id);
          
          if (progress) {
            lesson.dataValues.progress = {
              status: progress.status,
              last_accessed: progress.last_accessed,
              time_spent_minutes: progress.time_spent_minutes
            };
          } else {
            lesson.dataValues.progress = {
              status: 'not_started',
              last_accessed: null,
              time_spent_minutes: 0
            };
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Get module lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};