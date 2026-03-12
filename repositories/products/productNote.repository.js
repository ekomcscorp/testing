const { ProductNote } = require('../../models');

class ProductNoteRepository {

    async createMany(payload, options={}) {
        return await ProductNote.bulkCreate(payload, options);
    }

    async findByProduct(productId) {
        return await ProductNote.findAll({
            where: { product_id: productId }
        });
    }

    async deleteByProduct(productId, options={}) {
        return await ProductNote.destroy({
            where: { product_id: productId },
            ...options
        });
    }
    
}

module.exports = new ProductNoteRepository();