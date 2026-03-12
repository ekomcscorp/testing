module.exports = (sequelize, DataTypes) => {
    const Userlevel = sequelize.define("Userlevel", {
      id_level: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      nama_level: {
        type: DataTypes.STRING(20),
        allowNull: false,
      }
    },
    {
      tableName: "tbl_userlevel", // 👈 Tambahkan ini agar Sequelize pakai nama tabel yang benar
      timestamps: false // Hapus jika pakai createdAt & updatedAt
    });

    Userlevel.associate = (models) => {
      Userlevel.hasMany(models.Akses, { foreignKey: 'id_level' });
      Userlevel.hasMany(models.User, { foreignKey: 'id_level' });
    };
    
  
    return Userlevel;
  };
  