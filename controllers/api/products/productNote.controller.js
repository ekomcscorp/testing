const productNoteRepository = require("../../../repositories/products/productNote.repository");
const ProductService = require("../../../services/products/product.service");

class ProductNoteController {
    async getNotesByProduct(req, res){
            try{
                const notes = await productNoteRepository.findByProduct(req.params.id);
                res.json({ success: true, data: notes});
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        }
        
    async createNotes(req, res) {
        const t = sequelize.transaction();

        try {
            const {notes, ...productPayload} = req.body;
            const product = await ProductService.createProduct(productPayload, t);

            await productNoteRepository.createNotes(notes, product.id, t);

            await t.commit();

            res.status(201).json({ success: true, data: product });
        } catch(err) {
            await t.rollback();
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new ProductNoteController();