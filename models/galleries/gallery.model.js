module.exports = (sequelize, DataTypes) => {
    const Gallery = sequelize.define('Gallery', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'gallery_categories',
          key: 'id',
        },
      },
    }, {
      tableName: 'galleries',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    });

   
  
    return Gallery;
  };
  