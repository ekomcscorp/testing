'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_transaction_payments',{
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
       installment_number: {
            type: Sequelize.TINYINT, // 1, 2, atau 3
            allowNull: false,
        },
        amount: {
            type: Sequelize.INTEGER, // Nominal tagihan termin ini
            allowNull: false,
        },
        due_date: {
            type: Sequelize.DATE, // Tanggal jatuh tempo
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM('UNPAID', 'PENDING', 'SUCCESS', 'FAILED'),
            allowNull: false,
            defaultValue: 'UNPAID'
        },
        payment_method: {
            type: Sequelize.ENUM('CASH', 'TRANSFER'),
            allowNull: true,
        },
        evidence_url: {
            type: Sequelize.STRING(255), // Bukti transfer per termin
            allowNull: true,
        },
        paid_at: {
            type: Sequelize.DATE,
            allowNull: true,
        }
    });
     await queryInterface.addIndex('tbl_transaction_payments', ['transaction_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_transaction_payments');
  }
};
