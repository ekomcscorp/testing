const { sequelize, Transaction, TransactionDetail, ProductPrices } = require("../../models"); // Import model di sini
const transactionRepo = require("../../repositories/transactions/transaction.repository");
const productRepo = require("../../repositories/products/product.repository");

// Quota handling: setiap booking mengurangi quota sebanyak 1 per item,
// terlepas dari tipe kamar. Fungsi helper tetap disediakan untuk
// konsistensi kode dan kemungkinan perluasan di masa depan.
function getQuotaMultiplier(/* roomType */) {
    return 1; // selalu kurangi 1 seat per item
}

class TransactionService {
    async checkout(payload) {
        const { user_id, items, payment_method } = payload;

        // Validasi: Cek user_id dan pastikan array items ada isinya
        if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
            throw new Error("Data user_id dan daftar items wajib diisi");
        }

        const t = await sequelize.transaction();

        try {
            // Kelompokkan item per product_id + room_types untuk kalkulasi kuota
            // Key: "product_id:room_types", value: jumlah item yang dipesan (qty booking, BUKAN quota yang dikurangi)
            const priceQuotaMap = {};
            for (const item of items) {
                if (!item.product_id || !item.room_types) {
                    throw new Error("Setiap item harus memiliki product_id dan room_types");
                }
                const key = `${item.product_id}:${item.room_types}`;
                priceQuotaMap[key] = (priceQuotaMap[key] || 0) + 1;
            }

            // Lock & validasi quota di tabel product_prices, lalu kurangi
            for (const [key, qty] of Object.entries(priceQuotaMap)) {
                const [productId, roomType] = key.split(':');

                // 🟢 Hitung total quota yang harus dikurangi = jumlah booking x multiplier tipe kamar
                const multiplier = getQuotaMultiplier(roomType);
                const quotaToDeduct = qty * multiplier;

                // Ambil baris product_prices yang sesuai dengan lock UPDATE (anti race condition)
                const priceRow = await ProductPrices.findOne({
                    where: { product_id: productId, room_types: roomType },
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (!priceRow) {
                    throw new Error(`Tipe kamar "${roomType}" tidak ditemukan untuk produk ID ${productId}`);
                }

                console.log(`[QUOTA] product_id=${productId} | room_types="${roomType}" | quota=${priceRow.quota} | dipesan=${qty} | multiplier=${multiplier} | quotaToDeduct=${quotaToDeduct}`);

                if (priceRow.quota < quotaToDeduct) {
                    throw new Error(`Kuota tipe kamar "${roomType}" tidak mencukupi (sisa: ${priceRow.quota}, dibutuhkan: ${quotaToDeduct})`);
                }

                // Kurangi quota langsung di tabel product_prices sesuai multiplier tipe kamar
                await ProductPrices.update(
                    { quota: priceRow.quota - quotaToDeduct },
                    { where: { product_id: productId, room_types: roomType }, transaction: t }
                );

                console.log(`[QUOTA] Quota "${roomType}" berhasil dikurangi ${quotaToDeduct} → sisa: ${priceRow.quota - quotaToDeduct}`);
            }

            // Ambil data produk untuk snapshot (tanpa lock, sudah diproses di atas)
            const productCache = {};
            const detailsToCreate = [];
            let totalTransactionPrice = 0;

            for (const item of items) {
                if (!productCache[item.product_id]) {
                    productCache[item.product_id] = await productRepo.getProductById(item.product_id, { transaction: t });
                }
                const product = productCache[item.product_id];
                if (!product) throw new Error(`Produk ID ${item.product_id} tidak ditemukan`);

                const selectedPrice = product.prices.find(p => p.room_types === item.room_types);
                if (!selectedPrice) throw new Error(`Tipe kamar ${item.room_types} tidak tersedia untuk ${product.nama_produk}`);

                const hotelsSnapshot = product.hotels?.map(h => ({
                    name: h.name, city: h.city, rating: h.rating
                })) || [];

                const flightsSnapshot = product.flights?.map(f => ({
                    airline_name: f.airline_name, type: f.type
                })) || [];

                const travelSnapshot = { fullname: product.creator?.fullname };

                totalTransactionPrice += selectedPrice.price;

                detailsToCreate.push({
                    user_id,
                    product_id: product.id,
                    product_name: product.nama_produk,
                    thumbnail_product: product.thumbnail_url,
                    price: selectedPrice.price,
                    room_types: item.room_types,
                    hotels_snapshot: JSON.stringify(hotelsSnapshot),
                    flights_snapshot: JSON.stringify(flightsSnapshot),
                    travel_snapshot: JSON.stringify(travelSnapshot),
                    departure_date: product.tgl_keberangkatan,
                    duration: product.duration,
                    subtotal: selectedPrice.price
                });
            }

            // Simpan Header Transaksi
            const transaction = await transactionRepo.createTransaction({
                user_id,
                product_id: items[0].product_id,
                total_price: totalTransactionPrice,
                status: "UNPAID",
                payment_method: payment_method || 'TRANSFER'
            }, { transaction: t });

            // Pasangkan ID Transaksi ke Detail & simpan (Bulk Create)
            const finalDetails = detailsToCreate.map(detail => ({
                ...detail,
                transaction_id: transaction.id
            }));
            await transactionRepo.createBulkTransactionDetail(finalDetails, { transaction: t });

            await t.commit();
            return await transactionRepo.getTransactionById(transaction.id);

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getAllTransactionDatatables(query, user) {
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
                user // 🟢 Kirim info user
            }),
            transactionRepo.countAll(user), // 🟢 Kirim info user
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
        if (!checktTransaction) {
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
        const t = await sequelize.transaction();
        try {
            const checkTransaction = await transactionRepo.getTransactionById(id, { transaction: t });
            if (!checkTransaction) {
                throw new Error("Transaksi tidak ditemukan");
            }

            const oldStatus = checkTransaction.status;

            // Jika status berubah ke FAILED → kembalikan quota ke product_prices
            if (newStatus === 'FAILED' && oldStatus !== 'FAILED') {
                for (const detail of checkTransaction.details) {
                    if (!detail.product_id || !detail.room_types) continue;

                    // 🟢 Kembalikan quota sesuai multiplier tipe kamar, bukan flat +1
                    const multiplier = getQuotaMultiplier(detail.room_types);

                    const priceRow = await ProductPrices.findOne({
                        where: { product_id: detail.product_id, room_types: detail.room_types },
                        lock: t.LOCK.UPDATE,
                        transaction: t
                    });

                    if (priceRow) {
                        console.log(`[QUOTA RESTORE] product_id=${detail.product_id} | room_types="${detail.room_types}" | +${multiplier}`);
                        await ProductPrices.update(
                            { quota: priceRow.quota + multiplier },
                            { where: { product_id: detail.product_id, room_types: detail.room_types }, transaction: t }
                        );
                    }
                }
            }
            // Jika status kembali aktif dari FAILED → kurangi quota lagi di product_prices
            else if (oldStatus === 'FAILED' && newStatus !== 'FAILED') {
                // Kelompokkan per product_id:room_types
                const priceQuotaMap = {};
                for (const detail of checkTransaction.details) {
                    if (!detail.product_id || !detail.room_types) continue;
                    const key = `${detail.product_id}:${detail.room_types}`;
                    priceQuotaMap[key] = (priceQuotaMap[key] || 0) + 1;
                }

                for (const [key, qty] of Object.entries(priceQuotaMap)) {
                    const [productId, roomType] = key.split(':');

                    // 🟢 Hitung ulang quota yang harus dikurangi sesuai multiplier tipe kamar
                    const multiplier = getQuotaMultiplier(roomType);
                    const quotaToDeduct = qty * multiplier;

                    const priceRow = await ProductPrices.findOne({
                        where: { product_id: productId, room_types: roomType },
                        lock: t.LOCK.UPDATE,
                        transaction: t
                    });

                    if (!priceRow) throw new Error(`Tipe kamar "${roomType}" tidak ditemukan untuk produk ID ${productId}`);
                    if (priceRow.quota < quotaToDeduct) {
                        throw new Error(`Kuota tipe kamar "${roomType}" tidak mencukupi untuk mengaktifkan kembali transaksi (sisa: ${priceRow.quota}, dibutuhkan: ${quotaToDeduct})`);
                    }

                    await ProductPrices.update(
                        { quota: priceRow.quota - quotaToDeduct },
                        { where: { product_id: productId, room_types: roomType }, transaction: t }
                    );
                }
            }

            await transactionRepo.updateTransaction(id, {
                status: newStatus,
                updated_at: new Date()
            }, { transaction: t });

            await t.commit();
            return await transactionRepo.getTransactionById(id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async deleteTransaction(id) {
        const t = await sequelize.transaction();
        try {
            const checkTransaction = await transactionRepo.getTransactionById(id, { transaction: t });
            if (!checkTransaction) {
                throw new Error("Transaksi tidak ditemukan");
            }

            // Restore quota ke product_prices jika transaksi belum berstatus FAILED
            if (checkTransaction.status !== 'FAILED') {
                for (const detail of checkTransaction.details) {
                    if (!detail.product_id || !detail.room_types) continue;

                    // 🟢 Kembalikan quota sesuai multiplier tipe kamar, bukan flat +1
                    const multiplier = getQuotaMultiplier(detail.room_types);

                    const priceRow = await ProductPrices.findOne({
                        where: { product_id: detail.product_id, room_types: detail.room_types },
                        lock: t.LOCK.UPDATE,
                        transaction: t
                    });

                    if (priceRow) {
                        console.log(`[QUOTA RESTORE DELETE] product_id=${detail.product_id} | room_types="${detail.room_types}" | +${multiplier}`);
                        await ProductPrices.update(
                            { quota: priceRow.quota + multiplier },
                            { where: { product_id: detail.product_id, room_types: detail.room_types }, transaction: t }
                        );
                    }
                }
            }

            const deleted = await transactionRepo.deleteTransaction(id, { transaction: t });
            await t.commit();
            return deleted;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
    }



module.exports = new TransactionService();