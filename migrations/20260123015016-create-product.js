'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
            }
        },
        user_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "tbl_user",
                key: "id"
            }
        },
        nama_produk: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        tgl_keberangkatan: {
            type: Sequelize.DATE,
            allowNull: false
        },
        tmp_keberangkatan: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        duration: {
            type: Sequelize.INTEGER,
            allowNull: false
        },

        thumbnail_url: {
            type: Sequelize.STRING(255)
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM('draft', 'publish', 'closed'),
            allowNull: true
        },
       
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};