const { where } = require("sequelize");
const { ProductHotelFacility } = require("../../models");

class ProductHotelFacilityRepository {
async get(product_hotel_id) {
 return ProductHotelFacility.findAll({
    where: {product_hotel_id}});
  }  
  // async create(payload, transaction = null) {
  //   return ProductHotelFacility.create(payload, { transaction });
  // }

  async bulkCreate(payloads, transaction = null) {
    return ProductHotelFacility.bulkCreate(payloads, { transaction });
  }

  async deleteByProduct(productHotelId, transaction = null) {
    return ProductHotelFacility.destroy({
      where: { product_hotel_id: productHotelId },
      transaction
    });
  }
}

module.exports = new ProductHotelFacilityRepository();
