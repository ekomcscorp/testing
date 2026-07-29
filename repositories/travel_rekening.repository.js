const { TravelRekening, User } = require('../models');

class TravelRekeningRepository {

    /**
     * Ambil semua rekening milik travel (user_id)
     * Digunakan oleh Admin Travel (di Dashboard) & Jamaah (di Halaman Checkout)
     */
    async getRekeningByUserId(userId) {
        return await TravelRekening.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Ambil detail 1 rekening spesifik (Aman dengan pengecekan user_id)
     */
    async getRekeningByIdAndUserId(rekeningId, userId) {
        // PAKSA konversi ke integer untuk mencegah String vs Number mismatch
        const parsedRekeningId = parseInt(rekeningId, 10);
        const parsedUserId = parseInt(userId, 10);

        if (isNaN(parsedRekeningId) || isNaN(parsedUserId)) {
            return null;
        }

        return await TravelRekening.findOne({
            where: {
                id: parsedRekeningId,
                user_id: parsedUserId
            },
            raw: true // Mengembalikan plain JSON object
        });
    }
    /**
     * Buat rekening baru
     */
    async createRekening(payload) {
        return await TravelRekening.create(payload);
    }

    /**
     * Update data rekening (Aman dengan pengecekan user_id)
     */
    async updateRekening(id, userId, payload) {
        return await TravelRekening.update(payload, {
            where: { id, user_id: userId }
        });
    }

    /**
     * Hapus rekening (Aman dengan pengecekan user_id)
     */
    async deleteRekening(id, userId) {
        return await TravelRekening.destroy({
            where: { id, user_id: userId }
        });
    }
}

module.exports = new TravelRekeningRepository();