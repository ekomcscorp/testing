module.exports = (sequelize, DataTypes) => {
    const ProductPrices = sequelize.define('ProductPrices', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'product',
                key: 'id'
            }
        },
        room_types: {
            type: DataTypes.ENUM('Quad', 'Triple', 'Double'),
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'product_prices',
       timestamps: true,
    underscored: true
    });

    ProductPrices.associate = (models) => {
        ProductPrices.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'product',
        })
    }


    return ProductPrices;
}