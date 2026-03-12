const { DataTypes } = require("sequelize");
const { sequelize } = require("..");

module.exports = (sequelize, DataTypes) => {
    const ProductItinerary = sequelize.define('ProductItinerary', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'product',
                key: 'id'
            }
        },
        day_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        }

    },{
        tableName: 'product_itineraries',
      timestamps: true,
    underscored: true
    });
    ProductItinerary.associate = (models) => {
        ProductItinerary.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'product',
        });
    };


    return ProductItinerary;
}