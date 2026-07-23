const transactionJamaahRepo = require("../../repositories/transactions/transaction_jamaah.repository");
const transactionRepo = require("../../repositories/transactions/transaction.repository");

class TransactionJamaahService {
    /**
     * Validasi data jamaah sebelum disimpan
     * @param {Object} jamaahData - Data jamaah yang akan divalidasi
     * @throws {Error} Jika validasi gagal
     */
    validateCreateJamaah(jamaahData) {
        const requiredFields = [
            "transaction_id",
            "transaction_detail_id",
            "fullname",
            "email",
            "phone",
            "gender",
            "status"
        ];

        for (const field of requiredFields) {
            if (!jamaahData[field]) {
                throw new Error(`Field "${field}" wajib diisi`);
            }
        }

        this.validateCommon(jamaahData);
    }

    validateUpdateJamaah(updateData) {
        this.validateCommon(updateData);
    }
        validateCommon(data) {

        if (data.gender &&
            !["L", "P"].includes(data.gender)) {
            throw new Error(
                'Gender harus "L" atau "P"'
            );
        }

        if (data.status &&
            !["belum menikah", "menikah"].includes(data.status)) {
            throw new Error(
                'Status harus "belum menikah" atau "menikah"'
            );
        }

        if (data.email) {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(data.email)) {
                throw new Error("Format email tidak valid");
            }

        }

        if (data.phone) {

            const phoneRegex =
                /^[\d+\-\s()]{10,15}$/;

            if (!phoneRegex.test(data.phone)) {
                throw new Error(
                    "Format nomor telepon tidak valid"
                );
            }

        }
    }
    /**
     * Create jamaah baru
     * @param {Object} jamaahData - Data jamaah
     * @param {Object} options - Options (transaction, dll)
     * @returns {Promise<Jamaah>}
     */
    async createJamaah(jamaahData, options = {}) {

        this.validateCreateJamaah(jamaahData);

        const transaction = await transactionRepo.getTransactionById(jamaahData.transaction_id);
        if (!transaction) {
            throw new Error(
                `Transaksi ${jamaahData.transaction_id} tidak ditemukan`
            );
        }
        return await transactionJamaahRepo.createJamaah(
            jamaahData,
            options
        );
    }

    /**
     * Create multiple jamaah (untuk batch upload saat checkout)
     * @param {Array} jamaahDataArray - Array of jamaah data
     * @param {Object} options - Options
     * @returns {Promise<Array<Jamaah>>}
     */
    async createBulkJamaah(jamaahDataArray, options = {}) {
        // Validasi setiap jamaah
        for (const jamaahData of jamaahDataArray) {
            this.validateCreateJamaah(jamaahData);
        }

        // Create bulk
        return await transactionJamaahRepo.createBulkJamaah(jamaahDataArray, options);
    }

    /**
     * Get semua jamaah dengan pagination untuk datatable
     * @param {Object} query - Query params dari request
     * @returns {Promise<{draw, recordsTotal, recordsFiltered, data}>}
     */
    async getAllJamaahDatatables(query) {
        const { draw, start, length, order, columns } = query;
        const search = query["search[value]"] || query.search?.value || "";

        // Ambil data paginated
        const [result, totalCount] = await Promise.all([
            transactionJamaahRepo.getPaginatedJamaah({
                start: parseInt(start) || 0,
                length: parseInt(length) || 10,
                search,
                order,
                columns
            }),
            transactionJamaahRepo.countAll()
        ]);

        return {
            draw: parseInt(draw) || 0,
            recordsTotal: totalCount,
            recordsFiltered: result.count,
            data: result.rows
        };
    }

    /**
     * Get jamaah berdasarkan ID
     * @param {Number} id - ID jamaah
     * @returns {Promise<Jamaah>}
     */
    async getJamaahById(id) {
        const jamaah = await transactionJamaahRepo.getJamaahById(id);
        if (!jamaah) {
            throw new Error(`Jamaah dengan ID ${id} tidak ditemukan`);
        }
        return jamaah;
    }

    /**
     * Get semua jamaah dari satu transaksi
     * @param {Number} transactionId - ID transaksi
     * @returns {Promise<Array<Jamaah>>}
     */
    async getJamaahByTransactionId(transactionId) {
        // Cek transaksi exist
        const transaction = await transactionRepo.getTransactionById(transactionId);
        if (!transaction) {
            throw new Error(`Transaksi dengan ID ${transactionId} tidak ditemukan`);
        }

        return await transactionJamaahRepo.getJamaahByTransactionId(transactionId);
    }

    /**
     * Update jamaah
     * @param {Number} id - ID jamaah
     * @param {Object} updateData - Data untuk diupdate
     * @returns {Promise<Jamaah>}
     */
    async updateJamaah(id, updateData) {
        // Cek jamaah exist
        const jamaah = await this.getJamaahById(id);

        // Jika ada field yang berubah, validasi ulang
        if (updateData.fullname || updateData.email || updateData.phone ||
            updateData.gender || updateData.status) {
            const mergedData = { ...jamaah.get(), ...updateData };
            this.validateUpdateJamaah(mergedData);
        }

        // Update
        return await transactionJamaahRepo.updateJamaah(id, updateData);
    }

    /**
     * Delete jamaah
     * @param {Number} id - ID jamaah
     * @returns {Promise<Number>} - Records deleted
     */
    async deleteJamaah(id) {
        // Cek jamaah exist
        const jamaah = await this.getJamaahById(id);

        // Delete
        return await transactionJamaahRepo.deleteJamaah(id);
    }

    /**
     * Get statistik jamaah
     * @returns {Promise<{total, byGender, byStatus}>}
     */
    async getJamaahStatistics() {
        const total = await transactionJamaahRepo.countAll();
        const countMale = await transactionJamaahRepo.countByGender('L');
        const countFemale = await transactionJamaahRepo.countByGender('P');
        const countSuccess = await transactionJamaahRepo.countByTransactionStatus('SUCCESS');
        const countPending = await transactionJamaahRepo.countByTransactionStatus('PENDING');
        const countFailed = await transactionJamaahRepo.countByTransactionStatus('FAILED');

        return {
            total,
            byGender: {
                male: countMale,
                female: countFemale
            },
            byTransactionStatus: {
                success: countSuccess,
                pending: countPending,
                failed: countFailed
            }
        };
    }

    /**
     * Search jamaah berdasarkan nama
     * @param {String} fullname - Nama untuk dicari
     * @returns {Promise<Array<Jamaah>>}
     */
    async searchJamaahByName(fullname) {
        if (!fullname || fullname.trim().length === 0) {
            throw new Error('Nama jamaah tidak boleh kosong');
        }

        return await transactionJamaahRepo.searchByName(fullname);
    }

    /**
     * Search jamaah berdasarkan email
     * @param {String} email - Email untuk dicari
     * @returns {Promise<Array<Jamaah>>}
     */
    async searchJamaahByEmail(email) {
        if (!email || email.trim().length === 0) {
            throw new Error('Email tidak boleh kosong');
        }

        return await transactionJamaahRepo.searchByEmail(email);
    }

    /**
     * Get jamaah dengan custom filter
     * @param {Object} filters - Filter options
     * @returns {Promise<Array<Jamaah>>}
     */
    async getJamaahWithFilters(filters) {
        // Validasi filter
        if (filters.gender && !['L', 'P'].includes(filters.gender)) {
            throw new Error('Filter gender harus "L" atau "P"');
        }

        if (filters.status && !['belum menikah', 'menikah'].includes(filters.status)) {
            throw new Error('Filter status harus "belum menikah" atau "menikah"');
        }

        return await transactionJamaahRepo.getJamaahWithFilters(filters);
    }

    /**
     * Export jamaah data ke format API response
     * @param {Array} jamaahList - List of jamaah
     * @returns {Array} - Formatted jamaah data
     */
    formatJamaahResponse(jamaahList) {
        if (!Array.isArray(jamaahList)) {
            jamaahList = [jamaahList];
        }

        return jamaahList.map(jamaah => {
            const plain = jamaah.get ? jamaah.get({ plain: true }) : jamaah;

            return {
                id: plain.id,
                fullname: plain.fullname,
                email: plain.email,
                phone: plain.phone,
                gender: plain.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                status: plain.status,
                documents: {
                    ktp: plain.img_ktp,
                    kk: plain.img_kk,
                    passpor: plain.img_passpor,
                    diri: plain.img_diri,
                    akta_kelahiran: plain.img_akta_kelahiran
                },
                transaction: plain.transaction ? {
                    id: plain.transaction.id,
                    transactionNo: plain.transaction.transaction_no,
                    status: plain.transaction.status,
                    totalPrice: plain.transaction.total_price,
                    createdAt: plain.transaction.created_at,
                    product: plain.transaction.product,
                    user: plain.transaction.user
                } : null,
                detail: plain.detail ? {
                    id: plain.detail.id,
                    productName: plain.detail.product_name,
                    roomType: plain.detail.room_types,
                    price: plain.detail.price,
                    departureDate: plain.detail.departure_date
                } : null,
                createdAt: plain.createdAt,
                updatedAt: plain.updatedAt
            };
        });
    }
}

module.exports = new TransactionJamaahService();
