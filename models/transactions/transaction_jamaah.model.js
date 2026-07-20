const { sequelize } = require("..");

module.exports = (sequelize, DataTypes) => {
    const TransactionJamaah = sequelize.define('TransactionJamaah', {
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

        transaction_detail_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_transaction_details',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },

        fullname: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false
        },

        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },

        gender: {
            type: DataTypes.ENUM('L', 'P'),
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM("belum menikah", "menikah"),
            allowNull: false
        },

        img_ktp: {
            type: DataTypes.STRING,
            allowNull: false
        },

        img_kk: {
            type: DataTypes.STRING,
            allowNull: false
        },

        img_passpor: {
            type: DataTypes.STRING,
            allowNull: false
        },

        img_diri: {
            type: DataTypes.STRING,
            allowNull: false
        },

        img_akta_kelahiran: {
            type: DataTypes.STRING,
            allowNull: true
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,         
        },

        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    }, {
        tableName: "tbl_transaction_jamaah",
        timestamps: true
    });

    TransactionJamaah.associate = (models) => {
        TransactionJamaah.belongsTo(models.Transaction, {
            foreignKey: 'transaction_id',
            as: 'transaction'
        });
        TransactionJamaah.belongsTo(models.TransactionDetail, {
            foreignKey: 'transaction_detail_id',
            as: 'detail'
        });
    };

    return TransactionJamaah;
}