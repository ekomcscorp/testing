'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('package_facilities', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'umrah_packages', key: 'id' } },
      facility: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('package_facilities');
  }
};
