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
            type: DataTypes.ENUM('PENDING', 'SUCCESS', 'UNPAID', 'FAILED'),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        payment_method: {
            type: DataTypes.ENUM('CASH', 'TRANSFER'),
            allowNull: true,
        },
        payment_type: {
            type: DataTypes.ENUM('FULL', 'INSTALLMENT'),
            allowNull: false,
            defaultValue: 'FULL'
        },
        installment_status: {
            type: DataTypes.ENUM('NOT_STARTED', 'DP_PAID', 'PARTIALLY_PAID', 'FULLY_PAID'),
            allowNull: false,
            defaultValue: 'NOT_STARTED'
        },
        evidence_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        // Snapshot rekening travel saat transaksi dibuat
        rekening_mode: {
            type: DataTypes.ENUM('MARKETPLACE', 'MANDIRI'),
            allowNull: true,
            defaultValue: null,
            comment: 'Mode rekening travel saat checkout'
        },
        travel_rekening_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID rekening travel yang dipilih jamaah'
        },
        rekening_type: {
            type: DataTypes.ENUM('MARKETPLACE', 'MANDIRI'),
            allowNull: true,
            defaultValue: 'MARKETPLACE',
            comment: 'Pilihan jenis rekening oleh jamaah'
        },
        rekening_snapshot: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
            comment: 'Snapshot { nama_bank, no_rekening, atas_nama } — immutable setelah dibuat'
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
    }, {
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
        Transaction.belongsTo(models.TravelRekening, {
            foreignKey: "travel_rekening_id",
            as: "travel_rekening"
        });
        Transaction.hasMany(models.TransactionDetail, {
            foreignKey: "transaction_id",
            as: "details"
        });
        Transaction.hasMany(models.TransactionJamaah, {
            foreignKey: "transaction_id",
            as: "jamaah",
            onDelete: "CASCADE"
        });
        Transaction.hasMany(models.TransactionInstallment, {
            foreignKey: "transaction_id",
            as: "installments",
            onDelete: "CASCADE"
        })
    }

    return Transaction;
}

