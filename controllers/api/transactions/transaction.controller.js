const response = require("../../../utils/response");
const transactionRepo  = require("../../../repositories/transactions/transaction.repository");

class TransactionController {
  async getAllTransactions(req, res) {
    try {
      const transaction = await transactionRepo.getAllTransactions();
      return response.success(res, "All transactions fetched", transaction || []);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      const transaction = await transactionRepo.getTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Transaction fetched successfully",
        data: transaction,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching transaction",
        error: error.message,
      });
    }
  }

  async getAllTransactionDatatables(req, res) {
    try {
      const { akses } = res.locals;
      if (akses.view_level?.trim() !== "Y") {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }

      const { draw, start, length, order, columns } = req.query;
      const search = req.query["search[value]"] || req.query.search?.value || "";

      const [result, totalCount] = await Promise.all([
        transactionRepo.getPaginatedTransaction({
          start:  parseInt(start)  || 0,
          length: parseInt(length) || 10,
          search,
          order,
          columns,
        }),
        transactionRepo.countAll(),
      ]);

      const data = result.rows.map((row) => ({
        ...row.get({ plain: true }),
        akses: {
          edit:   akses.edit_level   === "Y",
          delete: akses.delete_level === "Y",
        },
      }));

      return res.status(200).json({
        success:         true,
        message:         "Transaction fetched successfully",
        draw:            parseInt(draw) || 0,
        recordsTotal:    totalCount,
        recordsFiltered: result.count,
        data,
      });
    } catch (error) {
      console.error("Error getAllTransactionsDatatables:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching transactions",
        error: error.message,
      });
    }
  }

  async createTransaction(req, res) {
    try {
      const requiredFields = ["user_id", "product_id", "amount"];
      if (!requiredFields.every((field) => req.body[field])) {
        return response.error(res, "user_id, product_id, dan amount wajib diisi", 400);
      }

      const transaction = await transactionRepo.createTransaction(req.body);
      return response.success(res, "Transaksi berhasil dibuat", transaction);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      const existing = await transactionRepo.getTransactionById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
      }

      await transactionRepo.updateTransaction(id, req.body);
      return res.status(200).json({
        success: true,
        message: "Transaksi berhasil diupdate",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Error updating transaction",
      });
    }
  }

  async deleteTransaction(req, res) {
    try {
      const { id } = req.params;
      const existing = await transactionRepo.getTransactionById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
      }

      await transactionRepo.deleteTransaction(id);
      return res.status(200).json({
        success: true,
        message: "Transaksi berhasil dihapus",
        data: { message: "Transaksi berhasil dihapus" },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting transaction",
        error: error.message,
      });
    }
  }
}

module.exports = new TransactionController();