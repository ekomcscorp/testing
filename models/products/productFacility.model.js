module.exports = (sequelize, DataTypes) => {
  const ProductFacility = sequelize.define(
    "ProductFacility",
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
      facility: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("INCLUDE", "EXCLUDE"),
        allowNull: false,
      },
    },{
      tableName: "product_facility",
      timestamps: true,
      underscored: true
    });

    ProductFacility.associate = (models) => {
      ProductFacility.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product", 
      });
    }

  return ProductFacility;
};
