const {ProductFlight} = require("../../models")

class ProductFlightRepository {

    async createMany(payload, options = {}){
         return await ProductFlight.bulkCreate(payload, options);
    }
    async findByProduct(productId) {
        return await ProductFlight.findAll({
        where: { product_id: productId }
        });
    }

    async deleteByProduct(productId, options) {
        return await ProductFlight.destroy({
        where: { product_id: productId },
        ...options
         });
    }
    
}

module.exports = new ProductFlightRepository();