const fs = require("fs");
const path = require("path");
const { sequelize } = require("../../models");
const productRepository = require("../../repositories/products/product.repository");
const productPricesRepository = require("../../repositories/products/productPrices.repository");
const productFlightRepository = require("../../repositories/products/productFlight.repository");
const productNoteRepository = require("../../repositories/products/productNote.repository");
const productSnKRepository = require("../../repositories/products/productSnK.repository");
const productHotelRepository = require("../../repositories/products/productHotel.repository")
const productFacilityRepository = require("../../repositories/products/productFacility.repository");
const productItineraryRepository = require("../../repositories/products/productItinerary.repository");


// Helper hapus file yang aman di Production
const safeDeleteFile = (folderSubPath, filename) => {
    if (!filename) return;
    try {
        const cleanFileName = path.basename(filename);
        // Menggunakan process.cwd() menunjuk langsung ke root project
        const absolutePath = path.resolve(process.cwd(), "public/assets/img/products", folderSubPath, cleanFileName);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`[FILE DELETED] ${absolutePath}`);
        } else {
            console.warn(`[FILE NOT FOUND] ${absolutePath}`);
        }
    } catch (e) {
        console.error(`[DELETE ERROR] ${filename}:`, e.message);
    }
};

class ProductService {
   async getAllProduct(user) {
        const product = await productRepository.getAllProduct(user);
        return product || [] ;
   }

   async getProductById(id) {
        try{
            const product = await productRepository.getProductById(id);
            return product || null;
        } catch (error) {
            throw new Error(error.message);
        }
   }

   async getAllProductsDatatables(query) {
    const { draw, start, length, order, columns, user } = query;
    const searchValue = query.search?.value || query['search[value]'] || "";

    // ✅ Tidak perlu Promise.all jika countAll sudah tercakup di getPaginatedProduct
    const [paginatedResult, totalCount] = await Promise.all([
        productRepository.getPaginatedProduct({
            start: parseInt(start, 10) || 0,
            length: parseInt(length, 10) || 10,
            search: searchValue,
            order,
            columns,
            user
        }),
        productRepository.countAll(user)
    ]);

    // Sekarang paginatedResult sudah { count, rows }
    return {
        draw: parseInt(draw, 10) || 0,
        recordsTotal: totalCount,
        recordsFiltered: paginatedResult.count,  // Tidak undefined
        data: paginatedResult.rows               //  Tidak undefined
    };
}

    async createProduct(productData, userId) {
    const transaction = await sequelize.transaction();

    try {
        let { prices, flights, notes, snks, facilities, hotels, itineraries, ...productFields } = productData;

        const ensureArray = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            if (typeof data === 'string') {
                try { return JSON.parse(data); } catch { return []; }
            }
            return [data];
        };

        const validatePrices = ensureArray(prices);
        const validateFlights = ensureArray(flights);
        const validateNotes = ensureArray(notes);
        const validateSnks = ensureArray(snks);
        const validateFacilities = ensureArray(facilities);
        const validateHotels = ensureArray(hotels);
        const validateItineraries = ensureArray(itineraries);

        for (const i of validateItineraries) {
            if (!i.title || i.title.trim() === '') {
                throw new Error("Title/Lokasi Itinerary wajib diisi");
            }
        }

        productFields.user_id = userId;

        // ✅ create product
        const newProduct = await productRepository.createProduct(productFields, { transaction });

        // ✅ helper insert
        const bulkInsert = async (repo, data, mapper) => {
            if (!data.length) return;
            const payload = data.map(item => mapper(item, newProduct.id));
            await repo.createMany(payload, { transaction });
        };

        await bulkInsert(productPricesRepository, validatePrices, (p, id) => ({
            product_id: id,
            room_types: p.room_types,
            price: p.price,
            quota: p.quota || 0
        }));

        await bulkInsert(productFlightRepository, validateFlights, (f, id) => ({
            product_id: id,
            airline_name: f.airline_name,
            type: f.type
        }));

        await bulkInsert(productNoteRepository, validateNotes, (n, id) => ({
            product_id: id,
            note: n.note
        }));

        await bulkInsert(productSnKRepository, validateSnks, (s, id) => ({
            product_id: id,
            name: s.name
        }));

        await bulkInsert(productFacilityRepository, validateFacilities, (f, id) => ({
            product_id: id,
            facility: f.facility,
            type: f.type
        }));

        await bulkInsert(productHotelRepository, validateHotels, (h, id) => ({
            product_id: id,
            name: h.name,
            city: h.city,
            rating: h.rating,
            jarak: h.jarak,
            image: h.image,
            facilities: h.facilities
        }));

        await bulkInsert(productItineraryRepository, validateItineraries, (i, id) => ({
            product_id: id,
            day_order: i.day_order,
            title: i.title,
            description: i.description
        }));

        await transaction.commit();
        return newProduct;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

    async updateProduct(id, productData) {
    const transaction = await sequelize.transaction();
        try {
            const oldProduct = await productRepository.getProductById(id);
            if (!oldProduct) {
                throw new Error("Product not found");
            }

            let { prices, flights, notes, snks, facilities, hotels, itineraries, ...productFields } = productData;

            // 💡 PERBAIKAN: Cek apakah ada file thumbnail baru yang diunggah
            let thumbnailToDelete = null;
            if (productFields.thumbnail_url && oldProduct.thumbnail_url && productFields.thumbnail_url !== oldProduct.thumbnail_url) {
                thumbnailToDelete = oldProduct.thumbnail_url;
            } else if (!productFields.thumbnail_url) {
                // Jika tidak ada thumbnail baru di-upload, pertahankan thumbnail_url yang lama
                productFields.thumbnail_url = oldProduct.thumbnail_url;
            }

            // 💡 PERBAIKAN: Deteksi gambar hotel yang diganti atau dihapus
            const oldHotelImages = (oldProduct.hotels || []).map(h => h.image).filter(Boolean);
            const newHotelImages = (hotels || []).map(h => h.image).filter(Boolean);
            const hotelImagesToDelete = oldHotelImages.filter(img => !newHotelImages.includes(img));

            // Validasi dan normalisasi status
            const validStatuses = ['draft', 'publish', 'closed'];
            if (productFields.status) {
                productFields.status = productFields.status.trim().toLowerCase();
                if (!validStatuses.includes(productFields.status)) {
                    throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
                }
            }

            // Update data produk utama
            await productRepository.updateProduct(id, productFields, { transaction });

            const updateRelation = async (repo, data, mapper) => {
                if (data) {
                    const validatedData = typeof data === "string" ? JSON.parse(data) : data;
                    await repo.deleteByProduct(id, { transaction });

                    if (validatedData.length > 0) {
                        const payload = validatedData.map(item => mapper(item, id));
                        await repo.createMany(payload, { transaction });
                    }
                }
            };

            // Proses Relasi
            await updateRelation(productPricesRepository, prices, (p, pid) => ({
                product_id: pid,
                room_types: p.type || p.room_types,
                price: p.price,
                quota: p.quota || 0
            }));

            await updateRelation(productFlightRepository, flights, (f, pid) => ({
                product_id: pid,
                airline_name: f.airline_name,
                type: f.type
            }));

            await updateRelation(productNoteRepository, notes, (n, pid) => ({
                product_id: pid,
                note: n.note
            }));

            await updateRelation(productHotelRepository, hotels, (h, pid) => ({
                product_id: pid,
                name: h.name,
                city: h.city,
                rating: h.rating,
                jarak: h.jarak,
                image: h.image || "",
                facilities: h.facilities
            }));

            await updateRelation(productItineraryRepository, itineraries, (i, pid) => {
                if (!i.title || i.title.trim() === '') {
                    throw new Error("Title/Lokasi Itinerary wajib diisi");
                }
                return {
                    product_id: pid,
                    day_order: i.day_order,
                    title: i.title,
                    description: i.description
                };
            });

            await updateRelation(productSnKRepository, snks, (i, pid) => ({
                product_id: pid,
                name: i.name
            }));

            await updateRelation(productFacilityRepository, facilities, (f, pid) => ({
                product_id: pid,
                facility: f.facility,
                type: f.type
            }));

            await transaction.commit();

            // 💡 UNLINK/DELETE FILE LAMA DARI DISK
            if (thumbnailToDelete) {
                safeDeleteFile("thumbnails", thumbnailToDelete);
            }

            for (const img of hotelImagesToDelete) {
                safeDeleteFile("hotels", img);
            }


            return await productRepository.getProductById(id);
        } catch (error) {
            if (transaction && !transaction.finished) await transaction.rollback();
            throw new Error(error.message);
        }
    }

    
       
       async deleteByProduct(id) {
            try {
                const product = await productRepository.getProductById(id);
                if (!product) return null;

                // Hapus thumbnail jika ada
                if (product.thumbnail_url) {
                    safeDeleteFile("thumbnails", product.thumbnail_url);
                }

                // Hapus gambar hotel jika ada
                if (product.hotels && product.hotels.length > 0) {
                    for (const hotel of product.hotels) {
                        if (hotel.image) {
                            safeDeleteFile("hotels", hotel.image);
                        }
                    }
                }

                return await productRepository.deleteProduct(id);
            } catch (error) {
                throw new Error(error.message);
            }
        }

       async getProductForLanding() {
        try {
            const products = await productRepository.getProductForLanding();
            return products || [];
        } catch (error) {
            throw new Error(error.message);
        }
       }

       async updateStatus(id, status) {
        const validStatuses = ['draft', 'publish', 'closed'];
        if (!status || typeof status !== 'string') {
            throw new Error('Status wajib diisi');
        }
        const normalized = status.trim().toLowerCase();
        if (!validStatuses.includes(normalized)) {
            throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
        }

        await productRepository.updateProduct(id, { status: normalized });
        return await productRepository.getProductById(id);
       }
}

module.exports = new ProductService;