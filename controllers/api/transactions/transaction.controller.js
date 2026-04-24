const response = require("../../../utils/response");
const transactionService = require("../../../services/transactions/transaction.service");
const transactionRepo = require("../../../repositories/transactions/transaction.repository")

class TransactionController {
  // Gunakan Service untuk mengambil data
  async getAllTransactions(req, res) {
    try {
      // Logic ambil semua data
      const result = await transactionRepo.getAllTransactions(); 
      return response.success(res, "Data berhasil diambil", result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }
  async getTransactionById(req, res) {
    try{
      const result = await transactionRepo.getTransactionById();
      return response.success(res, "Data berhasil diambil", result)
    } catch (error) {
      return response.error(res, error.message)
    }
  }
  async getAllTransactionDatatables(req, res) {
    try {
      const { akses } = res.locals;
      if (akses.view_level?.trim() !== "Y") {
        return response.error(res, "Akses ditolak", 403);
      }

      const result = await transactionService.getAllTransactionDatatables(req.query);

      // Mapping akses ke dalam data (Logic UI)
      const data = result.data.map((row) => ({
        ...row.get({ plain: true }),
        akses: {
          edit: akses.edit_level === "Y",
          delete: akses.delete_level === "Y",
        },
      }));

      return res.status(200).json({
        ...result,
        data
      });
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async createTransaction(req, res) {
    try {
      // Validasi session user terlebih dahulu
      if (!req.session || !req.session.user || !req.session.user.id) {
        return response.error(res, "Silakan login terlebih dahulu", 401);
      }

      const { items, payment_method } = req.body;
      const user_id = req.session.user.id; // Ambil dari session agar lebih aman

      if (!items || !Array.isArray(items) || items.length === 0) {
        return response.error(res, "Keranjang belanja kosong");
      }

      // Kirim ke service dengan format yang seragam
      const result = await transactionService.checkout({
        user_id,
        items, // Array berisi { product_id, room_type }
        payment_method
      });

      return response.success(res, "Transaksi berhasil dibuat", result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async renderDetailPage(req, res) {
    try {
        const { id } = req.params;
        // Gunakan Repo yang sudah kita buat sebelumnya
        // Ingat: findByPk ini sudah include TransactionDetail (snapshot)
        const transaction = await transactionRepo.getTransactionById(id);

        if (!transaction) {
            return res.status(404).send("Transaksi tidak ditemukan");
        }

        if (transaction.details && transaction.details.length > 0) {
            transaction.details.forEach(detail => {
                if (typeof detail.flights_snapshot === 'string') {
                    detail.flights_snapshot = JSON.parse(detail.flights_snapshot);
                }
                if (typeof detail.hotels_snapshot === 'string') {
                    detail.hotels_snapshot = JSON.parse(detail.hotels_snapshot);
                }
                if (typeof detail.travel_snapshot === 'string') {
                    detail.travel_snapshot = JSON.parse(detail.travel_snapshot);
                }
            });
        }

        // Render file EJS dan kirim variabel 'data'
       res.render("transactions/detail_transaction", { data: transaction });
    } catch (error) {
        res.status(500).send(error.message);
    }
} 
  async deleteTransaction(req, res){
    try { 
      const {id} = req.params;

      const deleted = await transactionRepo.deleteTransaction(id);
      return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            data: deleted,
          });
    } catch (error) {
      return response.error(res, error.message);
    }
  }
}

module.exports = new TransactionController();