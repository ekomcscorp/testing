'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tbl_profile', 'rekening_mode', {
      type: Sequelize.ENUM('MARKETPLACE', 'MANDIRI'),
      allowNull: false,
      defaultValue: 'MARKETPLACE',
      comment: 'MARKETPLACE = escrow via platform, MANDIRI = transfer langsung ke travel'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tbl_profile', 'rekening_mode');
    // Drop ENUM type (MySQL tidak perlu, tapi untuk PostgreSQL diperlukan)
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tbl_profile_rekening_mode";');
  }
};
