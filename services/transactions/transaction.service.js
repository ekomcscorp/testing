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

    async getAllTransactionDatatables(query) {
        const { draw, start, length, search, order, columns} = query;
        const searchValue =
            query.search?.value ||
            query['search[value]'] ||
            "";

        const [result, totalCount] = await Promise.all ([ TransactionRepository.getPaginatedTransaction({
            start: parseInt(start, 10) || 0,
            length: parseInt(length, 10) || 10,
            search: searchValue,
            order,
            columns
        }),
        TransactionRepository.countAll(),
    ]);

        return {
            draw: parseInt(draw, 10),
            recordsTotal: totalCount,
            recordsFiltered: result.count,
            data: result.rows
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
            const transaction = await TransactionRepository.getTransactionById(id);
            if(!transaction){
                throw new Error("Transaksi tidak ditemukan");
            }
            await TransactionRepository.updateTransaction(id, transactionData);
            return {message: "Transaksi berhasil diupdate"};
    }

    async deleteTransaction(id){
            const transaction = await TransactionRepository.getTransactionById(id);
            if(!transaction){
                throw new Error("Transaksi tidak ditemukan");
            }
            await TransactionRepository.deleteTransaction(id);
            return { message: "Transaksi berhasil dihapus" };
    }
}

module.exports = new TransactionService();