'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('package_hotels', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, allowNull: false },
      hotel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'hotels', key: 'id' }
      },
      location: {
        type: Sequelize.ENUM('Mekkah', 'Madinah'),
        allowNull: false
      },
      number_of_night: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('package_hotels');
  }
};
