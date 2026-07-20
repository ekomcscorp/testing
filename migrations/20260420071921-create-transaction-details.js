'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_transaction_details', {
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


    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    product_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    thumbnail_product: {
      type: DataTypes.STRING,
      allowNull: true
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    room_types: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    hotels_snapshot: {
        type: DataTypes.JSON,
        allowNull: true
    },


    flights_snapshot: {
        type: DataTypes.JSON,
        allowNull: true
    },

    travel_snapshot: {
        type: DataTypes.JSON,
        allowNull: true
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
    // invoice_no: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     unique: true
    // },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_transaction_details');
  },
};