'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Module extends Model {
    static associate(models) {
      // Course yang memiliki module
      Module.belongsTo(models.Course, {
        foreignKey: 'course_id',
        as: 'course'
      });
      
      // Lesson dalam module
      Module.hasMany(models.Lesson, {
        foreignKey: 'module_id',
        as: 'lessons'
      });
    }
  }
  
  Module.init({
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    modelName: 'Module',
    tableName: 'Modules',
    timestamps: false
  });
  
  return Module;
};