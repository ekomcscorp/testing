const { sequelize, Transaction, TransactionDetail, ProductPrices, TransactionInstallment } = require("../../models");
const transactionRepo = require("../../repositories/transactions/transaction.repository");
const productRepo = require("../../repositories/products/product.repository");
const travelRekeningService = require("../travel_rekening.service");
const { DATE } = require("sequelize");

function getQuotaMultiplier(/* roomType */) {
    return 1; // selalu kurangi 1 seat per item
}

class TransactionService {
    // =======================
    // 1. CHECKOUT REGULER (FULL PAYMENT)
    // =======================
    async checkout(payload) {
        const { user_id, items, payment_method, payment_selection } = payload;

        if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
            throw new Error("Data user_id dan daftar items wajib diisi");
        }

        const t = await sequelize.transaction();

        try {
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
                const multiplier = getQuotaMultiplier(roomType);
                const quotaToDeduct = qty * multiplier;

                const priceRow = await ProductPrices.findOne({
                    where: { product_id: productId, room_types: roomType },
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (!priceRow) {
                    throw new Error(`Tipe kamar "${roomType}" tidak ditemukan untuk produk ID ${productId}`);
                }

                if (priceRow.quota < quotaToDeduct) {
                    throw new Error(`Kuota tipe kamar "${roomType}" tidak mencukupi (sisa: ${priceRow.quota}, dibutuhkan: ${quotaToDeduct})`);
                }

                await ProductPrices.update(
                    { quota: priceRow.quota - quotaToDeduct },
                    { where: { product_id: productId, room_types: roomType }, transaction: t }
                );
            }

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

            // Resolve pilihan rekening jamaah dari produk pertama
            const firstProduct = productCache[items[0].product_id];
            let rekeningType = 'MARKETPLACE';
            let travelRekeningId = null;
            let rekeningSnapshot = null;

            if (firstProduct && firstProduct.user_id) {
                const resolvedRekening = await travelRekeningService.resolvePaymentSelection(
                    firstProduct.user_id,
                    payment_selection
                );
                rekeningType = resolvedRekening.rekening_type;
                travelRekeningId = resolvedRekening.travel_rekening_id;
                rekeningSnapshot = resolvedRekening.snapshot;
                console.log(`[REKENING CHECKOUT] Travel user_id=${firstProduct.user_id} | type=${rekeningType} | travel_rekening_id=${travelRekeningId}`);
            }

            // Simpan Header Transaksi
            const transaction = await transactionRepo.createTransaction({
                user_id,
                product_id: items[0].product_id,
                total_price: totalTransactionPrice,
                status: "UNPAID",
                payment_method: payment_method || 'TRANSFER',
                rekening_mode: rekeningType,
                rekening_type: rekeningType,
                travel_rekening_id: travelRekeningId,
                rekening_snapshot: rekeningSnapshot,
                payment_type: 'FULL',
                installment_status: 'NOT_STARTED'
            }, { transaction: t });

            const finalDetails = detailsToCreate.map(detail => ({
                ...detail,
                transaction_id: transaction.id
            }));
            await transactionRepo.createBulkTransactionDetail(finalDetails, { transaction: t });

            await t.commit();
            return await transactionRepo.getTransactionById(transaction.id);

        } catch (error) {
            if(t && !t.finished) {
                await t.rollback();
            }

            console.log("[ERROR]", error)
            throw error;
        }
    }

    // =======================
    // 2. CHECKOUT CICILAN (3x INSTALLMENT)
    // ========================
    async checkoutInstallment(payload) {
        const { user_id, items, payment_method, payment_selection } = payload;

        if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
            throw new Error("Data user_id dan daftar items wajib diisi");
        }
        const now = new Date();

        const t = await sequelize.transaction();

        try {
            // A. Kunci & Kurangi Kuota Langsung Sejak Booking (Anti Double Booking)
            const priceQuotaMap = {};
            for (const item of items) {
                if (!item.product_id || !item.room_types) {
                    throw new Error("Setiap item harus memiliki product_id dan room_types");
                }
                const key = `${item.product_id}:${item.room_types}`;
                priceQuotaMap[key] = (priceQuotaMap[key] || 0) + 1;
            }

            for (const [key, qty] of Object.entries(priceQuotaMap)) {
                const [productId, roomType] = key.split(':');
                const multiplier = getQuotaMultiplier(roomType);
                const quotaToDeduct = qty * multiplier;

                const priceRow = await ProductPrices.findOne({
                    where: { product_id: productId, room_types: roomType },
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (!priceRow) throw new Error(`Tipe kamar "${roomType}" tidak ditemukan untuk produk ID ${productId}`);
                if (priceRow.quota < quotaToDeduct) {
                    throw new Error(`Kuota tipe kamar "${roomType}" tidak mencukupi (sisa: ${priceRow.quota}, dibutuhkan: ${quotaToDeduct})`);
                }

                await ProductPrices.update(
                    { quota: priceRow.quota - quotaToDeduct },
                    { where: { product_id: productId, room_types: roomType }, transaction: t }
                );
            }

            // B. Buat Snapshot Details & Hitung Subtotal
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

                const hotelsSnapshot = product.hotels?.map(h => ({ name: h.name, city: h.city, rating: h.rating })) || [];
                const flightsSnapshot = product.flights?.map(f => ({ airline_name: f.airline_name, type: f.type })) || [];
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
                    subtotal: selectedPrice.price,
                },);
            }

            // C. Resolve Rekening Tujuan untuk Transaksi Cicilan
            const firstProduct = productCache[items[0].product_id];
            let rekeningType = 'MARKETPLACE';
            let travelRekeningId = null;
            let rekeningSnapshot = null;

            if(!firstProduct?.tgl_keberangkatan) {
                throw new Error ("Tanggal keberangkatan produk tidak valid untuk kalkulasi cicilan")
            }

           const departureDate = new Date(firstProduct.tgl_keberangkatan);

            // 1. Pelunasan 2 (H-14 Sebelum Keberangkatan)
            const pelunasan2DueDate = new Date(departureDate);
            pelunasan2DueDate.setDate(pelunasan2DueDate.getDate() - 14);

            // 2. DP (H+3 Dari Sekarang)
            const dpDueDate = new Date(now);
            dpDueDate.setDate(dpDueDate.getDate() + 1);

            // Guarding: Jika jarak ke departure terlalu dekat
            if (dpDueDate > pelunasan2DueDate) {
            dpDueDate.setTime(pelunasan2DueDate.getTime());
            }

            // 3. Pelunasan 1 (Titik Tengah Antara DP dan Pelunasan 2 secara Milidetik)
            // ✅ PERBAIKAN: Gunakan .getTime() untuk kedua variabel
            const midTimestamp = dpDueDate.getTime() + (pelunasan2DueDate.getTime() - dpDueDate.getTime()) / 2;
            const pelunasan1DueDate = new Date(midTimestamp);

            if (firstProduct && firstProduct.user_id) {
                const resolvedRekening = await travelRekeningService.resolvePaymentSelection(
                    firstProduct.user_id,
                    payment_selection
                );
                rekeningType = resolvedRekening.rekening_type;
                travelRekeningId = resolvedRekening.travel_rekening_id;
                rekeningSnapshot = resolvedRekening.snapshot;
            }

            // D. Simpan Header Transaksi Utama (Induk)
            const transaction = await transactionRepo.createTransaction({
                user_id,
                product_id: items[0].product_id,
                total_price: totalTransactionPrice,
                status: "UNPAID",
                payment_method: payment_method || 'TRANSFER',
                rekening_mode: rekeningType,
                rekening_type: rekeningType,
                travel_rekening_id: travelRekeningId,
                rekening_snapshot: rekeningSnapshot,
                payment_type: 'INSTALLMENT',
                installment_status: 'NOT_STARTED'
            }, { transaction: t });

            // E. Simpan Details
            const finalDetails = detailsToCreate.map(detail => ({ ...detail, transaction_id: transaction.id }));
            await transactionRepo.createBulkTransactionDetail(finalDetails, { transaction: t });

            // F. Hitung Nominal 3 Termin (30% DP, 35% Pelunasan 1, 35% Pelunasan 2)
            const FIX_DP_AMOUNT = 10000000;
            const dpAmount = FIX_DP_AMOUNT;
            // 2. Sisa yang harus dilunasi
            const remainingAmount = totalTransactionPrice - dpAmount;
            const pelunasan1Amount = Math.floor(remainingAmount / 2);
            const pelunasan2Amount = totalTransactionPrice - (dpAmount + pelunasan1Amount); // Mencegah selisih pembulatan rupiah

            const installmentsData = [
                {
                    transaction_id: transaction.id,
                    installment_number: 1,
                    amount: dpAmount,
                    due_date: dpDueDate,
                    status: 'UNPAID'
                },
                {
                    transaction_id: transaction.id,
                    installment_number: 2,
                    amount: pelunasan1Amount,
                    due_date: pelunasan1DueDate,
                    status: 'UNPAID'
                },
                {
                    transaction_id: transaction.id,
                    installment_number: 3,
                    amount: pelunasan2Amount,
                    due_date: pelunasan2DueDate,
                    status: 'UNPAID'
                }
            ];

            await transactionRepo.createBulkInstallments(installmentsData, { transaction: t });

            await t.commit();
            return await transactionRepo.getTransactionById(transaction.id);

        } catch (error) {
            if(t && !t.finished){ 
                await t.rollback();
            }
            throw error;
        }
    }

    // ========================
    // 3. UPDATE PEMBAYARAN TERMIN CICILAN (EVIDENCE UPLOAD)
    // =======================
    async updateInstallmentPayment(installmentId, payload) {
        const { evidence_url, payment_method } = payload;
        const t = await sequelize.transaction();

        try {
            const installment = await TransactionInstallment.findByPk(installmentId, {
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            if (!installment) {
                throw new Error("Data termin cicilan tidak ditemukan");
            }

            // Jika sudah SUCCESS, abaikan (Idempotent)
            if (installment.status === 'SUCCESS') {
                await t.rollback();
                return await transactionRepo.getTransactionById(installment.transaction_id);
            }

            // Update status termin jadi PENDING
            await transactionRepo.updateInstallment(installmentId, {
                evidence_url,
                payment_method: payment_method || 'TRANSFER',
                status: 'PENDING',
                updated_at: new Date()
            }, { transaction: t });

            await t.commit();
            return await transactionRepo.getTransactionById(installment.transaction_id);

        } catch (error) {
            if (t && !t.finished) await t.rollback();
            throw error;
        }
    }

    // ========================
    // 4. VERIFIKASI PEMBAYARAN TERMIN DARI ADMIN
    // ========================
   async updateInstallmentStatus(installmentId, newInstallmentStatus) {
    const t = await sequelize.transaction();

    try {
        const installment = await TransactionInstallment.findByPk(installmentId, {
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!installment) {
            throw new Error("Data termin cicilan tidak ditemukan");
        }

        // Update status termin saat ini (misal: SUCCESS)
        await transactionRepo.updateInstallment(installmentId, {
            status: newInstallmentStatus,
            paid_at: newInstallmentStatus === 'SUCCESS' ? new Date() : null,
            updated_at: new Date()
        }, { transaction: t });

        // Hitung total termin yang sudah SUCCESS untuk transaksi ini
        const allInstallments = await TransactionInstallment.findAll({
            where: { transaction_id: installment.transaction_id },
            transaction: t
        });

        const paidCount = allInstallments.filter(item => 
            item.id === Number(installmentId) ? newInstallmentStatus === 'SUCCESS' : item.status === 'SUCCESS'
        ).length;

        // Tentukan status induk berdasarkan jumlah termin lunas
        let parentStatus = 'UNPAID';
        let parentInstallmentStatus = 'NOT_STARTED';

        if (paidCount === 1) {
            parentStatus = 'PENDING';
            parentInstallmentStatus = 'DP_PAID';
        } else if (paidCount === 2) {
            parentStatus = 'PENDING';
            parentInstallmentStatus = 'PARTIALLY_PAID';
        } else if (paidCount === 3) {
            parentStatus = 'SUCCESS';
            parentInstallmentStatus = 'FULLY_PAID';
        }

        // Update header transaction
        await transactionRepo.updateTransaction(installment.transaction_id, {
            status: parentStatus,
            installment_status: parentInstallmentStatus,
            updated_at: new Date()
        }, { transaction: t });

        await t.commit();
        return await transactionRepo.getTransactionById(installment.transaction_id);

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        throw error;
    }
}

    // =========================
    // METHOD EKSISTING LAINNYA
    // =========================
    async getAllTransactionDatatables(query, user) {
        const { draw, start, length, order, columns } = query;
        const search = query["search[value]"] || query.search?.value || "";

        const [result, totalCount] = await Promise.all([
            transactionRepo.getPaginatedTransaction({
                start: parseInt(start) || 0,
                length: parseInt(length) || 10,
                search,
                order,
                columns,
                user
            }),
            transactionRepo.countAll(user),
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
        });

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

            if (newStatus === 'FAILED' && oldStatus !== 'FAILED') {
                for (const detail of checkTransaction.details) {
                    if (!detail.product_id || !detail.room_types) continue;

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
            } else if (oldStatus === 'FAILED' && newStatus !== 'FAILED') {
                const priceQuotaMap = {};
                for (const detail of checkTransaction.details) {
                    if (!detail.product_id || !detail.room_types) continue;
                    const key = `${detail.product_id}:${detail.room_types}`;
                    priceQuotaMap[key] = (priceQuotaMap[key] || 0) + 1;
                }

                for (const [key, qty] of Object.entries(priceQuotaMap)) {
                    const [productId, roomType] = key.split(':');
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

            if (checkTransaction.status !== 'FAILED') {
                for (const detail of checkTransaction.details) {
                    if (!detail.product_id || !detail.room_types) continue;

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