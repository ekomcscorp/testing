const { DataTypes } = require("sequelize");
const { sequelize } = require("..");

module.exports = (sequelize, DataTypes) => {
    const ProductSnK = sequelize.define('ProductSnK', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        product_id_id: {
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
        }
    }, {
        tableName: 'product_snk',
       timestamps: true,
    underscored: true
    });

    ProductSnK.associate = (models) => {
       ProductSnK.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'product',
       });
    }   
    

    return ProductSnK;
}