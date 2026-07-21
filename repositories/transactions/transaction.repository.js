const { Op, where, col } = require("sequelize"); 
const { Transaction, User, TransactionDetail, Product, Profile, TransactionJamaah } = require("../../models");

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
    

    async getAllTransactions(user) {
        const productInclude = {
            model: Product,
            as: "product",
            attributes: ["id", "nama_produk", "user_id"]
        };

        if (user && user.id_level === 4) {
            productInclude.where = { user_id: user.id };
            productInclude.required = true;
        }

        const transactions = await Transaction.findAll({
            include: [
                productInclude,
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "username", "email", "no_wa"],
                    include: [
                        {
                            model: Profile,
                            as: "profile",
                        }
                    ]
                },
                {
                    model: TransactionDetail,
                    as: "details"
                },
                {
                    model: TransactionJamaah,
                    as: "jamaah"
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

    async getTransactionById(id, options = {}) {
        const transaction = await Transaction.findByPk(id, {
            ...options,
            include: [
                {
                    model: Product,
                    as: 'product', 
                    include: [
                        {
                            model: User,
                            as: 'creator', 
                            attributes: ['fullname', ]
                        }
                    ]
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "username", "email", 'no_wa'],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                        }
                    ]
                },
                {
                    model: TransactionDetail,
                    as: "details",      
                },
                {
                    model: TransactionJamaah,
                    as: "jamaah"
                }
            ]
        });
        
        // Auto-parse snapshots in details
        if (transaction && transaction.details) {
            transaction.details = transaction.details.map(detail => parseSnapshots(detail));
        }
        
        return transaction;
    }

   async getPaginatedTransaction({ start, length, search, order, columns, user }) {
    const whereClause = {}; // ✅ Rename agar tidak konflik

    if (search) {
        const orConditions = [
            { transaction_no: { [Op.like]: `%${search}%` } },
            { status: { [Op.like]: `%${search}%` } },
            where(col('user.fullname'), { [Op.like]: `%${search}%` }), // ✅ `where` sekarang adalah Sequelize function
            where(col('user.username'), { [Op.like]: `%${search}%` })
        ];

        const numeric = !Number.isNaN(Number(search));
        if (numeric) {
            orConditions.push({ total_price: Number(search) });
        } else {
            orConditions.push({ total_price: { [Op.like]: `%${search}%` } }); // ✅ Lebih aman pakai object biasa
        }

        whereClause[Op.or] = orConditions; // ✅ Gunakan whereClause
    }

    const sort = order && order.length > 0
        ? [[columns[order[0].column].data, order[0].dir]]
        : [["created_at", "DESC"]];

    const productInclude = {
        model: Product,
        as: "product",
        attributes: ["id", "nama_produk", "user_id"]
    };

    if (user && user.id_level === 4) {
        productInclude.where = { user_id: user.id };
        productInclude.required = true;
    }

    const result = await Transaction.findAndCountAll({
        where: whereClause, // ✅ Pakai whereClause
        include: [
            productInclude,
            {
                model: TransactionDetail,
                as: "details",
                attributes: ["product_name", "room_types", "price"]
            },
            {
                model: User,
                as: "user",
                attributes: ["id", "fullname", "username"],
                required: false // ✅ LEFT JOIN agar search by user.fullname tidak drop row
            }
        ],
        order: sort,
        offset: parseInt(start) || 0,
        limit: parseInt(length) || 10,
        distinct: true,
        subQuery: false // ✅ Penting! Agar col('user.fullname') bisa diakses di WHERE
    });

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

    async countAll(user) {
        if (user && user.id_level === 4) {
            return await Transaction.count({
                include: [
                    {
                        model: Product,
                        as: "product",
                        where: { user_id: user.id },
                        required: true
                    }
                ]
            });
        }
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

    // Ambil semua transaksi milik user tertentu
    async getTransactionByUserId(user_id) {
        const transactions = await Transaction.findAll({
            where: { user_id },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "nama_produk", "tgl_keberangkatan", "duration", "thumbnail_url"]
                },
                {
                    model: TransactionDetail,
                    as: "details",
                    attributes: ["product_name", "room_types", "price", "departure_date", "hotels_snapshot", "flights_snapshot"]
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullname", "email", "no_wa"],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: ['image']
                        }
                    ]
                }
            ],
            order: [["created_at", "DESC"]]
        });

        // Auto-parse snapshots
        return transactions.map(transaction => {
            if (transaction.details) {
                transaction.details = transaction.details.map(detail => parseSnapshots(detail));
            }
            return transaction;
        });
    }
}

module.exports = new TransactionRepository();