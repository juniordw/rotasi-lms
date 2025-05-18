'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association with User model
      Enrollment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Define association with Course model with proper alias
      Enrollment.belongsTo(models.Course, {
        foreignKey: 'course_id',
        as: 'course'
      });
      
      // Define association with Progress model
      Enrollment.hasMany(models.Progress, {
        foreignKey: 'enrollment_id',
        as: 'progresses'
      });
    }
  }
  
  Enrollment.init({
    user_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
    enrollment_date: DataTypes.DATE,
    completion_status: DataTypes.STRING,
    completion_date: DataTypes.DATE,
    score: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Enrollment',
  });
  
  return Enrollment;
};