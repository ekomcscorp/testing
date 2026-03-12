module.exports = (sequelize, DataTypes) => {
    const ProductHotelFaciility = sequelize.define(
      "ProductHotelFaciility",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        product_hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'product_hotels',
          key: 'id'
        }
      },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        tableName: "product_hotel_facilities",
       timestamps: true,
    underscored: true
      }
    );
    ProductHotelFaciility.associate = (models)=> {
      ProductHotelFaciility.belongsTo(models.ProductHotel, {
        foreignKey: 'product_hotel_id',
        as: 'product_hotel'
      });
    }


  
    return ProductHotelFaciility;
  };
