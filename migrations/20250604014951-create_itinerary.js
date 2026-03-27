'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('itineraries', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'umrah_packages',
          key: 'id'
        }
      },
      day_number: { type: Sequelize.INTEGER, allowNull: false },
      activity: { type: Sequelize.TEXT, allowNull: false },
      location: { type: Sequelize.STRING(100), allowNull: true },
      time: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departure_details', null, {});
  }
};
