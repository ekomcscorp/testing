'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_travel_rekening', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'FK ke tbl_user (akun travel)'
      },

      nama_bank: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nama bank (BCA, BNI, Mandiri, dst)'
      },

      no_rekening: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Nomor rekening bank'
      },

      atas_nama: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nama pemilik rekening (harus sesuai buku tabungan)'
      },

      is_primary: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1 = rekening utama yang aktif digunakan untuk penerimaan'
      },

      is_verified: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1 = telah diverifikasi admin, 0 = pending'
      },

      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp saat admin memverifikasi'
      },

      verified_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_user',
          key: 'id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
        comment: 'FK ke tbl_user (admin yang memverifikasi)'
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Index untuk query performa
    await queryInterface.addIndex('tbl_travel_rekening', ['user_id'], {
      name: 'idx_travel_rekening_user_id'
    });
    await queryInterface.addIndex('tbl_travel_rekening', ['user_id', 'is_primary'], {
      name: 'idx_travel_rekening_primary'
    });
    await queryInterface.addIndex('tbl_travel_rekening', ['is_verified'], {
      name: 'idx_travel_rekening_verified'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_travel_rekening');
  }
};
