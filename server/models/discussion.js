'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Discussion extends Model {
    static associate(models) {
      // Relasi ke User (pembuat diskusi)
      Discussion.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Relasi ke Course
      Discussion.belongsTo(models.Course, {
        foreignKey: 'course_id',
        as: 'course'
      });
      
      // Relasi ke Lesson
      Discussion.belongsTo(models.Lesson, {
        foreignKey: 'lesson_id',
        as: 'lesson'
      });
      
      // Self-reference untuk parent-child (diskusi-komentar)
      Discussion.hasMany(Discussion, {
        foreignKey: 'parent_id',
        as: 'comments'
      });
      Discussion.belongsTo(Discussion, {
        foreignKey: 'parent_id',
        as: 'parent'
      });
    }
  }
  
  Discussion.init({
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true, // Judul hanya diperlukan untuk diskusi utama, bukan komentar
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Discussion',
    tableName: 'Discussions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Discussion;
};