const { Op } = require("sequelize"); 
const { Transaction, User, TransactionDetail, Product } = require("../../models");

// Helper function untuk parse JSON snapshots
const parseSnapshots = (detail) => {
    if (!detail) return detail;
    
    const parsed = detail.get ? detail.get({ plain: true }) : { ...detail };
    
    // Parse travel_snapshot
    if (parsed.travel_snapshot && typeof parsed.travel_snapshot === 'string') {
        try {
            parsed.travel_snapshot = JSON.parse(parsed.travel_snapshot);
        } catch (e) {
            console.warn('Failed to parse travel_snapshot:', e.message);
            parsed.travel_snapshot = {};
        }
    }
    
    // Parse flights_snapshot
    if (parsed.flights_snapshot && typeof parsed.flights_snapshot === 'string') {
        try {
            parsed.flights_snapshot = JSON.parse(parsed.flights_snapshot);
        } catch (e) {
            console.warn('Failed to parse flights_snapshot:', e.message);
            parsed.flights_snapshot = [];
        }
    }
    
    // Parse hotels_snapshot
    if (parsed.hotels_snapshot && typeof parsed.hotels_snapshot === 'string') {
        try {
            parsed.hotels_snapshot = JSON.parse(parsed.hotels_snapshot);
        } catch (e) {
            console.warn('Failed to parse hotels_snapshot:', e.message);
            parsed.hotels_snapshot = [];
        }
    }
    
    return parsed;
};

class TransactionRepository {
    // Menambahkan parameter 'transaction' (t) agar bisa digunakan di Service layer (Atomic)
    async createTransaction(data, options = {}) {
        return await Transaction.create(data, options);
    }

    // Fungsi baru untuk simpan detail (Snapshot)
    async createTransactionDetail(detailData, { transaction } = {}) {
        return await TransactionDetail.create(detailData, { transaction });
    }

    async createBulkTransactionDetail(details, options = {}) {
        // Menggunakan bulkCreate bawaan Sequelize
        return await TransactionDetail.bulkCreate(details, options);
    }

    async createBulkTransaction(transactionData, detailsArray) {
        const t = await Transaction.sequelize.transaction();

        try{
            const transaction = await Transaction.create(transactionData, {transaction: t});

            const finalDetails = detailsArray.map(detail => ({
                ...detail,
                transaction_id:  transaction.id
            }))

            await TransactionDetail.bulkCreate(finalDetails, { transaction:t })

            await t.commit();
            return transaction;
        }catch(error){
            await t.rollback();
            throw error;
        }
    }

    async getAllTransactions() {
        const transactions = await Transaction.findAll({
            include: [
                {
                    model: TransactionDetail,
                    as: "details"
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "username", "email"]
                }
            ],
            order: [["created_at", "DESC"]]
        });
        
        // Auto-parse snapshots in all details
        return transactions.map(transaction => {
            if (transaction.details) {
                transaction.details = transaction.details.map(detail => parseSnapshots(detail));
            }
            return transaction;
        });
    }

    async getTransactionById(id) {
        const transaction = await Transaction.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'product', 
                    include: [
                        {
                            model: User,
                            as: 'creator', 
                            attributes: ['fullname', 'address']
                        }
                    ]
                },
                {
                    model: TransactionDetail,
                    as: "details",
                    
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "username", "email", 'no_wa']
                }
            ]
        });
        
        // Auto-parse snapshots in details
        if (transaction && transaction.details) {
            transaction.details = transaction.details.map(detail => parseSnapshots(detail));
        }
        
        return transaction;
    }

    async getPaginatedTransaction({ start, length, search, order, columns }) {
        const where = {
            ...(search && {
                [Op.or]: [
                    { transaction_no: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                ]
            })
        };

        const sort = order && order.length > 0
            ? [[columns[order[0].column].data, order[0].dir]]
            : [["created_at", "DESC"]];

        const result = await Transaction.findAndCountAll({
            where,
            include: [
                {
                    model: TransactionDetail,
                    as: "details",
                    attributes: ["product_name", "room_type", "price"] // Mengambil data snapshot
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "username"]
                }
            ],
            order: sort,
            offset: parseInt(start) || 0,
            limit: parseInt(length) || 10,
            distinct: true // Penting saat menggunakan include + limit agar count tidak kacau
        });
        
        // Auto-parse snapshots in all rows
        const parsedRows = result.rows.map(transaction => {
            if (transaction.details) {
                transaction.details = transaction.details.map(detail => parseSnapshots(detail));
            }
            return transaction;
        });

        return {
            ...result,
            rows: parsedRows
        };
    }

    async countAll() {
        return await Transaction.count();
    }

    async updateTransaction(id, transactionData, { transaction } = {}) {
        return await Transaction.update(transactionData, { 
            where: { id },
            transaction 
        });
    }

    async deleteTransaction(id, { transaction } = {}) {
        return await Transaction.destroy({ 
            where: { id },
            transaction 
        });
    }
}

module.exports = new TransactionRepository();