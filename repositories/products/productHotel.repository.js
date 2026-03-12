const { ProductHotel,  ProductHotelFaciility} = require("../../models");

class ProductHotelRepository {
  async createMany(payload, options = {}) {
    return await ProductHotel.bulkCreate(payload, options );
  }
  async findByProduct(productId) {
    return await ProductHotel.findAll({
      // include: [
      //   {
      //     model: ProductHotelFaciility,
      //     through: {attributes: []}
      //   }
      // ],
      where: { product_id: productId },
    });
  }
  async deleteByProduct(productId, options = {}) {
    return await ProductHotel.destroy({
      where: { product_id: productId },
      options,
    });
  }
}

module.exports = new ProductHotelRepository();
