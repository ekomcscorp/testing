'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Update tbl_profile: tambahkan allow_marketplace
    await queryInterface.addColumn('tbl_profile', 'allow_marketplace', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'true = mengizinkan pembayaran via rekening marketplace'
    });

    // 2. Update tbl_travel_rekening: hapus kolom is_primary, is_verified, verified_at, verified_by
    const tableDescription = await queryInterface.describeTable('tbl_travel_rekening');
    if (tableDescription.is_primary) {
      await queryInterface.removeColumn('tbl_travel_rekening', 'is_primary');
    }
    if (tableDescription.is_verified) {
      await queryInterface.removeColumn('tbl_travel_rekening', 'is_verified');
    }
    if (tableDescription.verified_at) {
      await queryInterface.removeColumn('tbl_travel_rekening', 'verified_at');
    }
    if (tableDescription.verified_by) {
      await queryInterface.removeColumn('tbl_travel_rekening', 'verified_by');
    }

    // 3. Update tbl_transaction: tambah travel_rekening_id & rekening_type
    await queryInterface.addColumn('tbl_transaction', 'travel_rekening_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tbl_travel_rekening',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
      comment: 'ID rekening travel yang dipilih jamaah (null jika memilih MARKETPLACE)'
    });

    await queryInterface.addColumn('tbl_transaction', 'rekening_type', {
      type: Sequelize.ENUM('MARKETPLACE', 'MANDIRI'),
      allowNull: true,
      defaultValue: 'MARKETPLACE',
      comment: 'Jenis rekening pilihan jamaah saat checkout'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tbl_transaction', 'rekening_type');
    await queryInterface.removeColumn('tbl_transaction', 'travel_rekening_id');
    await queryInterface.removeColumn('tbl_profile', 'allow_marketplace');

    await queryInterface.addColumn('tbl_travel_rekening', 'is_primary', {
      type: Sequelize.TINYINT(1),
      defaultValue: 0
    });
    await queryInterface.addColumn('tbl_travel_rekening', 'is_verified', {
      type: Sequelize.TINYINT(1),
      defaultValue: 0
    });
    await queryInterface.addColumn('tbl_travel_rekening', 'verified_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('tbl_travel_rekening', 'verified_by', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
