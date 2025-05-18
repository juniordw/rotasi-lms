import {
  User,
  Enrollment,
  Certificate,
  Course,
  Progress,
  Lesson,
  Module,
  Notification,
  RefreshToken,
} from "../models/index.js";
import { Op } from "sequelize";
import { validateUserUpdate } from "../utils/validators.js";
import db from "../models/index.js";
const { sequelize } = db;

/**
 * @desc    Mendapatkan semua users (dengan paginasi dan filter)
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || null;
    const department = req.query.department || null;

    // Filter options
    const whereOptions = {
      ...(search && {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
        ],
      }),
      ...(role && { role }),
      ...(department && { department }),
    };

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereOptions,
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          totalUsers: count,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Dapatkan detail user berdasarkan ID
 * @route   GET /api/users/:id
 * @access  Private (Admin or same user)
 */
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Cek akses: hanya admin atau user sendiri yang bisa melihat
    if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // Get user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Jika user adalah instructor, tambahkan data courses yang dibuat
    if (user.role === "instructor") {
      const courses = await Course.findAll({
        where: { instructor_id: userId },
        attributes: ["id", "title", "status", "created_at"],
      });

      user.dataValues.courses = courses;
    }

    // Tambahkan data enrollments
    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "thumbnail_url"],
        },
      ],
    });

    user.dataValues.enrollments = enrollments;

    // Tambahkan data certificates
    const certificates = await Certificate.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
    });

    user.dataValues.certificates = certificates;

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update data user
 * @route   PUT /api/users/:id
 * @access  Private (Admin or same user)
 */
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Cek akses: hanya admin atau user sendiri yang bisa mengupdate
    if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // Validasi input
    const { error } = validateUserUpdate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Cek apakah user ada
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Data yang bisa diupdate
    const { full_name, email, username, department, role, avatar_url } =
      req.body;

    // Hanya admin yang bisa mengubah role
    if (role && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya admin yang bisa mengubah role",
      });
    }

    // Cek apakah email atau username sudah digunakan (jika diubah)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan",
        });
      }
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username sudah digunakan",
        });
      }
    }

    // Update user
    await user.update({
      ...(full_name && { full_name }),
      ...(email && { email }),
      ...(username && { username }),
      ...(department && { department }),
      ...(role && { role }),
      ...(avatar_url && { avatar_url }),
      updated_at: new Date(),
    });

    // Get updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Hapus user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Cek apakah user ada
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Cek apakah user adalah instructor dengan course
    if (user.role === "instructor") {
      const courseCount = await Course.count({
        where: { instructor_id: userId },
      });

      if (courseCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            "User tidak dapat dihapus karena memiliki kursus. Harap transfer kursus ke instructor lain terlebih dahulu",
        });
      }
    }

    // Hapus semua enrollment user
    await Enrollment.destroy({
      where: { user_id: userId },
    });

    // Hapus semua sertifikat user
    await Certificate.destroy({
      where: { user_id: userId },
    });

    // Hapus semua notifikasi user
    await Notification.destroy({
      where: { user_id: userId },
    });

    // Hapus semua refresh token user
    await RefreshToken.destroy({
      where: { user_id: userId },
    });

    // Hapus user
    await user.destroy();

    res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Ubah role user
 * @route   POST /api/users/:id/change-role
 * @access  Private (Admin only)
 */
export const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Validasi role
    const validRoles = ["admin", "instructor", "student"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role tidak valid. Role yang diizinkan: ${validRoles.join(
          ", "
        )}`,
      });
    }

    // Cek apakah user ada
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Update role
    await user.update({
      role,
      updated_at: new Date(),
    });

    res.json({
      success: true,
      message: `Role user berhasil diubah menjadi ${role}`,
    });
  } catch (error) {
    console.error("Change user role error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update profile user sendiri
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validasi input
    const { error } = validateUserUpdate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Data yang bisa diupdate
    const { full_name, email, username, department, avatar_url } = req.body;

    // Cek apakah user ada
    const user = await User.findByPk(userId);

    // Cek apakah email atau username sudah digunakan (jika diubah)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan",
        });
      }
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username sudah digunakan",
        });
      }
    }

    // Update user
    await user.update({
      ...(full_name && { full_name }),
      ...(email && { email }),
      ...(username && { username }),
      ...(department && { department }),
      ...(avatar_url && { avatar_url }),
      updated_at: new Date(),
    });

    // Get updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      message: "Profil berhasil diupdate",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Upload avatar profil
 * @route   POST /api/users/profile/avatar
 * @access  Private
 */
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cek apakah file diupload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diupload",
      });
    }

    // Dapatkan file path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Update avatar_url user
    await User.update({ avatar_url: avatarPath }, { where: { id: userId } });

    res.json({
      success: true,
      message: "Avatar berhasil diupload",
      data: {
        avatar_url: avatarPath,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Dapatkan semua sertifikat user
 * @route   GET /api/users/profile/certificates
 * @access  Private
 */
export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    // Dapatkan semua sertifikat user
    const certificates = await Certificate.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "thumbnail_url"],
          include: [
            {
              model: User,
              as: "instructor",
              attributes: ["id", "full_name"],
            },
          ],
        },
      ],
      order: [["issue_date", "DESC"]],
    });

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get user certificates error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Dapatkan statistik user untuk dashboard
 * @route   GET /api/users/stats/dashboard
 * @access  Private
 */
export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Stats untuk student
    if (req.user.role === "student") {
      // Total kursus yang diikuti
      const totalEnrollments = await Enrollment.count({
        where: { user_id: userId },
      });

      // Kursus yang sedang diikuti
      const inProgressCourses = await Enrollment.count({
        where: {
          user_id: userId,
          completion_status: "in_progress",
        },
      });

      // Kursus yang sudah selesai
      const completedCourses = await Enrollment.count({
        where: {
          user_id: userId,
          completion_status: "completed",
        },
      });

      // Total sertifikat
      const totalCertificates = await Certificate.count({
        where: { user_id: userId },
      });

      // Total waktu belajar
      const totalStudyTime =
        (await Progress.sum("time_spent_minutes", {
          include: [
            {
              model: Enrollment,
              as: "enrollment",
              where: { user_id: userId },
              required: true,
            },
          ],
        })) || 0;

      // Aktivitas terakhir
      const recentActivities = await Progress.findAll({
        attributes: ["id", "status", "last_accessed"],
        include: [
          {
            model: Enrollment,
            as: "enrollment",
            where: { user_id: userId },
            required: true,
          },
          {
            model: Lesson,
            as: "lesson",
            attributes: ["id", "title"],
            include: [
              {
                model: Module,
                as: "module",
                attributes: ["id", "title"],
                include: [
                  {
                    model: Course,
                    as: "course",
                    attributes: ["id", "title"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["last_accessed", "DESC"]],
        limit: 5,
      });

      res.json({
        success: true,
        data: {
          courseStats: {
            totalEnrollments,
            inProgressCourses,
            completedCourses,
            completionRate:
              totalEnrollments > 0
                ? Math.round((completedCourses / totalEnrollments) * 100)
                : 0,
          },
          certificateStats: {
            totalCertificates,
          },
          studyStats: {
            totalStudyTimeMinutes: totalStudyTime,
            totalStudyTimeHours: Math.round((totalStudyTime / 60) * 10) / 10,
          },
          recentActivities,
        },
      });
    }
    // Stats untuk instructor
    else if (req.user.role === "instructor") {
      try {
        // Total kursus yang dibuat
        const totalCourses = await Course.count({
          where: { instructor_id: userId },
        });

        // Kursus yang dipublish
        const publishedCourses = await Course.count({
          where: {
            instructor_id: userId,
            status: "published",
          },
        });

        // Total student yang enroll di kursus
        const totalStudents = await Enrollment.count({
          include: [
            {
              model: Course,
              as: "course",
              where: { instructor_id: userId },
              required: true,
            },
          ],
        });

        // Alternative approach: get courses first, then count enrollments separately
        const courses = await Course.findAll({
          where: { instructor_id: userId },
          attributes: ["id", "title", "thumbnail_url"],
        });
        
        // Create array for popular courses with counts
        const popularCourses = [];
        
        // For each course, count enrollments and add to array
        for (const course of courses) {
          const enrollmentCount = await Enrollment.count({
            where: { course_id: course.id }
          });
          
          popularCourses.push({
            id: course.id,
            title: course.title,
            thumbnail_url: course.thumbnail_url,
            enrollmentCount: enrollmentCount
          });
        }
        
        // Sort by enrollment count descending and limit to top 5
        popularCourses.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        const top5PopularCourses = popularCourses.slice(0, 5);

        res.json({
          success: true,
          data: {
            courseStats: {
              totalCourses,
              publishedCourses,
              draftCourses: totalCourses - publishedCourses,
              publishRate:
                totalCourses > 0
                  ? Math.round((publishedCourses / totalCourses) * 100)
                  : 0,
            },
            studentStats: {
              totalStudents,
            },
            popularCourses: top5PopularCourses,
          },
        });
      } catch (error) {
        console.error("Instructor stats error:", error);
        res.status(500).json({
          success: false,
          message: "Server error",
          error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
    // Stats untuk admin
    else if (req.user.role === "admin") {
      try {
        // Total user
        const totalUsers = await User.count();

        // Get role counts directly with individual queries to avoid GROUP BY
        const adminCount = await User.count({ where: { role: 'admin' } });
        const instructorCount = await User.count({ where: { role: 'instructor' } });
        const studentCount = await User.count({ where: { role: 'student' } });
        
        // Put role counts into expected format
        const roleCount = {
          admin: adminCount,
          instructor: instructorCount,
          student: studentCount
        };

        // Total kursus
        const totalCourses = await Course.count();

        // Get course status counts directly
        const draftCount = await Course.count({ where: { status: 'draft' } });
        const publishedCount = await Course.count({ where: { status: 'published' } });
        const archivedCount = await Course.count({ where: { status: 'archived' } });
        
        // Put status counts into expected format
        const statusCount = {
          draft: draftCount,
          published: publishedCount,
          archived: archivedCount
        };

        // Total enrollment
        const totalEnrollments = await Enrollment.count();

        // Get enrollment status counts directly
        const notStartedCount = await Enrollment.count({ where: { completion_status: 'not_started' } });
        const inProgressCount = await Enrollment.count({ where: { completion_status: 'in_progress' } });
        const completedCount = await Enrollment.count({ where: { completion_status: 'completed' } });
        
        // Put enrollment status counts into expected format
        const enrollmentStatusCount = {
          not_started: notStartedCount,
          in_progress: inProgressCount,
          completed: completedCount
        };

        res.json({
          success: true,
          data: {
            userStats: {
              totalUsers,
              roleCount
            },
            courseStats: {
              totalCourses,
              statusCount
            },
            enrollmentStats: {
              totalEnrollments,
              statusCount: enrollmentStatusCount
            },
          },
        });
      } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({
          success: false,
          message: "Server error",
          error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
  } catch (error) {
    console.error("Get user dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};