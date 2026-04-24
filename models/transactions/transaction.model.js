module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tbl_user",
                key: "id"
            }
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "product",
                key: "id"
            }
        },
        transaction_no: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        total_price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'SUCCESS', 'UNPAID','FAILED'),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        payment_method: {
            type: DataTypes.ENUM('CASH', 'TRANSFER'),
            allowNull: true,
        },
        evidence_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },{
        tableName: 'tbl_transaction',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
        beforeCreate: (transaction, options) => {
            // Format: TRX-123452026 (5 random digits + year)
            const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 angka acak
            const year = new Date().getFullYear();
            transaction.transaction_no = `TRX-${randomDigits}${year}`;
            }
        }
    })

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user"
        });
        Transaction.belongsTo(models.Product, {
            foreignKey: "product_id",
            as: "product"
        });
        Transaction.hasMany(models.TransactionDetail, {
            foreignKey: "transaction_id",
            as: "details"
        });
    }

    return Transaction;
}

