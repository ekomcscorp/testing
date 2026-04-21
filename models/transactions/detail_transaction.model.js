module.exports = (sequelize, DataTypes) => {
  const TransactionDetail = sequelize.define('TransactionDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    product_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    room_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    hotel_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    hotel_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    airline_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    departure_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },


    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

  }, {
    tableName: 'tbl_transaction_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  // 🔗 RELATION
  TransactionDetail.associate = (models) => {
    TransactionDetail.belongsTo(models.Transaction, {
      foreignKey: "transaction_id",
      as: "transaction"
    });

    TransactionDetail.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user"
    });

    TransactionDetail.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product"
    });
  };

  return TransactionDetail;
};