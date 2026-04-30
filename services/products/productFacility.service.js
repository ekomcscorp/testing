const ProductFacilityRepository = require("../../repositories/products/productFacility.repository");

class ProductFacilityService {

    async getFacility() {
        return await ProductFacilityRepository.findByProduct();
    }

    async createFacility(facilities, productId, transaction) {
        let validateFacilities = facilities;
        if (typeof facilities === "string") validateFacilities = JSON.parse(facilities);
        if(!Array.isArray(validateFacilities)) validateFacilities = validateFacilities ? [validateFacilities] : [];

        if(validateFacilities.length === 0) return [];

        const facilityPayload = validateFacilities.map(f => ({
            product_id: productId, 
            facility: f.facility, 
            type: f.type
        }))
        return await ProductFacilityRepository.createMany(facilityPayload, transaction);
    }
    
    async replaceFacility(productId, facilities, transaction = null) {
        if (!facilities || facilities.length === 0) return [];

        await ProductFacilityRepository.deleteByProduct(productId, {transaction});

        const facilityPayload = facilities.map(f => ({
            product_id: productId, 
            facility: f.facility, 
            type: f.type
        }));

        return await ProductFacilityRepository.create(facilityPayload, {transaction});
    }
}

module.exports = new ProductFacilityService();