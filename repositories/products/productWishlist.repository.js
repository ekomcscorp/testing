const {
  Wishlist,
  Product,
  ProductHotel,
  ProductPrices,
  ProductFlight,
} = require("../../models");

class ProductWishlistRepository {

  async getWishlist(userId, productId) {

    return await Wishlist.findOne({
      where: {
        user_id: userId,
        product_id: productId
      },

      include: [
        {
          model: Product,
          as: "product",

          attributes: [
            "id",
            "nama_produk",
            "thumbnail_url",
            "tgl_keberangkatan",
            // "quota"
          ],

          include: [
            {
              model: ProductHotel,
              as: "hotels",
              attributes: [
                "name",
                "city",
                "rating",
                "jarak",
                "image",
                "facilities"
              ]
            },

            {
              model: ProductFlight,
              as: "flights",
              attributes: [
                "airline_name",
                "type"
              ]
            },

            {
              model: ProductPrices,
              as: "prices",
              attributes: [
                "room_types",
                "price"
              ]
            }
          ]
        }
      ]
    });
  }

  async createWishlist(userId, productId) {

    return await Wishlist.create({
      user_id: userId,
      product_id: productId
    });

  }

  async deleteWishlist(userId, productId) {

    return await Wishlist.destroy({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

  }

  async getUserWishlist(userId) {

    return await Wishlist.findAll({
      where: {
        user_id: userId
      },

      include: [
        {
          model: Product,
          as: "product",

          attributes: [
            "id",
            "nama_produk",
            "thumbnail_url",
            "tgl_keberangkatan",
            // "quota"
          ],

          include: [
            {
              model: ProductHotel,
              as: "hotels",
              attributes: [
                "name",
                "city"
              ]
            },

            {
              model: ProductFlight,
              as: "flights",
              attributes: [
                "airline_name",
                "type"
              ]
            },

            {
              model: ProductPrices,
              as: "prices",
              attributes: [
                "room_types",
                "price"
              ]
            }
          ]
        }
      ],
    });
  }
}

module.exports = new ProductWishlistRepository();