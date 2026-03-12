module.exports = (sequelize, DataTypes) => {
    const GalleryCategory = sequelize.define('GalleryCategory', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
      },
    }, {
      tableName: 'categories',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    });

    GalleryCategory.associate = (models) => {
      GalleryCategory.hasMany(models.Product, {
        foreignKey:  'category_id', 
        as: "categories"
      })
    };
  
    return GalleryCategory;
  };
  