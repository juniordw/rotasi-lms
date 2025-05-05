'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      // Instructor yang membuat course
      Course.belongsTo(models.User, {
        foreignKey: 'instructor_id',
        as: 'instructor'
      });
      
      // Category course
      Course.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // Module dalam course
      Course.hasMany(models.Module, {
        foreignKey: 'course_id',
        as: 'modules'
      });
      
      // Enrollment untuk course
      Course.hasMany(models.Enrollment, {
        foreignKey: 'course_id',
        as: 'enrollments'
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
        as: 'certificates'
      });
      
      // Discussion untuk course
      Course.hasMany(models.Discussion, {
        foreignKey: 'course_id',
        as: 'discussions'
      });
    }
  }
  
  Course.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
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
        isIn: [['draft', 'published', 'archived']]
      }
    },
    duration_hours: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['beginner', 'intermediate', 'advanced']]
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
    tableName: 'courses',
    timestamps: false
  });
  
  return Course;
};