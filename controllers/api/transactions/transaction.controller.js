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
            return response.success(res, 'Transaction fetched', transaction);
        } catch (error) {
            return response.notFound(res, error.message);
        }
    }

    async getAllTransactionDatatables(req, res) {
        try {
            const { akses } = res.locals;

            if(akses.view_level !== "Y"){
                return res.status(403).json({ error: "Akses ditolak" });
            }

            const result = await transactionService.getAllTransactionDatatables(req.query);
            result.data = result.data.map(row => ({
                ...row.get({ plain: true }),
                akses: {
                    edit: akses.edit_level === "Y",
                    delete: akses.delete_level === "Y"
                }
            }));

            return response.datatables(res, result);
        } catch (error) {
            console.error("Error getAllTransactionsDatatables:", error);
            return response.error(res, error.message);
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
            const transaction = await transactionService.updateTransaction(id, req.body);
            return response.success(res, 'Transaction updated', transaction);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    async deleteTransaction(req, res) {
        try {
            const { id } = req.params;
            const transaction = await transactionService.deleteTransaction(id);
            return response.success(res, 'Transaction deleted', transaction);
        } catch (error) {
            return response.error(res, error.message);
        }
    }
}

module.exports = new TransactionController();