const { ProductFacility } = require("../../models");

class ProductFacilityRepository {
  async createMany(payload, options={} ) {
    return await ProductFacility.bulkCreate(payload,  options);
  }
  async findByProduct(productId) {
    return await ProductFacility.findAll({
      where: { product_id: productId },
    });
  }
  async deleteByProduct(productId, options  = {}) {
    return await ProductFacility.destroy({
      where: { product_id: productId },
      ...options ,
    });
  }
}

module.exports = new ProductFacilityRepository();
