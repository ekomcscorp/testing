module.exports = (sequelize, DataTypes) => {
    const Gallery = sequelize.define('Gallery', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
    }, {
      tableName: 'galleries',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    });
  
    return Gallery;
  };
  