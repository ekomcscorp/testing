const ProductService = require("../../../services/products/product.service");
const productFacilityRepository = require("../../../repositories/products/productFacility.repository");

class ProductFacilityController {
    async getFacilitiesByProduct(req, res){
        try{
            const facilities = await productFacilityRepository.findByProduct(req.params.id);
            res.json({ success: true, data: facilities});
        } catch(error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async createFacilities(req, res) {
        const t = sequelize.transaction();

        try {
            const {facilities, ...productPayload} = req.body;
            const product = await ProductService.createProduct(productPayload, t);

            await productFacilityRepository.createFacility(facilities, product.id, t);

            await t.commit();

            res.status(201).json({ success: true, data: product });
        } catch(err) {
            await t.rollback();
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new ProductFacilityController();