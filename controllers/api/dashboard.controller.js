const response = require('../../utils/response');
const ProductRepository = require('../../repositories/products/product.repository');
const UserRepository = require('../../repositories/user.repository');
const TransactionRepository = require('../../repositories/transactions/transaction.repository');
const { Transaction } = require('../../models');

class DashboardController {
  async getStats(req, res) {
    try {
      const [totalProducts, totalUsers] = await Promise.all([
        ProductRepository.countAll(),
        UserRepository.countAll(),
      ]);

      // Pending orders (status PENDING)
      const pendingOrders = await Transaction.count({ where: { status: 'PENDING' } });

      return response.success(res, 'Dashboard stats fetched', {
        totalProducts: totalProducts || 0,
        totalUsers: totalUsers || 0,
        pendingOrders: pendingOrders || 0,
      });
    } catch (err) {
      return response.error(res, err.message);
    }
  }
}

module.exports = new DashboardController();
