'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Progress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Progress.belongsTo(models.Enrollment, {
        foreignKey: 'enrollment_id',
        as: 'enrollment'
      });
      
      Progress.belongsTo(models.Lesson, {
        foreignKey: 'lesson_id',
        as: 'lesson'
      });
    }
  }
  Progress.init({
    enrollment_id: DataTypes.INTEGER,
    lesson_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    last_accessed: DataTypes.DATE,
    time_spent_minutes: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Progress',
  });
  return Progress;
};