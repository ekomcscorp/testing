const response = require("../../../utils/response");
const transactionService = require("../../../services/transactions/transaction.service");
const transactionRepo = require("../../../repositories/transactions/transaction.repository");

class TransactionController {
  // ==========================================
  // 1. GET ALL TRANSACTIONS (RAW & DATATABLES)
  // ==========================================
  async getAllTransactions(req, res) {
    try {
      const result = await transactionRepo.getAllTransactions();
      return response.success(res, "Data berhasil diambil", result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      const result = await transactionRepo.getTransactionById(id);
      return response.success(res, "Data berhasil diambil", result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getAllTransactionDatatables(req, res) {
    try {
      const { akses } = res.locals;
      if (akses.view_level?.trim() !== "Y") {
        return response.error(res, "Akses ditolak", 403);
      }

      const result = await transactionService.getAllTransactionDatatables(req.query, req.user);

      const data = result.data.map((row) => ({
        ...row.get({ plain: true }),
        akses: {
          edit: akses.edit_level === "Y",
          delete: akses.delete_level === "Y",
        },
      }));

      return res.status(200).json({
        success: true,
        message: "Transactions fetched successfully",
        draw: result.draw,
        recordsTotal: result.recordsTotal,
        recordsFiltered: result.recordsFiltered,
        data
      });
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  // ==========================================
  // 2. CHECKOUT REGULER & CICILAN
  // ==========================================
  async createTransaction(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return response.error(res, "Silakan login terlebih dahulu", 401);
      }

      const user_id = req.user.id;
      let { items, payment_method, payment_selection, paymentSelection } = req.body;

      let resolvedPaymentSelection = payment_selection || paymentSelection || null;
      if (typeof resolvedPaymentSelection === 'string') {
        try {
          resolvedPaymentSelection = JSON.parse(resolvedPaymentSelection);
        } catch (e) {
          // Abaikan jika bukan JSON string
        }
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return response.error(res, "Keranjang belanja kosong", 400);
      }

      const result = await transactionService.checkout({
        user_id,
        items,
        payment_method,
        payment_selection: resolvedPaymentSelection
      });

      return response.success(res, "Transaksi berhasil dibuat", result, 201);
    } catch (error) {
      console.error('[CHECKOUT CONTROLLER ERROR]:', error);
      return response.error(res, error.message);
    }
  }

  async createInstallmentTransaction(req, res) {
    try { 
      if (!req.user || !req.user.id) {
        return response.error(res, "Silakan login terlebih dahulu", 401);
      }

      const user_id = req.user.id;
      // 💡 due_dates dihapus dari destructuring req.body
      let { items, payment_method, payment_selection, paymentSelection } = req.body;

      // Normalisasi payment_selection
      let resolvedPaymentSelection = payment_selection || paymentSelection || null;
      if (typeof resolvedPaymentSelection === 'string') {
        try {
          resolvedPaymentSelection = JSON.parse(resolvedPaymentSelection);
        } catch (e) {
          // Abaikan parse error
        }
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return response.error(res, "Keranjang belanja kosong", 400);
      }

      // 💡 Hapus validasi "due_dates wajib diisi" di controller

      // Panggil service tanpa mengirimkan due_dates
      const result = await transactionService.checkoutInstallment({
        user_id,
        items,
        payment_method,
        payment_selection: resolvedPaymentSelection
      });

      return response.success(res, "Transaksi cicilan berhasil dibuat", result, 201);
    } catch (error) {
      console.error('[CHECKOUT INSTALLMENT CONTROLLER ERROR]:', error);
      return response.error(res, error.message);
    }
  }

  // ==========================================
  // 3. UPLOAD BUKTI PEMBAYARAN (REGULER & TERMIN)
  // ==========================================
  async uploadPayment(req, res) {
    try {
      const { id } = req.params;
      let evidence_url = null;

      if (req.file) {
        evidence_url = req.file.filename;
      } else if (req.body.evidence_url) {
        evidence_url = req.body.evidence_url;
      }

      if (!evidence_url) {
        return response.error(res, "Bukti transfer wajib diunggah", 400);
      }

      const result = await transactionService.updatePayment(id, {
        evidence_url,
        status: "PENDING"
      });

      return response.success(res, "Pembayaran berhasil diperbarui", result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async uploadInstallmentPayment(req, res) {
    try {
      const { installment_id } = req.params;
      let evidence_url = null;

      // Mendukung via Multer Upload File atau JSON Body (URL)
      if (req.file) {
        evidence_url = req.file.filename;
      } else if (req.body.evidence_url) {
        evidence_url = req.body.evidence_url;
      }

      if (!evidence_url) {
        return response.error(res, "Bukti pembayaran wajib diunggah", 400);
      }

      const result = await transactionService.updateInstallmentPayment(installment_id, {
        evidence_url,
        payment_method: req.body.payment_method || 'TRANSFER'
      });

      return response.success(res, "Bukti pembayaran termin berhasil diunggah", result);
    } catch (error) {
      console.error('[UPLOAD INSTALLMENT CONTROLLER ERROR]:', error);
      return response.error(res, error.message);
    }
  }

  // ==========================================
  // 4. VERIFIKASI & APPROVAL ADMIN
  // ==========================================
  async approvePayment(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body || {};
      const nextStatus = status === 'FAILED' ? 'FAILED' : 'SUCCESS';

      const result = await transactionService.updateStatus(id, nextStatus);
      const message = nextStatus === 'FAILED'
        ? "Status transaksi berhasil ditolak"
        : "Status transaksi berhasil diperbarui menjadi SUCCESS";

      return response.success(res, message, result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async updateInstallmentStatus(req, res) {
    try {
      const { installment_id } = req.params;
      const { status } = req.body;

      // 💡 Untuk MVP Simpel, Admin hanya melakukan APPROVE ke 'SUCCESS'

      const result = await transactionService.updateInstallmentStatus(installment_id, status);
      return response.success(res, `Status berhasil berubah!`, result);
    } catch (error) {
      console.error('[UPDATE INSTALLMENT STATUS CONTROLLER ERROR]:', error);
      return response.error(res, error.message);
    }
  }
  // ==========================================
  // 5. USER & RENDER ACTIONS
  // ==========================================
  async renderDetailPage(req, res) {
    try {
      const { id } = req.params;
      const transaction = await transactionRepo.getTransactionById(id);

      if (!transaction) {
        return res.status(404).send("Transaksi tidak ditemukan");
      }

      res.render("transactions/detail_transaction", { transaction });
    } catch (error) {
      console.error("Error rendering detail page:", error);
      res.status(500).send("Error: " + error.message);
    }
  }

  async deleteTransaction(req, res) {
    try {
      const { id } = req.params;
      const deleted = await transactionService.deleteTransaction(id);
      return response.success(res, "Transaction deleted successfully", deleted);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getMyTransactions(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return response.error(res, "Silakan login terlebih dahulu", 401);
      }

      const result = await transactionService.getMyTransactions(req.user.id);
      return response.success(res, "Data transaksi Anda berhasil diambil", result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }
}

module.exports = new TransactionController();