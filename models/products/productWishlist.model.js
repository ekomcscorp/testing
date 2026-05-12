const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Wishlist = sequelize.define('Wishlist', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Product',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'product_wishlist',
    timestamps: false,
  });

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Wishlist.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return Wishlist;
};
