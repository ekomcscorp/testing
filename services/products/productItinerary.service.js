const ProductItineraryRepository = require("../../repositories/products/productItinerary.repository");

class ProductItineraryService {
    async getItinerary() {
        return await ProductItineraryRepository.findByProduct();
    }

    async createItinerary(itineraries, productId, transaction) {
        let validateItineraries = itineraries;
        if (typeof itineraries === "string") validateItineraries = JSON.parse(itineraries);
        if(!Array.isArray(validateItineraries)) validateItineraries = validateItineraries ? [validateItineraries] : [];

        if(validateItineraries.length === 0) return [];

        const itineraryPayload = validateItineraries.map(i => ({
            product_id: productId, 
            day_order: i.day_order, 
            activity: i.activity,
            description: i.description
        }))
        return await ProductItineraryRepository.createMany(itineraryPayload, transaction);
    }
    async replaceItinerary(productId, itineraries, transaction = null) {
        if (!itineraries || itineraries.length === 0) return [];

        await ProductItineraryRepository.deleteByProduct(productId, transaction);

        const itineraryPayload = itineraries.map(i => ({
            product_id: productId, 
            day: i.day, 
            activity: i.activity,
            description: i.description
        }));

        return await ProductItineraryRepository.create(itineraryPayload, transaction);
    }
}

module.exports = new ProductItineraryService();