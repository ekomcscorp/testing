const express = require("express");
const { injectUser } = require ('../../../middleware/index.js');
const productWishlistController = require("../../../controllers/api/products/productWishlist.controller.js");
const {ensureAuthToken} = require("../../../middleware/authJwt.js");
const router = express.Router();

router.get("/wishlist",ensureAuthToken , productWishlistController.getMyWishlist);
router.post("/wishlist", ensureAuthToken ,productWishlistController.addToWishlist);
router.delete("/wishlist/:product_id", ensureAuthToken , productWishlistController.removeFromWishlist);

module.exports = router;