const { ProductSnK } = require("../../models")

class ProductSnKRepository {
    async createMany(payload, options = {}){
        return await ProductSnK.bulkCreate(payload, options);
    }
    async findByProduct(productId){
        return await ProductSnK.findAll({
            where: { product_id: productId }
        });
    }
    async deleteByProduct(productId, options = {}){
        return await ProductSnK.destroy({
            where: { product_id: productId },
            ...options
        })
    }
}

module.exports = new ProductSnKRepository