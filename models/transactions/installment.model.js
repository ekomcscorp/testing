const { DataTypes } = require("sequelize");
const { sequelize } = require("..");

module.exports = (sequelize, DataTypes) => {
    const TransactionInstallment = sequelize.define('TransactionInstallment', {
        id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_transaction', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
       installment_number: {
            type: DataTypes.TINYINT, // 1, 2, atau 3
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER, // Nominal tagihan termin ini
            allowNull: false,
        },
        due_date: {
            type: DataTypes.DATE, // Tanggal jatuh tempo
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('UNPAID', 'PENDING', 'SUCCESS', 'FAILED'),
            allowNull: false,
            defaultValue: 'UNPAID'
        },
        payment_method: {
            type: DataTypes.ENUM('CASH', 'TRANSFER'),
            allowNull: true,
        },
        evidence_url: {
            type: DataTypes.STRING(255), // Bukti transfer per termin
            allowNull: true,
        },
        paid_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },{
        tableName: 'tbl_transaction_payments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    TransactionInstallment.associate = (models) => {
        TransactionInstallment.belongsTo(models.Transaction, {
            foreignKey: "transaction_id",
            as: 'transaction'
        });
    }

    return TransactionInstallment;
}