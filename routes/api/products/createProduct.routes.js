const express = require("express");
const router = express.Router();
const { injectUser } = require ('../../../middleware/index.js');
const productController = require("../../../controllers/api/products/product.controller.js");

router.get("/", productController.getAllProduct);
router.get("/:id", productController.getProductById);
router.put("/:id", injectUser, productController.updateProduct);
router.delete("/:id", injectUser, productController.deleteProduct);


module.exports = router;
