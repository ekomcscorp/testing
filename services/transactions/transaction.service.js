const { sequelize, Transaction, TransactionDetail } = require("../../models"); // Import model di sini
const transactionRepo = require("../../repositories/transactions/transaction.repository");
const productRepo = require("../../repositories/products/product.repository");

class TransactionService {
   async checkout(payload) {
    const { user_id, items, payment_method } = payload;

    // 1. Validasi Baru: Cek user_id dan pastikan array items ada isinya
    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Data user_id dan daftar items wajib diisi");
    }

    const t = await sequelize.transaction();

    try {
        let totalTransactionPrice = 0;
        const detailsToCreate = [];

        // 2. Looping untuk validasi tiap item di dalam array
        for (const item of items) {
            // Validasi tiap item harus punya product_id dan room_type
            if (!item.product_id || !item.room_type) {
                throw new Error("Setiap item harus memiliki product_id dan room_type");
            }

            const product = await productRepo.getProductById(item.product_id);
            if (!product) throw new Error(`Product ID ${item.product_id} tidak ditemukan`);

            const selectedPrice = product.prices.find(p => p.room_types === item.room_type);
            if (!selectedPrice) throw new Error(`Tipe kamar ${item.room_type} tidak tersedia untuk ${product.nama_produk}`);

            // ... (lanjutkan proses mapping snapshot seperti yang kita bahas sebelumnya)
            
            const hotelsSnapshot = product.hotels?.map(h => ({
                name: h.name, city: h.city, rating: h.rating
            })) || [];

            const flightsSnapshot = product.flights?.map(f => ({
                airline_name: f.airline_name, type: f.type
            })) || [];

            const travelSnapshot = {
                fullname: product.creator?.fullname,
            };

            totalTransactionPrice += selectedPrice.price;

            detailsToCreate.push({
                user_id: user_id,
                product_id: product.id,
                product_name: product.nama_produk,
                price: selectedPrice.price,
                room_type: item.room_type,
                hotels_snapshot: JSON.stringify(hotelsSnapshot),
                flights_snapshot: JSON.stringify(flightsSnapshot),
                travel_snapshot: JSON.stringify(travelSnapshot),
                departure_date: product.tgl_keberangkatan,
                duration: product.duration,
                subtotal: selectedPrice.price
            });
        }

        // 3. Simpan Header Transaksi
        const transaction = await transactionRepo.createTransaction({
            user_id,
            total_price: totalTransactionPrice,
            status: "UNPAID",
            payment_method: payment_method || 'TRANSFER'
        }, { transaction: t });

        // 4. Pasangkan ID Transaksi ke Detail
        const finalDetails = detailsToCreate.map(detail => ({
            ...detail,
            transaction_id: transaction.id
        }));

        // 5. Simpan semua detail (Bulk Create)
        await transactionRepo.createBulkTransactionDetail(finalDetails, { transaction: t });

        await t.commit();
        return transaction;

    } catch (error) {
        await t.rollback();
        throw error;
    }
}
   
    async getAllTransactionDatatables(query) {
        const { draw, start, length, order, columns } = query;
        const search = query["search[value]"] || query.search?.value || "";

        // Menggunakan repository untuk mengambil data paginated
        const [result, totalCount] = await Promise.all([
            transactionRepo.getPaginatedTransaction({
                start: parseInt(start) || 0,
                length: parseInt(length) || 10,
                search,
                order,
                columns,
            }),
            transactionRepo.countAll(),
        ]);

        return {
            draw: parseInt(draw) || 0,
            recordsTotal: totalCount,
            recordsFiltered: result.count,
            data: result.rows
        };
    }

    async updatePayment(id, payload) {
        const checktTransaction = await transactionRepo.getTransactionById(id);
        if(!checktTransaction){
            throw new Error("Transaksi tidak ditemukan");
        }

        await transactionRepo.updateTransaction(id, {
            evidence_url: payload.evidence_url,
            status: 'PENDING',
            updated_at: new Date()  
        })

        return await transactionRepo.getTransactionById(id);
    }

    async updateStatus(id, newStatus) {
        const checkTransaction = await transactionRepo.getTransactionById(id);
        if(!checkTransaction){
            throw new Error("Transaksi tidak ditemukan");
        }

        await transactionRepo.updateTransaction(id, {
            status: newStatus,
            updated_at: new Date()
        });

        return await transactionRepo.getTransactionById(id);
    }
}

module.exports = new TransactionService();