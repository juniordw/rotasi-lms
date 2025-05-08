import db from "../models/index.js";
const { Lesson, Module, Course, User, Enrollment, Discussion } = db;


/**
 * @desc    Dapatkan semua diskusi dalam kursus
 * @route   GET /api/discussions/course/:courseId
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getCourseDiscussions = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    // Validasi akses ke kursus
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak terdaftar di kursus ini'
        });
      }
    }

    // Ambil semua diskusi utama (parent_id = null) untuk kursus ini
    const discussions = await Discussion.findAll({
      where: {
        course_id: courseId,
        parent_id: null
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'username', 'avatar_url']
        },
        {
          model: Discussion,
          as: 'comments',
          separate: true,
          attributes: ['id'], // Hanya ambil id untuk menghitung
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Tambahkan jumlah komentar ke setiap diskusi
    const formattedDiscussions = discussions.map(discussion => {
      const discussionData = discussion.toJSON();
      discussionData.comment_count = discussionData.comments ? discussionData.comments.length : 0;
      delete discussionData.comments; // Hapus array comments dari response

      return discussionData;
    });

    res.json({
      success: true,
      data: formattedDiscussions
    });
  } catch (error) {
    console.error("Get course discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Dapatkan semua diskusi dalam lesson
 * @route   GET /api/discussions/lesson/:lessonId
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getLessonDiscussions = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = req.user.id;

    // Ambil lesson untuk mendapatkan courseId
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Module,
          as: 'module',
          include: [{ model: Course, as: 'course' }]
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson tidak ditemukan'
      });
    }

    const courseId = lesson.module.course.id;

    // Validasi akses ke kursus
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak terdaftar di kursus ini'
        });
      }
    }

    // Ambil semua diskusi utama (parent_id = null) untuk lesson ini
    const discussions = await Discussion.findAll({
      where: {
        lesson_id: lessonId,
        parent_id: null
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'username', 'avatar_url']
        },
        {
          model: Discussion,
          as: 'comments',
          separate: true,
          attributes: ['id'], // Hanya ambil id untuk menghitung
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Tambahkan jumlah komentar ke setiap diskusi
    const formattedDiscussions = discussions.map(discussion => {
      const discussionData = discussion.toJSON();
      discussionData.comment_count = discussionData.comments ? discussionData.comments.length : 0;
      delete discussionData.comments; // Hapus array comments dari response

      return discussionData;
    });

    res.json({
      success: true,
      data: formattedDiscussions
    });
  } catch (error) {
    console.error("Get lesson discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Dapatkan detail diskusi dengan komentar
 * @route   GET /api/discussions/:id
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getDiscussionById = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;

    // Ambil diskusi dengan user
    const discussion = await Discussion.findByPk(discussionId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'username', 'avatar_url', 'role']
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Diskusi tidak ditemukan'
      });
    }

    // Validasi akses ke kursus
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: discussion.course_id
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak terdaftar di kursus ini'
        });
      }
    }

    // Ambil komentar untuk diskusi ini
    const comments = await Discussion.findAll({
      where: {
        parent_id: discussionId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'username', 'avatar_url', 'role']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        discussion,
        comments
      }
    });
  } catch (error) {
    console.error("Get discussion by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Buat diskusi baru
 * @route   POST /api/discussions
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, courseId, lessonId } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!title || !content || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Judul, konten, dan courseId diperlukan'
      });
    }

    // Validasi akses ke kursus
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak terdaftar di kursus ini'
        });
      }
    }

    // Jika lessonId diberikan, validasi bahwa lesson berada dalam kursus yang benar
    if (lessonId) {
      const lesson = await Lesson.findOne({
        where: { id: lessonId },
        include: [
          {
            model: Module,
            as: 'module',
            where: { course_id: courseId }
          }
        ]
      });

      if (!lesson) {
        return res.status(400).json({
          success: false,
          message: 'Lesson tidak valid untuk kursus ini'
        });
      }
    }

    // Buat diskusi
    const discussion = await Discussion.create({
      title,
      content,
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId || null,
      parent_id: null,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Load user data untuk respons
    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'username', 'avatar_url', 'role']
    });

    res.status(201).json({
      success: true,
      message: 'Diskusi berhasil dibuat',
      data: {
        ...discussion.toJSON(),
        user
      }
    });
  } catch (error) {
    console.error("Create discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Tambah komentar ke diskusi
 * @route   POST /api/discussions/:id/comments
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const addComment = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Konten komentar diperlukan'
      });
    }

    // Cek diskusi
    const parentDiscussion = await Discussion.findByPk(discussionId);
    
    if (!parentDiscussion) {
      return res.status(404).json({
        success: false,
        message: 'Diskusi tidak ditemukan'
      });
    }

    const courseId = parentDiscussion.course_id;

    // Validasi akses ke kursus
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak terdaftar di kursus ini'
        });
      }
    }

    // Buat komentar (sebagai diskusi anak)
    const comment = await Discussion.create({
      content,
      user_id: userId,
      course_id: courseId,
      lesson_id: parentDiscussion.lesson_id,
      parent_id: discussionId,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Load user data untuk respons
    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'username', 'avatar_url', 'role']
    });

    res.status(201).json({
      success: true,
      message: 'Komentar berhasil ditambahkan',
      data: {
        ...comment.toJSON(),
        user
      }
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};