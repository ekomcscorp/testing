const response = require("../../../utils/response");
const transactionService = require("../../../services/transactions/transaction.service");

class TransactionController {
    async getAllTransactions(req, res){
        try {
            const transaction = await transactionService.getAllTransactions();
            return response.success(res, 'All transactions fetched', transaction);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    async getTransactionById(req, res){
        try {
            const { id } = req.params;
            const transaction = await transactionService.getTransactionById(id);
            return res.status(200).json({
                success: true,
                message: "Transaction fetched successfully",
                data: transaction
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching transaction",
                error: error.message
            });
        }
    }

    async getAllTransactionDatatables(req, res) {
        try {
            const { akses } = res.locals;

           if (akses.view_level?.trim() !== 'Y') {
              return res.status(403).json({ error: "Akses ditolak" });
            }

            const result = await transactionService.getAllTransactionDatatables(req.query);
            // result.data = result.data.map(row => ({
            //     ...row.get({ plain: true }),
            //     akses: {
            //         edit: akses.edit_level === "Y",
            //         delete: akses.delete_level === "Y"
            //     }
            // }));
            const data = result.data.map(row => ({
                ...row.get({ plain: true }),
                akses: {
                    edit: akses.edit_level === "Y",
                    delete: akses.delete_level === "Y"
                }
            }))

            return res.status(200).json({
              success: true,
              message: "Transaction fetched successfully",
              data: data,
              draw: result.draw,
              recordsTotal: result.recordsTotal,
              recordsFiltered: result.recordsFiltered
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
            const transaction = await transactionService.createTransaction(req.body);
            return response.success(res, 'Transaction created', transaction);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    async updateTransaction(req, res) {
        try {
            const { id } = req.params
            // const transaction = await transactionService.getTransactionById(id);
            // if(!transaction){
            //     return res.status(404).json({
            //         success: false,
            //         message: "Transaction not found"
            //     })
            // }

            const update = await transactionService.updateTransaction(id, req.body);
            return res.status(200).json({
                success: true,
                message: "Transaction updates successfully",
                data: update
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Error updating transaction"
            });
        }
    }

    async deleteTransaction(req, res) {
        try {
            const { id } = req.params;
            // const transaction = await transactionService.getTransactionById(id);

            // if(!transaction) {
            //     return res.status(404).json({
            //         success: false,
            //         message: "Transaksi tidak ditemukan"
            //     })
            // }

            const deleted = await transactionService.deleteTransaction(id);
            return res.status(200).json({
                success: true,
                message: "Transaksi berhasil dihapus",
                data: deleted
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error deleting transaction",
                error: error.message
            })
            }
        }
    }


module.exports = new TransactionController();