'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class UserAnswer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserAnswer.init({
    enrollment_id: DataTypes.INTEGER,
    question_id: DataTypes.INTEGER,
    answer_id: DataTypes.INTEGER,
    text_answer: DataTypes.TEXT,
    is_correct: DataTypes.BOOLEAN,
    points_earned: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'UserAnswer',
  });
  return UserAnswer;
};