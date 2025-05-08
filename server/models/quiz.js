'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Quiz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Asosiasi dengan model Lesson
      Quiz.belongsTo(models.Lesson, {
        foreignKey: 'lesson_id',
        as: 'lesson',
      });

      // Asosiasi dengan model Question (one-to-many)
      Quiz.hasMany(models.Question, {
        foreignKey: 'quiz_id',
        as: 'questions',
      });
    }
  }
  Quiz.init({
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passing_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    time_limit_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Quiz',
  });
  return Quiz;
};
