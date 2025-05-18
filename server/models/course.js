'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      // Instructor yang membuat course
      Course.belongsTo(models.User, {
        foreignKey: 'instructor_id',
        as: 'instructor',
        onDelete: 'SET NULL', // Tambahkan ini untuk mencegah error constraint
        onUpdate: 'CASCADE'
      });
      
      // Category course
      Course.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'SET NULL', // Tambahkan ini untuk mencegah error constraint
        onUpdate: 'CASCADE'
      });
      
      // Module dalam course
      Course.hasMany(models.Module, {
        foreignKey: 'course_id',
        as: 'modules',
        onDelete: 'CASCADE'
      });
      
      // Enrollment untuk course
      Course.hasMany(models.Enrollment, {
        foreignKey: 'course_id',
        as: 'enrollments',
        onDelete: 'CASCADE'
      });
      
      // Student yang enroll ke course
      Course.belongsToMany(models.User, {
        through: models.Enrollment,
        foreignKey: 'course_id',
        otherKey: 'user_id',
        as: 'students'
      });
      
      // Certificate untuk course
      Course.hasMany(models.Certificate, {
        foreignKey: 'course_id',
        as: 'certificates',
        onDelete: 'CASCADE'
      });
      
      // Discussion untuk course
      Course.hasMany(models.Discussion, {
        foreignKey: 'course_id',
        as: 'discussions',
        onDelete: 'CASCADE'
      });
    }
  }
  
  Course.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Judul kursus tidak boleh kosong'
        },
        len: {
          args: [5, 100],
          msg: 'Judul kursus harus antara 5-100 karakter'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Deskripsi kursus tidak boleh kosong'
        },
        len: {
          args: [10],
          msg: 'Deskripsi kursus minimal 10 karakter'
        }
      }
    },
    instructor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: {
          args: [['draft', 'published', 'archived']],
          msg: 'Status harus berupa draft, published, atau archived'
        }
      }
    },
    duration_hours: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: {
          msg: 'Durasi harus berupa angka'
        },
        min: {
          args: [0],
          msg: 'Durasi tidak boleh negatif'
        }
      }
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: {
          args: [['beginner', 'intermediate', 'advanced']],
          msg: 'Level harus berupa beginner, intermediate, atau advanced'
        }
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'Courses',
    timestamps: false,
    // Tambahkan hooks untuk menangani error constraint
    hooks: {
      beforeSync: async (options) => {
        // Periksa apakah tabel sudah ada sebelum mencoba menghapus constraint
        try {
          const tableExists = await sequelize.query(
            "SELECT to_regclass('public.courses')",
            { type: sequelize.QueryTypes.SELECT }
          );
          
          if (tableExists[0].to_regclass) {
            // Periksa apakah constraint sudah ada
            const constraints = await sequelize.query(
              "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'courses' AND constraint_type = 'FOREIGN KEY'",
              { type: sequelize.QueryTypes.SELECT }
            );
            
            // Jika constraint tidak ada, ubah opsi sync
            const hasInstructorConstraint = constraints.some(c => c.constraint_name === 'courses_instructor_id_fkey');
            const hasCategoryConstraint = constraints.some(c => c.constraint_name === 'courses_category_id_fkey');
            
            if (!hasInstructorConstraint) {
              console.log('Warning: constraint courses_instructor_id_fkey tidak ditemukan, melewati proses drop constraint');
              // Tambahkan informasi ke options untuk digunakan di dalam model
              options.skipInstructorConstraintDrop = true;
            }
            
            if (!hasCategoryConstraint) {
              console.log('Warning: constraint courses_category_id_fkey tidak ditemukan, melewati proses drop constraint');
              // Tambahkan informasi ke options untuk digunakan di dalam model
              options.skipCategoryConstraintDrop = true;
            }
          }
        } catch (error) {
          console.error('Error saat memeriksa constraint:', error);
        }
      }
    }
  });
  
  return Course;
};