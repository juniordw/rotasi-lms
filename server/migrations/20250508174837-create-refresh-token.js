'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshToken', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        comment: '[PK] integer'
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'character varying (255)'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // This assumes you have a Users table
          key: 'id'
        },
        comment: 'integer'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'timestamp with time zone'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'timestamp with time zone',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'timestamp with time zone',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('RefreshToken', ['token']);
    await queryInterface.addIndex('RefreshToken', ['user_id']);
    await queryInterface.addIndex('RefreshToken', ['expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RefreshToken');
  }
};