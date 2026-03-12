const FacilityRepo = require(
  "../../repositories/products/productHotelFacility.repository"
);

class ProductHotelFacilityService {
  async getHotelFacility() {
    return await fi
  }
  async replace(productHotelId, facilities, transaction) {
    await FacilityRepo.deleteByProduct(productHotelId, transaction);

    if (!facilities?.length) return [];

    const payloads = facilities.map(name => ({
      product_hotel_id: productHotelId,
      name
    }));

    return FacilityRepo.bulkCreate(payloads, transaction);
  }
}

module.exports = new ProductHotelFacilityService();
