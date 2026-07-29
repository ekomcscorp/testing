module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
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
                model: 'tbl_user', // Disamakan nama tabelnya
                key: 'id'
            }
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        jk: {
            type: DataTypes.ENUM('LK', 'PR'),
            allowNull: true,
        },
        tgl_lahir: {
            type: DataTypes.DATE,
            allowNull: true
        },
        no_nik: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: true
        },
        no_paspor: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        nama_paspor: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        rekening_mode: {
            type: DataTypes.ENUM('MARKETPLACE', 'MANDIRI'),
            allowNull: false,
            defaultValue: 'MARKETPLACE',
            comment: 'MARKETPLACE = escrow platform, MANDIRI = transfer langsung ke travel'
        },
        allow_marketplace: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'true = travel mengizinkan jamaah bayar via rekening marketplace'
        }
    }, {
        tableName: 'tbl_profile',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Profile.associate = (models) => {
        Profile.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        // Opsional: Relasi langsung dari Profile ke Rekening via user_id
        Profile.hasMany(models.TravelRekening, {
            foreignKey: 'user_id',
            sourceKey: 'user_id',
            as: 'rekening_list'
        });
    };

    return Profile;
};