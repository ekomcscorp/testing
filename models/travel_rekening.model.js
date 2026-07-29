module.exports = (sequelize, DataTypes) => {
    const TravelRekening = sequelize.define('TravelRekening', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user', // Disamakan
                key: 'id'
            }
        },
        nama_bank: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        no_rekening: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        atas_nama: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, {
        tableName: 'tbl_travel_rekening',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    TravelRekening.associate = (models) => {
        TravelRekening.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'travel'
        });
    };

    return TravelRekening;
};