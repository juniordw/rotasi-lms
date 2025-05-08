import db from "../models/index.js";
const { Course, Module, Lesson, Enrollment, User, Category, Progress, Notification, Certificate } = db;
import { Op } from 'sequelize';
import { validateCourse } from '../utils/validators.js';

/**
 * @desc    Mendapatkan semua kursus yang dipublish
 * @route   GET /api/courses
 * @access  Public
 */
export const getAllPublishedCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || null;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    
    // Filter options
    const whereOptions = {
      status: 'published',
      ...(search && {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      }),
      ...(category && { category_id: category })
    };
    
    // Get courses with pagination
    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereOptions,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'full_name', 'avatar_url']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          totalCourses: count,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all published courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mendapatkan semua kursus (termasuk draft)
 * @route   GET /api/courses/all
 * @access  Private (Admin, Instructor)
 */
export const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || null;
    const category = req.query.category || null;
    
    // Filter options
    const whereOptions = {
      ...(search && {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      }),
      ...(status && { status }),
      ...(category && { category_id: category })
    };
    
    // Admin dapat melihat semua kursus, instructor hanya melihat kursusnya
    if (req.user.role === 'instructor') {
      whereOptions.instructor_id = req.user.id;
    }
    
    // Get courses with pagination
    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereOptions,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'full_name', 'avatar_url']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          totalCourses: count,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mendapatkan kursus yang dibuat oleh instructor
 * @route   GET /api/courses/my-courses
 * @access  Private (Instructor)
 */
export const getInstructorCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || null;
    
    // Filter options
    const whereOptions = {
      instructor_id: req.user.id,
      ...(search && {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      }),
      ...(status && { status })
    };
    
    // Get instructor courses with pagination
    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereOptions,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    // Get enrollment stats for each course
    for (let course of courses) {
      const enrollmentCount = await Enrollment.count({
        where: { course_id: course.id }
      });
      
      course.dataValues.enrollmentCount = enrollmentCount;
      
      // Get course completion percentage
      if (enrollmentCount > 0) {
        const completedCount = await Enrollment.count({
          where: { 
            course_id: course.id,
            completion_status: 'completed'
          }
        });
        
        course.dataValues.completionRate = Math.round((completedCount / enrollmentCount) * 100);
      } else {
        course.dataValues.completionRate = 0;
      }
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          totalCourses: count,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mendapatkan kursus yang diikuti oleh user
 * @route   GET /api/courses/enrolled
 * @access  Private
 */
export const getEnrolledCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || null; // 'not_started', 'in_progress', 'completed'
    
    // Filter options for enrollments
    const enrollmentWhereOptions = {
      user_id: req.user.id,
      ...(status && { completion_status: status })
    };
    
    // Filter options for courses
    const courseWhereOptions = {
      ...(search && {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      })
    };
    
    // Get enrolled courses with pagination
    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: enrollmentWhereOptions,
      include: [
        {
          model: Course,
          as: 'course',
          where: courseWhereOptions,
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'full_name', 'avatar_url']
            },
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['enrollment_date', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    // Get progress for each enrollment
    for (let enrollment of enrollments) {
      // Get total lessons in course
      const totalLessons = await Lesson.count({
        include: [
          {
            model: Module,
            as: 'module',
            where: { course_id: enrollment.course_id }
          }
        ]
      });
      
      // Get completed lessons
      const completedLessons = await Progress.count({
        where: {
          enrollment_id: enrollment.id,
          status: 'completed'
        }
      });
      
      enrollment.dataValues.progress = {
        totalLessons,
        completedLessons,
        progressPercentage: totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0
      };
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          totalEnrollments: count,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mendapatkan detail kursus berdasarkan ID
 * @route   GET /api/courses/:id
 * @access  Public untuk kursus published, Private untuk draft
 */
export const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Get course with details
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'full_name', 'avatar_url']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Module,
          as: 'modules',
          attributes: ['id', 'title', 'description', 'order_number'],
          order: [['order_number', 'ASC']],
          include: [
            {
              model: Lesson,
              as: 'lessons',
              attributes: ['id', 'title', 'content_type', 'duration_minutes', 'order_number'],
              order: [['order_number', 'ASC']]
            }
          ]
        }
      ]
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kursus tidak ditemukan'
      });
    }
    
    // Jika kursus draft, hanya instructor yang membuat atau admin yang bisa melihat
    if (course.status === 'draft') {
      // Cek apakah user authenticated
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Kursus belum dipublish'
        });
      }
      
      // Cek apakah user adalah instructor yang membuat atau admin
      if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Kursus belum dipublish'
        });
      }
    }
    
    // Get enrollment status jika user authenticated
    let enrollmentStatus = null;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: req.user.id,
          course_id: courseId
        }
      });
      
      if (enrollment) {
        enrollmentStatus = {
          enrolled: true,
          enrollmentId: enrollment.id,
          status: enrollment.completion_status,
          enrollmentDate: enrollment.enrollment_date,
          completionDate: enrollment.completion_date,
          score: enrollment.score
        };
      } else {
        enrollmentStatus = {
          enrolled: false
        };
      }
    }
    
    // Add enrollment count
    const enrollmentCount = await Enrollment.count({
      where: { course_id: courseId }
    });
    
    // Add enrollment status and count to course data
    course.dataValues.enrollmentStatus = enrollmentStatus;
    course.dataValues.enrollmentCount = enrollmentCount;
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Buat kursus baru
 * @route   POST /api/courses
 * @access  Private (Admin, Instructor)
 */
export const createCourse = async (req, res) => {
  try {
    // Validasi input
    const { error } = validateCourse(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { title, description, category_id, thumbnail_url, level } = req.body;
    
    // Create course
    const course = await Course.create({
      title,
      description,
      instructor_id: req.user.id,
      category_id,
      thumbnail_url,
      level,
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Kursus berhasil dibuat',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update kursus
 * @route   PUT /api/courses/:id
 * @access  Private (Admin, Instructor yang membuat kursus)
 */
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Validasi input
    const { error } = validateCourse(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { 
      title, 
      description, 
      category_id, 
      thumbnail_url, 
      level, 
      duration_hours 
    } = req.body;
    
    // Update course
    const [updated] = await Course.update(
      {
        title,
        description,
        category_id,
        thumbnail_url,
        level,
        duration_hours,
        updated_at: new Date()
      },
      {
        where: { id: courseId }
      }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Kursus tidak ditemukan'
      });
    }
    
    // Get updated course
    const course = await Course.findByPk(courseId);
    
    res.json({
      success: true,
      message: 'Kursus berhasil diupdate',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Hapus kursus
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin saja)
 */
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Cek apakah ada enrollment
    const enrollmentCount = await Enrollment.count({
      where: { course_id: courseId }
    });
    
    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kursus tidak dapat dihapus karena sudah ada peserta yang mendaftar'
      });
    }
    
    // Delete course
    const deleted = await Course.destroy({
      where: { id: courseId }
    });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Kursus tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Kursus berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Publish kursus
 * @route   POST /api/courses/:id/publish
 * @access  Private (Admin, Instructor yang membuat kursus)
 */
export const publishCourse = async (req, res) => {
  try {
      const courseId = req.params.id;
      
      // Get course with modules and lessons
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: Module,
            as: 'modules',
            include: [
              {
                model: Lesson,
                as: 'lessons'
              }
            ]
          }
        ]
      });
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Kursus tidak ditemukan'
        });
      }
      
      // Validasi apakah kursus memiliki modul dan lesson
      if (!course.modules || course.modules.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Kursus tidak dapat dipublish karena tidak memiliki modul'
        });
      }
      
      let hasLesson = false;
      for (const module of course.modules) {
        if (module.lessons && module.lessons.length > 0) {
          hasLesson = true;
          break;
        }
      }
      
      if (!hasLesson) {
        return res.status(400).json({
          success: false,
          message: 'Kursus tidak dapat dipublish karena tidak memiliki materi pembelajaran'
        });
      }
      
      // Update course status
      await Course.update(
        {
          status: 'published',
          updated_at: new Date()
        },
        {
          where: { id: courseId }
        }
      );
      
      res.json({
        success: true,
        message: 'Kursus berhasil dipublish'
      });
    } catch (error) {
      console.error('Publish course error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * @desc    Enroll user ke kursus
   * @route   POST /api/courses/:id/enroll
   * @access  Private
   */
  export const enrollCourse = async (req, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      
      // Cek apakah kursus ada dan sudah dipublish
      const course = await Course.findByPk(courseId);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Kursus tidak ditemukan'
        });
      }
      
      if (course.status !== 'published') {
        return res.status(400).json({
          success: false,
          message: 'Kursus belum dipublish'
        });
      }
      
      // Cek apakah user sudah enroll ke kursus ini
      const existingEnrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId
        }
      });
      
      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah terdaftar di kursus ini'
        });
      }
      
      // Buat enrollment baru
      const enrollment = await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        enrollment_date: new Date(),
        completion_status: 'not_started',
        completion_date: null,
        score: null
      });
      
      // Tambahkan notifikasi untuk user
      await Notification.create({
        user_id: userId,
        type: 'enrollment',
        message: `Anda telah berhasil mendaftar di kursus "${course.title}"`,
        is_read: false,
        created_at: new Date()
      });
      
      // Tambahkan notifikasi untuk instructor
      await Notification.create({
        user_id: course.instructor_id,
        type: 'new_student',
        message: `Pengguna baru telah mendaftar di kursus "${course.title}"`,
        is_read: false,
        created_at: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Berhasil mendaftar ke kursus',
        data: enrollment
      });
    } catch (error) {
      console.error('Enroll course error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * @desc    Dapatkan semua modul dari kursus
   * @route   GET /api/courses/:id/modules
   * @access  Private (Enrolled User)
   */
  export const getCourseModules = async (req, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      
      // Cek apakah kursus ada
      const course = await Course.findByPk(courseId);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Kursus tidak ditemukan'
        });
      }
      
      // Jika kursus draft, hanya instructor yang membuat atau admin yang bisa melihat
      if (course.status === 'draft') {
        if (course.instructor_id !== userId && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Kursus belum dipublish'
          });
        }
      } else {
        // Cek apakah user sudah enroll ke kursus ini (kecuali instructor atau admin)
        if (course.instructor_id !== userId && req.user.role !== 'admin') {
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
        }
      }
      
      // Dapatkan semua modul dan lesson dalam kursus
      const modules = await Module.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id', 'title', 'content_type', 'duration_minutes', 'order_number'],
            order: [['order_number', 'ASC']]
          }
        ],
        order: [['order_number', 'ASC']]
      });
      
      // Jika user adalah student yang enroll, tambahkan data progress
      if (req.user.role === 'student') {
        // Dapatkan enrollment
        const enrollment = await Enrollment.findOne({
          where: {
            user_id: userId,
            course_id: courseId
          }
        });
        
        if (enrollment) {
          // Dapatkan semua progress untuk enrollment ini
          const progresses = await Progress.findAll({
            where: { enrollment_id: enrollment.id }
          });
          
          // Map progress ke lesson
          const progressMap = new Map();
          for (const progress of progresses) {
            progressMap.set(progress.lesson_id, progress);
          }
          
          // Tambahkan data progress ke setiap lesson
          for (const module of modules) {
            for (const lesson of module.lessons) {
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
      }
      
      res.json({
        success: true,
        data: modules
      });
    } catch (error) {
      console.error('Get course modules error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * @desc    Tambah modul ke kursus
   * @route   POST /api/courses/:id/modules
   * @access  Private (Admin, Instructor yang membuat kursus)
   */
  export const addModule = async (req, res) => {
    try {
      const courseId = req.params.id;
      
      // Validasi input
      const { title, description } = req.body;
      
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Judul modul wajib diisi'
        });
      }
      
      // Dapatkan urutan terakhir modul dalam kursus
      const lastModule = await Module.findOne({
        where: { course_id: courseId },
        order: [['order_number', 'DESC']]
      });
      
      const orderNumber = lastModule ? lastModule.order_number + 1 : 1;
      
      // Buat modul baru
      const module = await Module.create({
        course_id: courseId,
        title,
        description,
        order_number: orderNumber,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Modul berhasil ditambahkan',
        data: module
      });
    } catch (error) {
      console.error('Add module error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * @desc    Dapatkan semua siswa yang terdaftar di kursus
   * @route   GET /api/courses/:id/students
   * @access  Private (Admin, Instructor yang membuat kursus)
   */
  export const getCourseStudents = async (req, res) => {
    try {
      const courseId = req.params.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      
      // Filter options
      const userWhereOptions = {};
      if (search) {
        userWhereOptions[Op.or] = [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Get enrollments with pagination
      const { count, rows: enrollments } = await Enrollment.findAndCountAll({
        where: { course_id: courseId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'email', 'avatar_url', 'department'],
            where: userWhereOptions
          }
        ],
        order: [['enrollment_date', 'DESC']],
        limit,
        offset,
        distinct: true
      });
      
      // Add progress for each student
      for (let enrollment of enrollments) {
        // Get total lessons in course
        const totalLessons = await Lesson.count({
          include: [
            {
              model: Module,
              as: 'module',
              where: { course_id: courseId }
            }
          ]
        });
        
        // Get completed lessons
        let completedLessons = 0;
        if (enrollment && enrollment.id !== undefined && enrollment.id !== null) {
          // Tambahkan pengecekan untuk memastikan enrollment.id valid
          completedLessons = await Progress.count({
            where: {
              enrollment_id: enrollment.id,
              status: 'completed'
            }
          });
        }
        
        enrollment.dataValues.progress = {
          totalLessons,
          completedLessons,
          progressPercentage: totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100) 
            : 0
        };
      }
      
      // Calculate total pages
      const totalPages = Math.ceil(count / limit);
      
      res.json({
        success: true,
        data: {
          enrollments,
          pagination: {
            totalStudents: count,
            totalPages,
            currentPage: page,
            limit
          }
        }
      });
    } catch (error) {
      console.error('Get course students error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * @desc    Generate sertifikat untuk user yang telah menyelesaikan kursus
   * @route   POST /api/courses/:id/certificate
   * @access  Private
   */
  export const generateCertificate = async (req, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      
      // Cek apakah user telah menyelesaikan kursus
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId,
          completion_status: 'completed'
        }
      });
      
      if (!enrollment) {
        return res.status(400).json({
          success: false,
          message: 'Anda belum menyelesaikan kursus ini'
        });
      }
      
      // Cek apakah sertifikat sudah ada
      const existingCertificate = await Certificate.findOne({
        where: {
          user_id: userId,
          course_id: courseId
        }
      });
      
      if (existingCertificate) {
        return res.json({
          success: true,
          message: 'Sertifikat sudah tersedia',
          data: existingCertificate
        });
      }
      
      // Generate sertifikat baru
      const certificate = await Certificate.create({
        user_id: userId,
        course_id: courseId,
        issue_date: new Date(),
        expiration_date: null, // Tidak ada tanggal kedaluwarsa
        certificate_url: generateCertificateUrl(userId, courseId)
      });
      
      // Tambahkan notifikasi untuk user
      await Notification.create({
        user_id: userId,
        type: 'certificate',
        message: `Selamat! Anda telah mendapatkan sertifikat untuk kursus "${course.title}"`,
        is_read: false,
        created_at: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Sertifikat berhasil digenerate',
        data: certificate
      });
    } catch (error) {
      console.error('Generate certificate error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  // Helper function to generate certificate URL
  function generateCertificateUrl(userId, courseId) {
    return `/certificates/${userId}/${courseId}/${Date.now()}.pdf`;
  }