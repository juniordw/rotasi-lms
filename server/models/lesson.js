'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Lesson extends Model {
    static associate(models) {
      // Module yang memiliki lesson
      Lesson.belongsTo(models.Module, {
        foreignKey: 'module_id',
        as: 'module'
      });
      
      // Quiz dalam lesson
      Lesson.hasOne(models.Quiz, {
        foreignKey: 'lesson_id',
        as: 'quiz'
      });
      
      // Progress untuk lesson
      Lesson.hasMany(models.Progress, {
        foreignKey: 'lesson_id',
        as: 'progresses'
      });
      
      // Discussion untuk lesson
      Lesson.hasMany(models.Discussion, {
        foreignKey: 'lesson_id',
        as: 'discussions'
      });
    }
  }
  
  Lesson.init({
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['video', 'document', 'quiz', 'article', 'presentation', 'link']]
      }
    },
    content_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    order_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    modelName: 'Lesson',
    tableName: 'Lessons',
    timestamps: false
  });
  
  return Lesson;
};