const ProductService = require("../../../services/products/product.service");
const productSnKRepository = require("../../../repositories/products/productSnK.repository");

class ProductSnKController {
    async getSnkByProduct(req, res){
                try{
                    const snk = await productSnKRepository.findByProduct(req.params.id);
                    res.json({ success: true, data: snk});
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, message: "Internal Server Error" });
                }
            }
    async createsnks(req, res) {
        const t = sequelize.transaction();

        try {
            const {snks, ...productPayload} = req.body;
            const product = await ProductService.createProduct(productPayload, t);

            await productSnKRepository.create(snks, product.id, t);

            await t.commit();

            res.status(201).json({ success: true, data: product });
        } catch(err) {
            await t.rollback();
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}                   
module.exports = new ProductSnKController();