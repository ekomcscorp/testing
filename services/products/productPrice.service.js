const ProductPriceRepository = require("../../repositories/products/productPrices.repository");

class ProductPriceService {
    async getPrices() {
        return await ProductPriceRepository.findByProduct();
    }

    async createPrices(productId, prices, transaction) {
        let validatePrices = prices;
        if (typeof prices === "string") validatePrices = JSON.parse(prices);
        if(!Array.isArray(validatePrices)) validatePrices = validatePrices ? [validatePrices] : [];

        if(validatePrices.length === 0) return [];

        const pricePayload = validatePrices.map(p => ({
            product_id: productId,
            price: p.price,
            room_type: p.room_type
        }));
        return await ProductPriceRepository.createMany(pricePayload, transaction);
    }

}

module.exports = new ProductPriceService();