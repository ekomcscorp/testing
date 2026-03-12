module.exports = (sequelize, DataTypes) => {
  const ProductHotel = sequelize.define(
    "ProductHotel",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'product',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city: {
        type: DataTypes.ENUM("Mekkah", "Madinah"),
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jarak:{
        type:DataTypes.STRING(255),
        allowNull: false
      },
      image:{
        type: DataTypes.STRING(255),
        allowNull: true
      },
      facilities: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "product_hotels",
     timestamps: true,
    underscored: true
    }
  );
  ProductHotel.associate = (models)=> {
    ProductHotel.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  }

  return ProductHotel;
};
