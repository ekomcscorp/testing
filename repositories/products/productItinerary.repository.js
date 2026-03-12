const { ProductItinerary } = require("../../models");

class ProductItineraryRepository {
    async createMany(payload, options = {}) {
        return await ProductItinerary.bulkCreate(payload,  options );
    }
    async findByProduct(productId) {
        return await ProductItinerary.findAll({
            where: { product_id: productId },
        });
    }
    async deleteByProduct(productId, options = {}) {
        return await ProductItinerary.destroy({
            where: { product_id: productId },
            ...options,
        });
    }
}

module.exports = new ProductItineraryRepository();