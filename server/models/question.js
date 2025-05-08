'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Question belongs to Quiz
      Question.belongsTo(models.Quiz, {
        foreignKey: 'quiz_id',
        as: 'quiz',
      });

      // Question has many Answers
      Question.hasMany(models.Answer, {
        foreignKey: 'question_id',
        as: 'answers',  // alias for the related answers
      });
    }
  }

  Question.init({
    quiz_id: DataTypes.INTEGER,
    question_text: DataTypes.TEXT,
    question_type: DataTypes.STRING,
    points: DataTypes.INTEGER,
    order_number: { // Menambahkan kolom order_number
      type: DataTypes.INTEGER,
      allowNull: true, // Bisa kosong
    },
  }, {
    sequelize,
    modelName: 'Question',
  });

  return Question;
};
