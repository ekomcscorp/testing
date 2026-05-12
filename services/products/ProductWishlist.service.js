const repository = require("../../repositories/products/productWishlist.repository");

class ProductWishlistService {

  async addToWishlist(userId, productId) {
    const existing = await repository.getWishlist(userId, productId);

    if (existing) {
      throw new Error("Product already in wishlist");
    }

    return await repository.createWishlist(userId, productId);
  }

  async removeFromWishlist(userId, productId) {
    const wishlist = await repository.getWishlist(userId, productId);

    if (!wishlist) {
      throw new Error("Wishlist item not found");
    }

    await repository.deleteWishlist(userId, productId);

    return {
      message: "Removed from wishlist"
    };
  }

  async getUserWishlist(userId) {
    return await repository.getUserWishlist(userId);
  }

  async isInWishlist(userId, productId) {
    const wishlist = await repository.getWishlist(userId, productId);

    return !!wishlist;
  }
}

module.exports = new ProductWishlistService();