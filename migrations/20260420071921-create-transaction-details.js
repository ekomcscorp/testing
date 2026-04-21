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
        references: {
          model: 'tbl_transaction',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      jamaah_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      // 🔥 SNAPSHOT PRODUCT
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      product_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔥 SNAPSHOT PRICE
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      room_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔥 SNAPSHOT HOTEL
      hotel_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      hotel_city: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔥 SNAPSHOT FLIGHT
      airline_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔥 SCHEDULE
      departure_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // 🔥 TOTAL PER JEMAAH
      subtotal: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_transaction_details');
  },
};