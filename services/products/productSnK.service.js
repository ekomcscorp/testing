const ProductSnKRepository = require("../../repositories/products/productSnK.repository");

class ProductSnKService {
    async getSnK() {
        return await ProductSnKRepository.findByProduct();
    }
    async createSnK(snks, product_idId, transaction) {
        let validateSnks = snks;
        if (typeof snks === "string") validateSnks = JSON.parse(snks);
        if(!Array.isArray(validateSnks)) validateSnks = validateSnks ? [validateSnks] : [];

        if(validateSnks.length === 0) return [];
        const snkPayload = validateSnks.map(s => ({
            product_id: product_idId,
            name: s.snk
        }));

        return await ProductSnKRepository.createMany(snkPayload, transaction);
    }
    async replaceSnK(productId, snks, transaction = null) {
        if (!snks || snks.length === 0) return [];

        await ProductSnKRepository.deleteByProduct(productId, transaction);

        const snkPayload = snks.map(s => ({
            product_id: productId,
            snk: s.snk
        }));

        return await ProductSnKRepository.create(snkPayload, transaction);
    }
}

module.exports = new ProductSnKService();