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
      // define association here
    }
  }
  Quiz.init({
    lesson_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    passing_score: DataTypes.FLOAT,
    time_limit_minutes: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Quiz',
  });
  return Quiz;
};