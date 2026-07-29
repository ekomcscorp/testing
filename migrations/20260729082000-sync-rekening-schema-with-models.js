'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fix ENUM value for column rekening_type in tbl_transaction ('MARKETPLACE', 'MANDIRI')
    // Mengubah ENUM dari 'TRAVEL_MANDIRI' menjadi 'MANDIRI' agar tidak kena error truncated data
    await queryInterface.changeColumn('tbl_transaction', 'rekening_type', {
      type: Sequelize.ENUM('MARKETPLACE', 'MANDIRI'),
      allowNull: true,
      defaultValue: 'MARKETPLACE',
      comment: 'Jenis rekening pilihan jamaah saat checkout'
    });

    // 2. Memastikan kolom is_active ada di tbl_travel_rekening
    const travelRekTable = await queryInterface.describeTable('tbl_travel_rekening');
    if (!travelRekTable.is_active) {
      await queryInterface.addColumn('tbl_travel_rekening', 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Flag rekening aktif'
      });
    }

    // 3. Memastikan kolom allow_marketplace dan rekening_mode ada di tbl_profile
    const profileTable = await queryInterface.describeTable('tbl_profile');
    if (!profileTable.allow_marketplace) {
      await queryInterface.addColumn('tbl_profile', 'allow_marketplace', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'true = travel mengizinkan jamaah bayar via rekening marketplace'
      });
    }
    if (!profileTable.rekening_mode) {
      await queryInterface.addColumn('tbl_profile', 'rekening_mode', {
        type: Sequelize.ENUM('MARKETPLACE', 'MANDIRI'),
        allowNull: false,
        defaultValue: 'MARKETPLACE',
        comment: 'MARKETPLACE = escrow platform, MANDIRI = transfer langsung ke travel'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('tbl_transaction', 'rekening_type', {
      type: Sequelize.ENUM('MARKETPLACE', 'MANDIRI'),
      allowNull: true,
      defaultValue: 'MARKETPLACE'
    });
  }
};
