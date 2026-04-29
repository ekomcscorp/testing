module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
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
        }
    }, {
        tableName: 'profiles',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Profile.associate = (models) => {
        Profile.belongsTo(models.User, {
            foreignKey: 'id_user',
            as: 'user'
        });
    };

    return Profile;
};
