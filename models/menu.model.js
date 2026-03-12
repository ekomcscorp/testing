module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define("Menu", {
      id_menu: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nama_menu: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      urutan: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: true,
      },
      parent_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
      }
    },
    {
      tableName: "tbl_menu", // 👈 Tambahkan ini agar Sequelize pakai nama tabel yang benar
      timestamps: false // Hapus jika pakai createdAt & updatedAt
    });

   
    Menu.associate = (models) => {
     Menu.hasMany(Menu, {
        as: "children",
        foreignKey: "parent_id",
        onDelete: "CASCADE"
      });

      Menu.belongsTo(Menu, {
        as: "parent",
        foreignKey: "parent_id"
      });
      Menu.hasMany(models.Akses, {
        foreignKey: 'id_menu',
        as: 'akses',
      })

      // Menu.hasOne(models.Aksesmenu, { foreignKey: 'id_menu', as: 'aksesmenu' });
      // Menu.hasMany(models.Aksessubmenu, {foreignKey: 'id_menu', as: 'aksessubmenu' });
    };
    
    return Menu;
  };
  