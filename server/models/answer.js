'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define the association between Answer and Question
      Answer.belongsTo(models.Question, {
        foreignKey: 'question_id',  // foreign key in Answer table
        as: 'question'  // alias for the association
      });
    }
  }

  Answer.init({
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,  // Answer must belong to a Question
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: false,  // Answer text is required
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,  // Whether the answer is correct or not
    },
  }, {
    sequelize,
    modelName: 'Answer',
  });

  return Answer;
};
