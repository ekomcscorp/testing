'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('flights', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      airline: { type: Sequelize.STRING, allowNull: false },
      flight_number: { type: Sequelize.STRING, allowNull: false },
      departure_airport: { type: Sequelize.STRING, allowNull: false },
      arrival_airport: { type: Sequelize.STRING, allowNull: false },
      departure_time: { type: Sequelize.DATE, allowNull: false },
      arrival_time: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('flights');
  }
};
