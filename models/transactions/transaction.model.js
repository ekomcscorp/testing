module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        transaction_no: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
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
            // Contoh format: TRX-1703951234 (TRX + Timestamp)
            // Atau bisa pakai random generator
            const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 angka acak
            transaction.transaction_no = `TRX-${Date.now()}${randomDigits}`;
        }
    }
    });
    return Transaction;
}

