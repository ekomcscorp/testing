const ProductHotelRepository = require('../../repositories/products/productHotel.repository');

class ProductHotelService {
    async getHotels() {
      return await ProductHotelRepository.findByProduct();
    }
    
    async createHotels(hotels, productId, transaction) {
        let validateHotels = hotels;
        if (typeof hotels === "string") validateHotels = JSON.parse(hotels);
        if(!Array.isArray(validateHotels)) validateHotels = validateHotels ? [validateHotels] : [];

        if(validateHotels.length === 0) return [];

        const hotelPayload = validateHotels.map(h => ({
            product_id: productId,
            name: h.name,
            city: h.city,
            rating: h.rating,
            jarak: h.jarak,
            image: h.image,
            facilities: h.facilities
        }));

        if (hotels.facilities?.length) {
        await FacilityService.replace(
          createdHotel.id,
          hotels.facilities,
          transaction
        );
      }


        return await ProductHotelRepository.createMany(hotelPayload, transaction);
    }

    async replaceHotels(productId, hotels, transaction = null) {
        if (!hotels || hotels.length === 0) return [];

        await ProductHotelRepository.deleteByProduct(productId, transaction);

        const hotelPayload = hotels.map(h => ({
            product_id: productId,
            name: h.name,
            city: h.city,
            rating: h.rating,
            jarak: h.jarak,
            image: h.image,
        }));

        return await ProductHotelRepository.create(hotelPayload, transaction);
    }
}

module.exports = new ProductHotelService();