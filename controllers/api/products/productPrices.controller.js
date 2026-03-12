const productPriceRepository = require('../../../repositories/products/productPrices.repository');

class ProductPricesController {
  async store(req, res) {
    try {
      const { id: productId } = req.params;
      const { prices } = req.body;

      /**
       * prices = [
       *   { room_type: "QUAD", price: 25900000 },
       *   { room_type: "TRIPLE", price: 27000000 },
       *   { room_type: "DOUBLE", price: 28900000 }
       * ]
       */

      if (!Array.isArray(prices) || prices.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Harga tidak boleh kosong",
        });
      }

      await productPriceRepository.deleteByProduct(productId);
      const result = await productPriceRepository.createMany(productId, prices);

      res.json({
        status: "success",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  async index(req, res) {
    try {
      const { id: productId } = req.params;
      const prices = await productPriceRepository.findByProduct(productId);

      res.json({
        status: "success",
        data: prices,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }
};



module.exports = new ProductPricesController();