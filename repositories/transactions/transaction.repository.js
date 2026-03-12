const { Model, Op } = require("sequelize"); // Import Op for Sequelize operators
const { Transaction } = require("../../models");

class TransactionRepository {
    async getAllTransactions() {
        return await Transaction.findAll();
    }

    async getPaginatedTransaction({ start, length, search, order, columns}) {
        const where = {
            ...(search && {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%`} },
                { transaction_date: { [Op.like]: `%${search}%`} },
                { transaction_no: { [Op.like]: `%${search}%`} },
                { amount: { [Op.like]: `%${search}%`} },
                { status: { [Op.like]: `%${search}%`} },

            ]
            }) 
        };

        const sort = 
            order && order.length > 0
            ? [[columns[order[0].column].data, order[0].dir]]
            : [["created_at", "DESC"]];

        const offset = start || 0; // Default ke 0 jika start tidak diberikan
        const limit = length || 10; // Default ke 10 jika length tidak diberikan

        const result = await Transaction.findAndCountAll({
            where,
            order: sort,
            offset,
            limit
        });
        
        return result;
    }

    async getTransactionById(id) {
        return await Transaction.findByPk(id);
    }
    
    async createTransaction(transactionData) {
        return await Transaction.create(transactionData);
    }

    async updateTransaction(id, transactionData) {
        return await Transaction.update(transactionData, { where: { id } });
    }

    async deleteTransaction(id) {
        return await Transaction.destroy({ where: { id } });
    }
}

module.exports = new TransactionRepository();