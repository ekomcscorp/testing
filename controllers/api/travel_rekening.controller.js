const response = require('../../utils/response');
const travelRekeningService = require('../../services/travel_rekening.service');

class TravelRekeningController {

    /**
     * GET /api/travel/rekening
     * Travel melihat daftar rekening milik sendiri
     */
    async getMyRekening(req, res) {
        try {
            const userId = req.user.id;
            const rekening = await travelRekeningService.getMyRekening(userId);
            return response.success(res, 'Daftar rekening berhasil diambil', rekening);
        } catch (error) {
            return response.error(res, error.message, 500);
        }
    }

    /**
     * POST /api/travel/rekening
     * Travel menambah rekening baru
     * Body: { nama_bank, no_rekening, atas_nama }
     */
    async createRekening(req, res) {
        try {
            const userId = req.user.id;
            const { nama_bank, no_rekening, atas_nama } = req.body;

            if (!nama_bank || !no_rekening || !atas_nama) {
                return response.error(res, 'nama_bank, no_rekening, dan atas_nama wajib diisi', 400);
            }

            const rekening = await travelRekeningService.createRekening(userId, {
                nama_bank: nama_bank.trim(),
                no_rekening: no_rekening.trim(),
                atas_nama: atas_nama.trim()
            });

            return response.success(res, 'Rekening berhasil ditambahkan', rekening, 201);
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    /**
     * PUT /api/travel/rekening/:id
     * Travel update data rekening
     */
    async updateRekening(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const rekeningId = parseInt(id, 10);

            if (isNaN(rekeningId)) {
                return response.error(res, 'ID rekening tidak valid', 400);
            }

            const { nama_bank, no_rekening, atas_nama } = req.body;

            const updated = await travelRekeningService.updateRekening(
                rekeningId,
                userId,
                { nama_bank, no_rekening, atas_nama }
            );

            return response.success(res, 'Rekening berhasil diperbarui', updated);
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    /**
     * DELETE /api/travel/rekening/:id
     * Travel hapus rekening
     */
    async deleteRekening(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const rekeningId = parseInt(id, 10);

            if (isNaN(rekeningId)) {
                return response.error(res, 'ID rekening tidak valid', 400);
            }

            const result = await travelRekeningService.deleteRekening(rekeningId, userId);
            return response.success(res, result.message);
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    /**
     * PUT /api/travel/rekening/toggle-marketplace
     * Travel aktif/nonaktifkan opsi rekening marketplace bagi jamaah
     * Body: { allow_marketplace: boolean }
     */
    async toggleMarketplace(req, res) {
        try {
            const userId = req.user.id;
            const { allow_marketplace } = req.body;

            if (typeof allow_marketplace !== 'boolean') {
                return response.error(res, 'Field allow_marketplace (boolean) wajib diisi dengan true atau false', 400);
            }

            const profile = await travelRekeningService.toggleMarketplaceOption(userId, allow_marketplace);
            return response.success(
                res,
                `Opsi pembayaran marketplace berhasil ${profile.allow_marketplace ? 'diaktifkan' : 'dinonaktifkan'}`,
                { allow_marketplace: profile.allow_marketplace }
            );
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    /**
     * GET /api/products/:productId/payment-options
     * Jamaah melihat opsi rekening bank tujuan yang tersedia untuk produk ini
     */
    async getProductPaymentOptions(req, res) {
        try {
            const { productId } = req.params;
            const parsedProductId = parseInt(productId, 10);

            if (isNaN(parsedProductId)) {
                return response.error(res, 'Product ID tidak valid', 400);
            }

            const data = await travelRekeningService.getPaymentOptionsForProduct(parsedProductId);
            return response.success(res, 'Opsi pembayaran berhasil diambil', data);
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }
}

module.exports = new TravelRekeningController();