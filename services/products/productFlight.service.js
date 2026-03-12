const ProductFlightRepository = require("../../repositories/products/productFlight.repository");


class ProductFlightService {

    async getFlights() {
        return await ProductFlightRepository.findByProduct();
    }

    async createFlights(productId, flights, transaction) {
        let validateFlights = flights;
        if (typeof flights === "string") validateFlights = JSON.parse(flights);
        if(!Array.isArray(validateFlights)) validateFlights = validateFlights ? [validateFlights] : [];

        if(validateFlights.length === 0) return [];

        const flightPayload = validateFlights.map(f => ({

            product_id: productId, 
            airline_name: f.airline_name, 
            type: f.type
            
        }))

        return await ProductFlightRepository.createMany(flightPayload, transaction);
    }

    async replaceFlight(productId, flights, transaction = null) {
        if (!flights || flights.length === 0) return [];

        await ProductFlightRepository.deleteByProduct(productId, transaction);

        const flightPayload = flights.map(f => ({

            product_id: productId, 
            airline_name: f.airline_name, 
            type: f.type
            
        }));

        return await ProductFlightRepository.create(flightPayload, transaction);
    }
}

module.exports = new ProductFlightService();