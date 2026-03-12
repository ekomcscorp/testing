const { sequelize } = require("../../../models");
const ProductService = require("../../../services/products/product.service");
const productFlightRepository = require("../../../repositories/products/productFlight.repository");

class ProductFlightController {
    async getFlightsByProduct(req, res) {
        try{
            const flights = await productFlightRepository.findByProduct(req.params.id);
            res.json({ success: true, data: flights});
        } catch(error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async createFlights(req, res) {
        const t = sequelize.transaction();

        try {
            const {flights, ...productPayload} = req.body;
            const product = await ProductService.createProduct(productPayload, t);

            await productFlightRepository.createFlights(flights, product.id, t);

            await t.commit();

            res.status(201).json({ success: true, data: product });
        } catch(err) {
            await t.rollback();
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async deleteFlights(req, res) {
        const t = sequelize.transaction();

        try{
            const {id} = req.params;
            const deleted = await productFlightRepository.deleteByProduct(id);

            if(!deleted){
                return res.status(404).json({ success: false, message: "Product not found" });
            }
        } catch(err) {
            await t.rollback();
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new ProductFlightController();