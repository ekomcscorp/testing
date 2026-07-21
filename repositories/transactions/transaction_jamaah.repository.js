const { Op, where, col } = require("sequelize");
const { TransactionJamaah, Transaction, TransactionDetail, User, Product, Profile } = require("../../models");

class TransactionJamaahRepository {
    /**
     * Membuat record jamaah baru
     * @param {Object} jamaahData - Data jamaah (fullname, email, phone, gender, status, img_*, dll)
     * @param {Object} options - Options untuk transaction, dll
     * @returns {Promise<Jamaah>}
     */
    async createJamaah(jamaahData, options = {}) {
        return await TransactionJamaah.create(jamaahData, options);
    }

    /**
     * Create bulk jamaah dalam satu transaksi
     * @param {Array} jamaahDataArray - Array of jamaah objects
     * @param {Object} options - Sequelize options (transaction, dll)
     * @returns {Promise<Array<Jamaah>>}
     */
    async createBulkJamaah(jamaahDataArray, options = {}) {
        return await TransactionJamaah.bulkCreate(jamaahDataArray, options);
    }

    /**
     * Ambil semua jamaah dengan relasi lengkap (paginasi untuk datatables)
     * @param {Object} params - Pagination params (start, length, search, order, columns)
     * @returns {Promise<{count: number, rows: Array<Jamaah>}>}
     */
    async getPaginatedJamaah({ start, length, search, order, columns }) {
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { fullname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { gender: { [Op.like]: `%${search}%` } },
                where(col('transaction.transaction_no'), Op.like, `%${search}%`)
            ];
        }

        const sort = order && order.length > 0
            ? [[columns[order[0].column].data, order[0].dir]]
            : [["createdAt", "DESC"]];

        const result = await TransactionJamaah.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    attributes: ['id', 'transaction_no', 'status', 'total_price', 'created_at'],
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'nama_produk', 'tgl_keberangkatan', 'duration']
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'fullname', 'email', 'no_wa'],
                            include: [
                                {
                                    model: Profile,
                                    as: 'profile',
                                    attributes: ['image']
                                }
                            ]
                        }
                    ],
                    required: false
                },
                {
                    model: TransactionDetail,
                    as: 'detail',
                    attributes: ['id', 'product_name', 'room_types', 'price', 'departure_date'],
                    required: false
                }
            ],
            order: sort,
            offset: parseInt(start) || 0,
            limit: Math.min(parseInt(length) || 10, 50),
            distinct: true,
            subQuery: false
        });

        return result;
    }

    /**
     * Ambil jamaah berdasarkan ID
     * @param {Number} id - ID jamaah
     * @param {Object} options - Sequelize options
     * @returns {Promise<Jamaah>}
     */
    async getJamaahById(id, options = {}) {
        return await TransactionJamaah.findByPk(id, {
            ...options,
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    attributes: ['id', 'transaction_no', 'status', 'total_price', 'payment_method', 'created_at'],
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: [
                                'id', 'nama_produk', 'tgl_keberangkatan', 'duration',
                                'thumbnail_url', 'deskripsi'
                            ]
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'fullname', 'email', 'no_wa'],
                            include: [
                                {
                                    model: Profile,
                                    as: 'profile',
                                    attributes: ['image']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: TransactionDetail,
                    as: 'detail',
                    attributes: [
                        'id', 'product_name', 'room_types', 'price', 'departure_date',
                        'hotels_snapshot', 'flights_snapshot'
                    ]
                }
            ]
        });
    }

    /**
     * Ambil semua jamaah dari satu transaksi
     * @param {Number} transactionId - ID transaksi
     * @returns {Promise<Array<Jamaah>>}
     */
    async getJamaahByTransactionId(transactionId) {
        return await TransactionJamaah.findAll({
            where: { transaction_id: transactionId },
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    attributes: ['id', 'transaction_no', 'status']
                },
                {
                    model: TransactionDetail,
                    as: 'detail',
                    attributes: ['id', 'product_name', 'room_types', 'price']
                }
            ],
            order: [["createdAt", "ASC"]]
        });
    }

    async getAllJamaah() {
        return await TransactionJamaah.findAll()
    }


    /**
     * Ambil semua jamaah dari satu detail transaksi
     * @param {Number} transactionDetailId - ID transaction detail
     * @returns {Promise<Array<Jamaah>>}
     */
    async getJamaahByTransactionDetailId(transactionDetailId) {
        return await TransactionJamaah.findAll({
            where: { transaction_detail_id: transactionDetailId },
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    attributes: ['id', 'transaction_no', 'status']
                }
            ],
            order: [["createdAt", "ASC"]]
        });
    }

    /**
     * Update jamaah
     * @param {Number} id - ID jamaah
     * @param {Object} updateData - Data yang diupdate
     * @param {Object} options - Sequelize options
     * @returns {Promise<Jamaah>}
     */
    async updateJamaah(id, updateData, options = {}) {
        await TransactionJamaah.update(updateData, {
            where: { id },
            ...options
        });
        return await TransactionJamaah.findByPk(id);
    }

    /**
     * Delete jamaah
     * @param {Number} id - ID jamaah
     * @param {Object} options - Sequelize options
     * @returns {Promise<Number>} - Number of records destroyed
     */
    async deleteJamaah(id, options = {}) {
        return await TransactionJamaah.destroy({
            where: { id },
            ...options
        });
    }

    /**
     * Ambil total count jamaah untuk statistik
     * @returns {Promise<Number>}
     */
    async countAll() {
        return await TransactionJamaah.count();
    }

    /**
     * Count jamaah berdasarkan transaction status
     * @param {String} status - Transaction status (SUCCESS, PAID, FAILED, dll)
     * @returns {Promise<Number>}
     */
    async countByTransactionStatus(status) {
        return await TransactionJamaah.count({
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    where: { status },
                    required: true
                }
            ]
        });
    }

    /**
     * Count jamaah berdasarkan gender
     * @param {String} gender - Gender (L/P)
     * @returns {Promise<Number>}
     */
    async countByGender(gender) {
        return await TransactionJamaah.count({
            where: { gender }
        });
    }

    /**
     * Cari jamaah berdasarkan nama
     * @param {String} fullname - Nama jamaah (partial match)
     * @returns {Promise<Array<Jamaah>>}
     */
    async searchByName(fullname) {
        return await TransactionJamaah.findAll({
            where: {
                fullname: { [Op.like]: `%${fullname}%` }
            },
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    attributes: ['id', 'transaction_no', 'status']
                }
            ],
            limit: 20
        });
    }

    /**
     * Cari jamaah berdasarkan email
     * @param {String} email - Email jamaah
     * @returns {Promise<Array<Jamaah>>}
     */
    async searchByEmail(email) {
        return await TransactionJamaah.findAll({
            where: {
                email: { [Op.like]: `%${email}%` }
            },
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    attributes: ['id', 'transaction_no', 'status']
                }
            ],
            limit: 20
        });
    }

    /**
     * Ambil jamaah dengan filter custom (advanced search)
     * @param {Object} filters - Custom filters {gender, status, createdAt_from, createdAt_to}
     * @returns {Promise<Array<Jamaah>>}
     */
    async getJamaahWithFilters(filters = {}) {
        const where = {};

        if (filters.gender) {
            where.gender = filters.gender;
        }

        if (filters.status) {
            // Status dari transaction
            filters.transactionStatus = filters.status;
        }

        if (filters.createdAt_from || filters.createdAt_to) {
            where.createdAt = {};
            if (filters.createdAt_from) {
                where.createdAt[Op.gte] = new Date(filters.createdAt_from);
            }
            if (filters.createdAt_to) {
                where.createdAt[Op.lte] = new Date(filters.createdAt_to);
            }
        }

        const includeTransaction = {
            model: Transaction,
            as: 'transaction',
            attributes: ['id', 'transaction_no', 'status'],
            required: false
        };

        if (filters.transactionStatus) {
            includeTransaction.where = { status: filters.transactionStatus };
            includeTransaction.required = true;
        }

        return await TransactionJamaah.findAll({
            where,
            include: [includeTransaction],
            order: [["createdAt", "DESC"]]
        });
    }
}

module.exports = new TransactionJamaahRepository();
