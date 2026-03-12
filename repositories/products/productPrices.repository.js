const { ProductPrices } = require("../../models")

class ProductPricesRepository {
    async createMany(payload, options={}){
        return await ProductPrices.bulkCreate(payload, options)
    }

    async findByProduct(productId){
        return await ProductPrices.findAll({
            where: { product_id: productId }
        })
    }

    async deleteByProduct(productId, options = {}){
        return await ProductPrices.destroy({
            where: { product_id: productId },
            ...options
        })
    }
}

module.exports = new ProductPricesRepository();
