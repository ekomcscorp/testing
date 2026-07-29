'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambah kolom rekening_mode — menandai mode rekening travel saat transaksi dibuat (snapshot)
    await queryInterface.addColumn('tbl_transaction', 'rekening_mode', {
      type: Sequelize.ENUM('MARKETPLACE', 'MANDIRI'),
      allowNull: true,
      defaultValue: null,
      comment: 'Snapshot mode rekening travel saat transaksi dibuat'
    });

    // Tambah kolom rekening_snapshot — menyimpan detail rekening tujuan sebagai JSON immutable
    await queryInterface.addColumn('tbl_transaction', 'rekening_snapshot', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Snapshot { nama_bank, no_rekening, atas_nama } saat checkout. Null jika mode MARKETPLACE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tbl_transaction', 'rekening_snapshot');
    await queryInterface.removeColumn('tbl_transaction', 'rekening_mode');
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tbl_transaction_rekening_mode";');
  }
};
