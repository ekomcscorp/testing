'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_transaction_details', {
     id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    transaction_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },


    product_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },

    product_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    thumbnail_product: {
      type: Sequelize.STRING,
      allowNull: true
    },

    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    room_types: {
      type: Sequelize.STRING,
      allowNull: true,
    },


    hotels_snapshot: {
        type: Sequelize.JSON,
        allowNull: true
    },


    flights_snapshot: {
        type: Sequelize.JSON,
        allowNull: true
    },

    travel_snapshot: {
        type: Sequelize.JSON,
        allowNull: true
    },

    departure_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    duration: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },


    subtotal: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    // invoice_no: {
    //     type: Sequelize.STRING,
    //     allowNull: true,
    //     unique: true
    // },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },

    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_transaction_details');
  },
};