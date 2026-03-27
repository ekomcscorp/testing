'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('package_flights', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'umrah_packages', key: 'id' } },
      flight_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'flights', key: 'id' } },
      flight_type: { type: Sequelize.STRING(50), allowNull: false }, // e.g., "one-way", "round-trip"
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('package_flights');
  }
};
