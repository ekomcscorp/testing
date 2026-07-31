const travelRekeningRepo = require('../repositories/travel_rekening.repository');
const profileRepo = require('../repositories/profile.repository');
const productRepo = require('../repositories/products/product.repository');

// Rekening Escrow resmi milik Platform / Marketplace
const MARKETPLACE_ESCROW_ACCOUNTS = [
    {
        type: 'MARKETPLACE',
        id: 1,
        bank_code: 'BCA',
        nama_bank: 'BCA',
        no_rekening: '7131720452',
        atas_nama: 'PT Kolaborasi Para Sahabat',
        description: 'Pembayaran aman via Escrow Marketplace'
    },
    {
        type: 'MARKETPLACE',
        id: 2,
        bank_code: 'BSI',
        nama_bank: 'BSI',
        no_rekening: '7215671498',
        atas_nama: 'PT Kolaborasi Para Sahabat',
        description: 'Pembayaran aman via Escrow Marketplace'
    }
];

class TravelRekeningService {

    /**
     * Travel: Lihat semua rekening sendiri
     */
    async getMyRekening(userId) {
        return await travelRekeningRepo.getRekeningByUserId(userId);
    }

    /**
     * Travel: Tambah rekening baru
     */
    async createRekening(userId, payload) {
        const data = {
            user_id: userId,
            nama_bank: payload.nama_bank,
            no_rekening: payload.no_rekening,
            atas_nama: payload.atas_nama
        };

        return await travelRekeningRepo.createRekening(data);
    }

    /**
     * Travel: Update data rekening (Aman IDOR)
     */
    async updateRekening(id, userId, payload) {
        const rekening = await travelRekeningRepo.getRekeningByIdAndUserId(id, userId);
        if (!rekening) throw new Error('Rekening tidak ditemukan atau Anda tidak memiliki akses');

        const updateData = {
            nama_bank: payload.nama_bank ?? rekening.nama_bank,
            no_rekening: payload.no_rekening ?? rekening.no_rekening,
            atas_nama: payload.atas_nama ?? rekening.atas_nama
        };

        await travelRekeningRepo.updateRekening(id, userId, updateData);
        return await travelRekeningRepo.getRekeningByIdAndUserId(id, userId);
    }

    /**
     * Travel: Hapus rekening (Aman IDOR)
     */
    async deleteRekening(id, userId) {
        const rekening = await travelRekeningRepo.getRekeningByIdAndUserId(id, userId);
        if (!rekening) throw new Error('Rekening tidak ditemukan atau Anda tidak memiliki akses');

        await travelRekeningRepo.deleteRekening(id, userId);
        return { message: 'Rekening berhasil dihapus' };
    }

    /**
     * Travel: Atur opsi pembayaran via rekening marketplace (aktif / nonaktif)
     */
    async toggleMarketplaceOption(userId, allowMarketplace) {
        const profile = await profileRepo.getProfileByUserId(userId);
        if (!profile) throw new Error('Profile travel tidak ditemukan');

        await profileRepo.updateProfile(profile.id, {
            allow_marketplace: Boolean(allowMarketplace)
        });

        return await profileRepo.getProfileByUserId(userId);
    }

    /**
     * Jamaah / Frontend: Dapatkan opsi bank pembayaran untuk suatu produk
     */
    async getPaymentOptionsForProduct(productId) {
        const product = await productRepo.getProductById(productId);
        if (!product) throw new Error('Produk tidak ditemukan');

        const travelUserId = product.user_id;
        const profile = await profileRepo.getProfileByUserId(travelUserId);

        const allowMarketplace = profile ? Boolean(profile.allow_marketplace) : true;
        const travelAccounts = await travelRekeningRepo.getRekeningByUserId(travelUserId);

        const options = [];

        // 1. Opsi Rekening Marketplace (Escrow) jika diizinkan
        if (allowMarketplace) {
            options.push(...MARKETPLACE_ESCROW_ACCOUNTS);
        }

        // 2. Opsi Rekening-Rekening milik Travel (Transfer Direct)
        travelAccounts.forEach(acc => {
            options.push({
                type: 'MANDIRI',
                id: acc.id,
                nama_bank: acc.nama_bank,
                no_rekening: acc.no_rekening,
                atas_nama: acc.atas_nama,
                description: `Transfer langsung ke ${product.creator?.fullname || 'Travel'}`
            });
        });

        return {
            product_id: productId,
            travel_id: travelUserId,
            rekening_mode: profile?.rekening_mode || 'MARKETPLACE',
            allow_marketplace: allowMarketplace,
            options
        };
    }

    /**
     * Helper: Resolve pilihan rekening jamaah saat checkout & hasilkan SNAPSHOT
     */
   async resolvePaymentSelection(travelUserId, selection) {
    const defaultEscrow = MARKETPLACE_ESCROW_ACCOUNTS[0];

    if (!selection || !selection.type) {
        return {
            rekening_type: 'MARKETPLACE',
            travel_rekening_id: null,
            snapshot: {
                type: 'MARKETPLACE',
                nama_bank: defaultEscrow.nama_bank,
                no_rekening: defaultEscrow.no_rekening,
                atas_nama: defaultEscrow.atas_nama
            }
        };
    }

    const typeUpper = selection.type.toUpperCase();

    // --- PILIHAN 1: REKENING MANDIRI TRAVEL ---
    if (typeUpper === 'MANDIRI' || typeUpper === 'TRAVEL_MANDIRI') {
        if (!selection.travel_rekening_id) {
            throw new Error('travel_rekening_id wajib diisi untuk opsi pembayaran MANDIRI');
        }

        // Ambil rekening milik travel (owner produk)
        const rekening = await travelRekeningRepo.getRekeningByIdAndUserId(
            selection.travel_rekening_id, 
            travelUserId
        );

        console.log(`[CHECKOUT LOG] TravelOwnerID: ${travelUserId} | RequestedRekeningID: ${selection.travel_rekening_id} | Found:`, rekening);

        if (!rekening) {
            throw new Error(`Rekening bank ID ${selection.travel_rekening_id} tidak ditemukan atau bukan milik Travel pemilik produk ini (User ID: ${travelUserId})`);
        }

        return {
            rekening_type: 'MANDIRI', // Sesuai dengan ENUM model Profile & Transaction
            travel_rekening_id: rekening.id,
            snapshot: {
                type: 'MANDIRI',
                travel_rekening_id: rekening.id,
                nama_bank: rekening.nama_bank,
                no_rekening: rekening.no_rekening,
                atas_nama: rekening.atas_nama
            }
        };
    }

    // --- PILIHAN 2: MARKETPLACE ESCROW ---
    if (typeUpper === 'MARKETPLACE') {
        const profile = await profileRepo.getProfileByUserId(travelUserId);
        
        if (profile && profile.allow_marketplace === false) {
            throw new Error('Travel ini tidak menerima pembayaran via Rekening Marketplace');
        }

        const selectedEscrow = MARKETPLACE_ESCROW_ACCOUNTS.find(
            acc => acc.bank_code === selection.bank_code
        ) || defaultEscrow;

        return {
            rekening_type: 'MARKETPLACE',
            travel_rekening_id: null,
            snapshot: {
                type: 'MARKETPLACE',
                bank_code: selectedEscrow.bank_code,
                nama_bank: selectedEscrow.nama_bank,
                no_rekening: selectedEscrow.no_rekening,
                atas_nama: selectedEscrow.atas_nama
            }
        };
    }

    throw new Error(`Tipe pembayaran "${selection.type}" tidak valid`);
}
}

module.exports = new TravelRekeningService();