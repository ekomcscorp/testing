

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      fullname: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      id_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: true,
      },
      app: {
        type: DataTypes.ENUM('N', 'Y'),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      tableName: "tbl_user", // 👈 Tambahkan ini agar Sequelize pakai nama tabel yang benar
      timestamps: true, // Hapus jika pakai createdAt & updatedAt
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    });

    User.associate = (models) => {
      User.belongsTo(models.Userlevel, { foreignKey: 'id_level', as: 'level' });
      User.hasMany(models.Product, {
        foreignKey: "user_id",
        as: "products"
      });
    }
  
    return User;
  };
  