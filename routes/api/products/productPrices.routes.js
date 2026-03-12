const express = require("express");
const router = express.Router();
const { injectUser } = require ('../../../middleware/index.js');
const productPriceController = require("../../../controllers/api/products/productPrices.controller.js");

router.post("/products/:id/prices", injectUser, productPriceController.store);
router.get("/products/:id/prices", productPriceController.index);

module.exports = router;