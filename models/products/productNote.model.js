module.exports = (sequelize, DataTypes) => {
    const ProductNote = sequelize.define('ProductNote', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        product_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'product',
                key: 'id'
            }
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        tableName: 'product_notes',
       timestamps: true,
    underscored: true
    });

    ProductNote.associate = (models) => {
       ProductNote.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'product',
       });
    }


    return ProductNote;
};
