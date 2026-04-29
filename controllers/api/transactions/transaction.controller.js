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
      const {id} = req.params;
      const result = await transactionRepo.getTransactionById(id);
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
        // Repository sudah otomatis parse snapshots
        const transaction = await transactionRepo.getTransactionById(id);

        if (!transaction) {
            return res.status(404).send("Transaksi tidak ditemukan");
        }

        // Snapshots sudah di-parse oleh repository
        res.render("transactions/detail_transaction", {
            transaction: transaction
        });
    } catch (error) {
        console.error("Error rendering detail page:", error);
        res.status(500).send("Error: " + error.message);
    }
  }

  async uploadPayment(req, res){
    try{
      const {id} = req.params;

      let evidence_url = null;
      let status = req.body.status || 'PENDING';

      if (req.file) {
        evidence_url = req.file.filename;
      } else if (req.body.evidence_url) {         
          evidence_url = req.body.evidence_url;
      }

      if (!evidence_url) {
            return res.status(400).json({
                status: "error",
                message: "Bukti transfer (evidence) wajib diunggah"
            });
        }

        const result = await transactionService.updatePayment(id, {
            evidence_url: evidence_url,
            status: "PENDING" // Status baru menunggu dicek admin
        });

        return res.status(200).json({
            status: "success",
            message: "Pembayaran berhasil diupdate"
        });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    
    }
  }

    async approvePayment(req, res) {
      try {
          const { id } = req.params;

          // Panggil service dengan status 'PAID' atau 'SUCCESS'
          await transactionService.updateStatus(id, 'SUCCESS');

          return res.status(200).json({
              status: "success",
              message: "Status transaksi berhasil diperbarui menjadi SUCCESS"
          });
      } catch (error) {
          return res.status(500).json({ status: "error", message: error.message });
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