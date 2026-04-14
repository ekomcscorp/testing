const { DataTypes } = require("sequelize");
const { sequelize } = require("..");
const { underscoredIf } = require("sequelize/lib/utils");

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
            }
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tbl_user",
                key: "id"
            }
        },
        nama_produk: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tgl_keberangkatan: {
            type: DataTypes.DATE,
            allowNull: false
        },
        tmp_keberangkatan: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quota: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        thumbnail_url: {
            type: DataTypes.STRING(255)
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('draft', 'publish', 'closed'),
            allowNull: true
        },
       
    }, {
        tableName: 'product',
        timestamps: true,
        underscored: true
        
    })

    Product.associate = (models) => {
        Product.hasMany(models.ProductPrices, {
            foreignKey: 'product_id',
            as: 'prices',
            onDelete: 'CASCADE'
       });
        Product.hasMany(models.ProductFlight, {
            foreignKey: 'product_id',
            as: 'flights',
            onDelete: 'CASCADE'
       });
        Product.hasMany(models.ProductSnK, {
            foreignKey: 'product_id',
            as: 'snk',
            onDelete: 'CASCADE'
       });
        Product.hasMany(models.ProductFacility, {
            foreignKey: 'product_id',
            as: 'facility',
            onDelete: 'CASCADE'
       });
        Product.hasMany(models.ProductNote, {
            foreignKey: 'product_id',
            as: 'notes',
            onDelete: 'CASCADE'
       });
        Product.hasMany(models.ProductHotel, {
            foreignKey: 'product_id',
            as: 'hotels',
            onDelete: 'CASCADE'
       });
       Product.hasMany(models.ProductItinerary, {
            foreignKey: 'product_id',
            as: 'itinerary',
            onDelete: 'CASCADE'
       });
      Product.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "creator"
      })
    }


    return Product;
}