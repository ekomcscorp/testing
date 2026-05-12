const productWishlistService = require("../../../services/products/ProductWishlist.service");
const { success, created, error, notFound } = require("../../../utils/response");

class ProductWishlistController {

  async addToWishlist(req, res) {
    try {
      const { product_id } = req.body;
      const userId = req.user.id;

      if (!userId) {
        return error(res, "User not authenticated", 401);
      }

      if (!product_id) {
        return error(res, "Product ID is required", 422);
      }

      const wishlist = await productWishlistService.addToWishlist(userId, product_id);
      return created(res, "Added to wishlist", wishlist);
    } catch (err) {
      console.error("Add to wishlist error:", err);
      return error(res, err.message, 400);
    }
  }


  async removeFromWishlist(req, res) {
    try {
      const { product_id } = req.params;
      const userId = req.user.id;

      if (!userId) {
        return error(res, "User not authenticated", 401);
      }

      if (!product_id) {
        return error(res, "Product ID is required", 422);
      }

      const result = await productWishlistService.removeFromWishlist(userId, product_id);
      return success(res, result.message, result);
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      return error(res, err.message, 400);
    }
  }


  async getMyWishlist(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return error(res, "User not authenticated", 401);
      }

      const wishlists = await productWishlistService.getUserWishlist(userId);
      return success(res, "Wishlist fetched successfully", wishlists);
    } catch (err) {
      console.error("Get wishlist error:", err);
      return error(res, err.message, 500);
    }
  }


  async checkWishlist(req, res) {
    try {
      const { product_id } = req.params;
      const userId = req.user.id;

      if (!userId) {
        return error(res, "User not authenticated", 401);
      }

      if (!product_id) {
        return error(res, "Product ID is required", 422);
      }

      const isInWishlist = await productWishlistService.isInWishlist(userId, product_id);
      return success(res, "Wishlist status retrieved", { 
        product_id, 
        isInWishlist 
      });
    } catch (err) {
      console.error("Check wishlist error:", err);
      return error(res, err.message, 500);
    }
  }

  async toggleWishlist(req, res) {
    try {
      const { product_id } = req.body;
      const userId = req.user.id;

      if (!userId) {
        return error(res, "User not authenticated", 401);
      }

      if (!product_id) {
        return error(res, "Product ID is required", 422);
      }

      const isInWishlist = await productWishlistService.isInWishlist(userId, product_id);

      let result;
      if (isInWishlist) {
        result = await productWishlistService.removeFromWishlist(userId, product_id);
        return success(res, "Removed from wishlist", { 
          action: "removed",
          ...result 
        });
      } else {
        result = await productWishlistService.addToWishlist(userId, product_id);
        return created(res, "Added to wishlist", { 
          action: "added",
          ...result 
        });
      }
    } catch (err) {
      console.error("Toggle wishlist error:", err);
      return error(res, err.message, 400);
    }
  }
}

module.exports = new ProductWishlistController();
