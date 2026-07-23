'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_transaction_jamaah', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_transaction', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      transaction_detail_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_transaction_details',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      fullname: {
        type: Sequelize.STRING,
        allowNull: false
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },

      gender: {
        type: Sequelize.ENUM('L', 'P'),
        allowNull: false
      },
      
      status: {
        type: Sequelize.ENUM("belum menikah", "menikah"),
        allowNull: false
      },

      img_ktp: {
        type: Sequelize.STRING,
        allowNull: true
      },

      img_kk: {
        type: Sequelize.STRING,
        allowNull: true
      },

      img_passpor: {
        type: Sequelize.STRING,
        allowNull: true
      },

      img_diri: {
        type: Sequelize.STRING,
        allowNull: true
      },

      img_akta_kelahiran: {
        type: Sequelize.STRING,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('tbl_transaction_jamaah', ['transaction_id']);
    await queryInterface.addIndex('tbl_transaction_jamaah', ['transaction_detail_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_transaction_jamaah');
  }
};
