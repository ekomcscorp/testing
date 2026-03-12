const TransactionRepository = require("../../repositories/transactions/transaction.repository");

class TransactionService {
    async getAllTransactions() {
        const transactions = await TransactionRepository.getAllTransactions();
        return transactions || [];
    }
    
    async getTransactionById(id) {
        try{
            const transaction = await TransactionRepository.getTransactionById(id);
            return transaction || null;
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getAllTransactionDatatables({ draw, start, length, search, order, columns}) {
        const searchValue = search?.value || "";

        const { count, rows } = await TransactionRepository.getPaginatedTransaction({
            start: parseInt(start, 10) || 0,
            length: parseInt(length, 10) || 10,
            search: searchValue,
            order,
            columns
        });

        return {
            draw: parseInt(draw, 10),
            recordsTotal: count,
            recordsFiltered: count,
            data: rows
        }
    }

    async createTransaction(transactionData) {
        try {
            const requiredFields = ["name", "transaction_date", "amount"];
            
            if (!requiredFields.every(field => transactionData[field])) {
                throw new Error("Semua field wajib diisi"); // Validasi input
            }

            const newTransaction = await TransactionRepository.createTransaction(transactionData);
            return newTransaction;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateTransaction(id, transactionData) {
        try { 
            const transaction = await TransactionRepository.updateTransaction(id);
            if(!transaction){
                throw new Error("Transaksi tidak ditemukan");
            }
            await TransactionRepository.updateTransaction(id, transactionData);
            return { message: "Transaksi berhasil diperbarui" };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteTransaction(id){
        try {
            const transaction = await TransactionRepository.getTransactionById(id);
            if(!transaction){
                throw new Error("Transaksi tidak ditemukan");
            }
            await TransactionRepository.deleteTransaction(id);
            return { message: "Transaksi berhasil dihapus" };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new TransactionService();