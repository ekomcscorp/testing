const ProductService = require("../../../services/products/product.service");
const productHotelRepository = require("../../../repositories/products/productHotel.repository");

class ProductHotelController {
    async getHotelByProduct(req, res){
        try{
            const hotels = await productHotelRepository.findByProduct(req.params.id);
            res.json({ success: true, data: hotels});
        } catch(error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error"});
        }
    }
    async createHotels(req, res) {
        const t = sequelize.transaction();

        try {
            const {hotels, ...productPayload} = req.body;
            const product = await ProductService.createProduct(productPayload, t);

            await productHotelRepository.createHotels(hotels, product.id, t);

            await t.commit();

            res.status(201).json({ success: true, data: product });
        } catch(err) {
            await t.rollback();
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new ProductHotelController();