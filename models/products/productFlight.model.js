module.exports = (sequelize, DataTypes) => {
  const ProductFlight = sequelize.define(
    "ProductFlight",
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
      airline_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("Departure", "Return"),
        allowNull: false,
      }
    },
    {
      tableName: "product_flight",
      timestamps: true,
       underscored: true
    }
  );

  ProductFlight.associate = (models) => {
    ProductFlight.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }

  return ProductFlight;
};
