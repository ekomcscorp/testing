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
            beforeCreate: async (transaction) => {

                const now = new Date();

                // YY
                const year =
                now.getFullYear().toString().slice(-2);

                // MM
                const month =
                String(now.getMonth() + 1)
                    .padStart(2, "0");

                // PREFIX
                const prefix = `PU${year}${month}`;

                // Cari transaksi terakhir bulan ini
                const lastTransaction =
                await Transaction.findOne({

                    where: {
                    transaction_no: {
                        [sequelize.Sequelize.Op.like]:
                        `${prefix}%`
                    }
                    },

                    order: [["transaction_no", "DESC"]]
                });

                let sequence = 1;

                if (lastTransaction) {

                // Ambil 4 digit terakhir
                const lastSequence =
                    parseInt(
                    lastTransaction.transaction_no.slice(-4)
                    );

                sequence = lastSequence + 1;
                }

                // 0001
                const sequenceStr =
                String(sequence).padStart(4, "0");

                transaction.transaction_no =
                `${prefix}${sequenceStr}`;
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

