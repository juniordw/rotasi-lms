'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quiz_id: {
        type: Sequelize.INTEGER
      },
      question_text: {
        type: Sequelize.TEXT
      },
      question_type: {
        type: Sequelize.STRING
      },
      points: {
        type: Sequelize.INTEGER
      },
      order_number: { // <-- Tambahkan ini
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Questions');
  }
};
