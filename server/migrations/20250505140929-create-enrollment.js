'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Enrollments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      course_id: {
        type: Sequelize.INTEGER
      },
      enrollment_date: {
        type: Sequelize.DATE
      },
      completion_status: {
        type: Sequelize.STRING
      },
      completion_date: {
        type: Sequelize.DATE
      },
      score: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('Enrollments');
  }
};