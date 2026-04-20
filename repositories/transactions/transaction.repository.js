const { Model, Op } = require("sequelize"); // Import Op for Sequelize operators
const { Transaction, Product, User} = require("../../models");

class TransactionRepository {
    async getAllTransactions() {
        return await Transaction.findAll({
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "nama_produk", "tgl_keberangkatan"]
                },
                {
                    model: User,
                    as: "user",
                    attributes: [
                     "id", "fullname", "username"
                    ]
                }
            ],
            order: [["created_at", "DESC"]]
        });
    }

    async countAll() {
        return await Transaction.count(); // Total semua produk tanpa filter
    }

    async getPaginatedTransaction({ start, length, search, order, columns}) {
        const where = {
            ...(search && {
            [Op.or]: [
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
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "nama_produk", "tgl_keberangkatan"]
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "username"]
                }
            ],
            order: sort,
            offset,
            limit
        });
        
        return result;
    }

    async getTransactionById(id) {
        return await Transaction.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "nama_produk", "tgl_keberangkatan"]
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "username"]
                }
            ]
        });
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