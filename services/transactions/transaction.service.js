const { sequelize, Transaction, TransactionDetail, ProductPrices, TransactionInstallment } = require("../../models");
const transactionRepo = require("../../repositories/transactions/transaction.repository");
const productRepo = require("../../repositories/products/product.repository");
const travelRekeningService = require("../travel_rekening.service");
const { DATE, op } = require("sequelize");

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
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

           const rawDepartureDate = new Date(firstProduct.tgl_keberangkatan)
           const departureDate = new Date(rawDepartureDate.getFullYear(), rawDepartureDate.getMonth(), rawDepartureDate.getDate());

        //    Hitung selisih hari dari hari keberangkatan
           const diffInTime = departureDate.getTime() - today.getTime();
           const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

           if (diffInDays <= 14) {
                throw new Error(`Keberangkatan tinggal ${diffInDays} hari lagi. Pembayaran cicilan tidak tersedia (minimal H-14). Silakan pilih Full Payment.`);
            }

            // 1. Pelunasan 2 (H-14 Sebelum Keberangkatan)
            const pelunasan2DueDate = new Date(departureDate);
            pelunasan2DueDate.setDate(pelunasan2DueDate.getDate() - 14);

            // 2. DP (H+1 Dari Sekarang)
            const dpDueDate = new Date(now);
            dpDueDate.setDate(dpDueDate.getDate() + 1);

            // Guarding: Jika jarak ke departure terlalu dekat
            if (dpDueDate >= pelunasan2DueDate) {
                throw new Error('Waktu pembayaran cicilan tidak mencukupi. Silahkan pilih FULL PAYMENT')
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

            // F. Hitung Nominal 3 Termin (10jt DP, sisanya dibagi untuk pelunasan 1 dan 2)
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
            // 1. LOCK INSTALLMENT
            const installment = await TransactionInstallment.findByPk(
                installmentId,
                {
                    lock: t.LOCK.UPDATE,
                    transaction: t
                }
            );

            if (!installment) {
                throw new Error("Data termin cicilan tidak ditemukan");
            }

            // 2. GET PARENT TRANSACTION
            let transaction = await transactionRepo.getTransactionById(
                installment.transaction_id,
                { transaction: t }
            );

            if (!transaction) {
                throw new Error("Transaksi induk tidak ditemukan");
            }

            // 3. CEK DEADLINE CHECKOUT
            transaction = await this.expireTransactionIfNeeded(
                transaction,
                { transaction: t }
            );

            // 4. JIKA EXPIRED
            if (transaction.status === 'FAILED') {
                throw new Error("Transaksi sudah melewati batas waktu pembayaran 24 jam dan telah dibatalkan.");
            }

            // 5. TRANSAKSI SUDAH SELESAI
            if (transaction.status === 'SUCCESS') {
                throw new Error("Transaksi sudah selesai dan tidak dapat menerima pembayaran lagi.");
            }

            // 6. TERMIN SUDAH SUCCESS
            if (installment.status === 'SUCCESS') {
                await t.rollback();
                return await transactionRepo.getTransactionById(installment.transaction_id);
            }

            // 7. TERMIN SEDANG MENUNGGU VERIFIKASI
            if (installment.status === 'PENDING') {
                throw new Error("Bukti pembayaran termin ini sedang menunggu verifikasi admin.");
            }

            // 8. HANYA UNPAID BOLEH UPLOAD
            if (installment.status !== 'UNPAID') {
                throw new Error("Status termin tidak mengizinkan upload pembayaran.");
            }

            // 9. SIMPAN BUKTI DI TERMIN CICILAN
            await transactionRepo.updateInstallment(
                installmentId,
                {
                    evidence_url,
                    payment_method: payment_method || 'TRANSFER',
                    status: 'PENDING',
                    updated_at: new Date()
                },
                { transaction: t }
            );

            // 💡 [SOLUSI BUG 1]: UPDATE JUGA STATUS TRANSAKSI INDUK MENJADI 'PENDING'
            if (transaction.status === 'UNPAID') {
                await transactionRepo.updateTransaction(
                    transaction.id,
                    {
                        status: 'PENDING',
                        updated_at: new Date()
                    },
                    { transaction: t }
                );
            }

            await t.commit();

            return await transactionRepo.getTransactionById(installment.transaction_id);

        } catch (error) {
            if (t && !t.finished) {
                await t.rollback();
            }
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

    // Helper di dalam TransactionService atau di atas class
    // ==========================================
    // SCHEDULER: AUTO EXPIRE OVERDUE TRANSACTIONS
    // ==========================================
    async expireOverdueTransactions() {
        const t = await sequelize.transaction();

        try {
            const now = new Date();

            const activeTransactions = await Transaction.findAll({
                where: {
                    status: {
                        [require('sequelize').Op.notIn]: ['SUCCESS', 'FAILED']
                    }
                },
                include: [
                    {
                        model: TransactionInstallment,
                        as: 'installments'
                    },
                    {
                        model: TransactionDetail,
                        as: 'details'
                    }
                ],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            for (const tx of activeTransactions) {
                let shouldFail = false;

                const createdAtTime = new Date(tx.created_at).getTime();
                if (Number.isNaN(createdAtTime)) continue;

                // Batas Waktu 24 Jam sejak checkout (Ubah 10*1000 ke 24*60*60*1000 saat Production)
                const PAYMENT_DEADLINE_MS = 24 * 60 * 60 * 1000;
                const isPast24Hours = now.getTime() >= (createdAtTime + PAYMENT_DEADLINE_MS);

                // 1. FULL PAYMENT (Kadaluarsa jika > 24 jam)
                // if (tx.payment_type === 'FULL') {
                //     if (isPast24Hours) {
                //         shouldFail = true;
                //     }
                // }
                
                // 2. INSTALLMENT (Kadaluarsa HANYA jika DP/Termin 1 bernilai UNPAID & > 24 jam)
                 if (tx.payment_type === 'INSTALLMENT') {
                    const dpInstallment = tx.installments?.find(
                        inst => inst.installment_number === 1
                    );

                    if (dpInstallment && dpInstallment.status === 'UNPAID' && isPast24Hours) {
                        shouldFail = true;
                    }
                }

                // EKSEKUSI FAIL & RESTORE QUOTA
                if (shouldFail) {
                    console.log(
                        `[AUTO-EXPIRE] Transaksi ID ${tx.id} (${tx.payment_type}) ` +
                        `kadaluarsa karena DP/Full Payment belum dilunasi > 24 jam.`
                    );

                    await this._updateStatusInTransaction(
                        tx.id,
                        'FAILED',
                        t
                    );
                }
            }

            await t.commit();

        } catch (error) {
            if (t && !t.finished) {
                await t.rollback();
            }

            console.error('[EXPIRE OVERDUE ERROR]', error);
        }
    }

    // ==========================================
    // GUARDING CHECK: EXPIRE ON UPLOAD/PAYMENT
    // ==========================================
    async expireTransactionIfNeeded(transactionInstance, options = {}) {
        if (!transactionInstance) {
            return transactionInstance;
        }

        // Jika transaksi sudah berada di status akhir, abaikan
        if (['SUCCESS', 'FAILED'].includes(transactionInstance.status)) {
            return transactionInstance;
        }

        const createdAtTime = new Date(transactionInstance.created_at).getTime();
        if (Number.isNaN(createdAtTime)) {
            throw new Error("Tanggal pembuatan transaksi tidak valid.");
        }

        const PAYMENT_DEADLINE_MS = 24 * 60 * 60 * 1000;
        const expiredAt = createdAtTime + PAYMENT_DEADLINE_MS;
        const isPastDeadline = Date.now() >= expiredAt;

        let shouldFail = false;

        // if (transactionInstance.payment_type === 'FULL') {
        //     if (isPastDeadline) {
        //         shouldFail = true;
        //     }
        // } 
        
        if (transactionInstance.payment_type === 'INSTALLMENT') {
            const dpInstallment = transactionInstance.installments?.find(
                inst => inst.installment_number === 1
            );

            // Validasi spesifik: Hanya batalkan jika Termin 1 (DP) masih UNPAID
            if (dpInstallment && dpInstallment.status === 'UNPAID' && isPastDeadline) {
                shouldFail = true;
            }
        }

        if (!shouldFail) {
            return transactionInstance;
        }

        console.log(
            `[TRANSACTION EXPIRED] transaction_id=${transactionInstance.id} ` +
            `diubah ke FAILED karena melewati batas waktu 24 jam.`
        );

        if (options.transaction) {
            return await this._updateStatusInTransaction(
                transactionInstance.id,
                'FAILED',
                options.transaction
            );
        }

        return await this.updateStatus(
            transactionInstance.id,
            'FAILED'
        );
    }
    
    async updatePayment(id, payload) {
        const t = await sequelize.transaction();
        try {
                let transaction = await transactionRepo.getTransactionById(id, { transaction: t });

                if (!transaction) {
                    throw new Error("Transaksi tidak ditemukan");
                }

                transaction = await this.expireTransactionIfNeeded(transaction, { transaction: t });

                if(transaction.status === 'FAILED') {
                    throw new Error("Transaksi sudah melewati batas waktu pembayaran 24 jam dan telah dibatalkan.");
                }

                if(transaction.status !== 'UNPAID' && transaction.status !== 'PENDING') {
                    throw new Error("Status transaksi tidak mengizinkan upload pembayaran.");
                }

                await transactionRepo.updateTransaction(id, {
                    evidence_url: payload.evidence_url,
                    status: 'PENDING',
                    updated_at: new Date()
                },{
                    transaction: t
                });

                await t.commit();

                return await transactionRepo.getTransactionById(id);
        } catch(error) {
            if (t && !t.finished) {
                await t.rollback();
            }

            throw error;
        }
    }

    async updateStatus(id, newStatus) {
    const t = await sequelize.transaction();

    try {
        const transaction = await this._updateStatusInTransaction(
            id,
            newStatus,
            t
        );

        await t.commit();

        return await transactionRepo.getTransactionById(id);

    } catch (error) {
        if (t && !t.finished) {
            await t.rollback();
        }

        throw error;
    }
}

    async _updateStatusInTransaction(id, newStatus, t) {
        const transaction = await transactionRepo.getTransactionById(id, {
            transaction: t
        });

        if (!transaction) {
            throw new Error("Transaksi tidak ditemukan");
        }

        const oldStatus = transaction.status;

        // Tidak perlu melakukan apa-apa kalau status sama
        if (oldStatus === newStatus) {
            return transaction;
        }

        // ==========================================
        // FAILED
        // ==========================================
        if (newStatus === 'FAILED' && oldStatus !== 'FAILED') {
            for (const detail of transaction.details || []) {
                if (!detail.product_id || !detail.room_types) {
                    continue;
                }

                const multiplier = getQuotaMultiplier(detail.room_types);

                const priceRow = await ProductPrices.findOne({
                    where: {
                        product_id: detail.product_id,
                        room_types: detail.room_types
                    },
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (priceRow) {
                    console.log(
                        `[QUOTA RESTORE] ` +
                        `transaction_id=${id} | ` +
                        `product_id=${detail.product_id} | ` +
                        `room_types="${detail.room_types}" | ` +
                        `+${multiplier}`
                    );

                    await ProductPrices.update(
                        {
                            quota: priceRow.quota + multiplier
                        },
                        {
                            where: {
                                product_id: detail.product_id,
                                room_types: detail.room_types
                            },
                            transaction: t
                        }
                    );
                }
            }
        }

        // ==========================================
        // FAILED → STATUS LAIN
        // ==========================================
        else if (oldStatus === 'FAILED' && newStatus !== 'FAILED') {
            const priceQuotaMap = {};

            for (const detail of transaction.details || []) {
                if (!detail.product_id || !detail.room_types) {
                    continue;
                }

                const key = `${detail.product_id}:${detail.room_types}`;

                priceQuotaMap[key] =
                    (priceQuotaMap[key] || 0) + 1;
            }

            for (const [key, qty] of Object.entries(priceQuotaMap)) {
                const [productId, roomType] = key.split(':');

                const multiplier = getQuotaMultiplier(roomType);

                const quotaToDeduct = qty * multiplier;

                const priceRow = await ProductPrices.findOne({
                    where: {
                        product_id: productId,
                        room_types: roomType
                    },
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (!priceRow) {
                    throw new Error(
                        `Tipe kamar "${roomType}" tidak ditemukan untuk produk ID ${productId}`
                    );
                }

                if (priceRow.quota < quotaToDeduct) {
                    throw new Error(
                        `Kuota tipe kamar "${roomType}" tidak mencukupi untuk mengaktifkan kembali transaksi`
                    );
                }

                await ProductPrices.update(
                    {
                        quota: priceRow.quota - quotaToDeduct
                    },
                    {
                        where: {
                            product_id: productId,
                            room_types: roomType
                        },
                        transaction: t
                    }
                );
            }
        }

        await transactionRepo.updateTransaction(
            id,
            {
                status: newStatus,
                updated_at: new Date()
            },
            {
                transaction: t
            }
        );

        transaction.status = newStatus;

        return transaction;
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