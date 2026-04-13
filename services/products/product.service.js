const { sequelize } = require("../../models");
const productRepository = require("../../repositories/products/product.repository");
const productPricesRepository = require("../../repositories/products/productPrices.repository");
const productFlightRepository = require("../../repositories/products/productFlight.repository");
const productNoteRepository = require("../../repositories/products/productNote.repository");
const productSnKRepository = require("../../repositories/products/productSnK.repository");
const productHotelRepository = require("../../repositories/products/productHotel.repository")
const productFacilityRepository = require("../../repositories/products/productFacility.repository");
const productItineraryRepository = require("../../repositories/products/productItinerary.repository");




class ProductService {
   async getAllProduct() {
        const product = await productRepository.getAllProduct();
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
        // Destrukturisasi query dari datatables
        const { draw, start, length, search, order, columns } = query;
        const searchValue =
            query.search?.value ||
            query['search[value]'] ||
            "";

        // Panggil repository
         const [result, totalCount] = await Promise.all([
            productRepository.getPaginatedProduct({
                start: parseInt(start, 10) || 0,
                length: parseInt(length, 10) || 10,
                search: searchValue,
                order,
                columns
            }),
            productRepository.countAll() // ✅ Total tanpa filter
        ]);

        // findAndCountAll mengembalikan { count, rows }
        return {
            draw: parseInt(draw, 10) || 0,
            recordsTotal: totalCount,
            recordsFiltered: result.count,
            data: result.rows // Ini yang akan di-map di controller
        };
    }

       async createProduct(productData) {
            const transaction = await sequelize.transaction();

            try {
            let { prices, flights, notes, snks, facilities, hotels, itineraries, ...productFields } = productData;
            
            // Validasi dan normalisasi status
            const validStatuses = ['draft', 'publish', 'closed'];
            if (productFields.status) {
                productFields.status = productFields.status.trim().toLowerCase();
                
                if (!validStatuses.includes(productFields.status)) {
                    throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
                }
            }
            
            console.log("Created ProductFields with status:", productFields.status);
            
           // 2. Fungsi Helper untuk mastiin data itu Array
            const ensureArray = (data) => {
                if (!data) return []; // Kalau null/undefined, balikin array kosong
                if (Array.isArray(data)) return data; // Kalau udah array, balikin langsung
                if (typeof data === 'string') {
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        return [];
                    }
                }
                return [data]; // Kalau cuma 1 objek, bungkus jadi array
            };

            const validatePrices = ensureArray(prices);
            const validateFlights = ensureArray(flights);
            const validateNotes = ensureArray(notes);
            const validateSnks = ensureArray(snks);
            const validateFacilities = ensureArray(facilities);
            const validateHotels = ensureArray(hotels);
            const validateItineraries = ensureArray(itineraries);
            


            // if (typeof prices === "string") prices = JSON.parse(prices);
            // if (typeof flights === "string") flights = JSON.parse(flights);
            // if (typeof notes === "string") notes = JSON.parse(notes);
            // if (typeof snks === "string") snks = JSON.parse(snks);
            // if (typeof facilities === "string") facilities = JSON.parse(facilities);
            // if (typeof hotels === "string") hotels = JSON.parse(hotels);
            // if (typeof itineraries === "string") itineraries = JSON.parse(itineraries);


            //  create product
            const newProduct = await productRepository.createProduct(
                productFields,
                transaction
            );

            // console.log("Cek Tipe Data Prices:", typeof validatePrices);
            // console.log("Is Array?:", Array.isArray(validatePrices));
            // console.log("Isi Data:", validatePrices);
            //  create prices
            if (validatePrices?.length) {
                const pricePayload = validatePrices.map(p => ({
                product_id: newProduct.id,
                room_types: p.type,
                price: p.price
                }));

                await productPricesRepository.createMany(  pricePayload,
                transaction);   
                console.log("price payload:", pricePayload)
            }

            // create flights
            if (validateFlights?.length) {
                const flightPayload = validateFlights.map(f => ({
                product_id: newProduct.id,
                airline_name: f.airline_name,
                type: f.type // DEPARTURE / RETURN
               
                }));

                await productFlightRepository.createMany(
                flightPayload,
                transaction
                );
                console.log("flight payload:", flightPayload)
            }

            // create notes
            if (validateNotes?.length) {
                const notePayload = validateNotes.map(n => ({
                product_id: newProduct.id,
                note: n.note
                }));

                await productNoteRepository.createMany(
                notePayload,
                transaction
                );
                console.log("note payload:", notePayload)
            }

            // create SnK
            if(validateSnks?.length) {
                const snkPayload = validateSnks.map(s => ({
                product_id: newProduct.id,
                name: s.name
                }));

                await productSnKRepository.createMany(
                snkPayload,
                transaction
                );
                console.log("snk payload:", snkPayload)
            }

            //creare Facility
            if(validateFacilities?.length) {
                const facilityPayload = validateFacilities.map(f => ({
                product_id: newProduct.id,
                facility: f.facility,
                type: f.type
                }));

                await productFacilityRepository.createMany(
                facilityPayload,
                transaction
                );
                console.log("facility payload:", facilityPayload)
            }

            // createMany Hotel
            if(validateHotels?.length) {
                const hotelPayload = validateHotels.map(h => ({
                   product_id: newProduct.id,
                    name: h.name,
                    city: h.city,
                    rating: h.rating,
                    jarak: h.jarak,
                    image: h.image,
                    facilities: h.facilities
                }));

                await productHotelRepository.createMany(
                hotelPayload,
                transaction
                );
                console.log("hotel payload:", hotelPayload)
            }
            // 
            if(validateItineraries?.length){
                const itineraryPayload = validateItineraries.map(i => ({
                    product_id: newProduct.id,
                    day_order: i.day_order,
                    title: i.title,
                    description: i.description
                }));

                await productItineraryRepository.createMany(
                    itineraryPayload,
                    transaction
                );
                console.log("itinerary payload:", itineraryPayload)
            }

            await transaction.commit();
            return newProduct;

            } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
            }
        }

       async updateProduct(id, productData) {
        const transaction = await sequelize.transaction();
        try {
            let { prices, flights, notes, snks, facilities, hotels, itineraries, ...productFields } = productData;
            
            // Validasi dan normalisasi status
            const validStatuses = ['draft', 'publish', 'closed'];
            if (productFields.status) {
                productFields.status = productFields.status.trim().toLowerCase();
                
                if (!validStatuses.includes(productFields.status)) {
                    throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
                }
            }
            
            console.log("Updated ProductFields with status:", productFields.status);
            
            await productRepository.updateProduct(id, productFields);
            
            const updateRelation = async (repo, data, mapper) => {
                if(data) {
                    const validatedData = typeof data === "string" ? JSON.parse(data) : data;

                    await repo.deleteByProduct(id,{transaction});

                    if(validatedData.length > 0){
                        const payload = validatedData.map(item => mapper(item, id));
                        await repo.createMany(payload, {transaction});
                    }
                }
            }
             // 2. Proses Semua Relasi
                    await updateRelation(productPricesRepository, prices, (p, pid) => ({
                        product_id: pid, 
                        room_types: p.type || p.room_types, price: p.price
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
                        product_id: pid, name: h.name, city: h.city, rating: h.rating, jarak: h.jarak, image: h.image || "", facilities: h.facilities
                    }));

                    await updateRelation(productItineraryRepository, itineraries, (i, pid) => ({
                        product_id: pid, 
                        day_order: i.day_order, 
                        title: i.title, 
                        description: i.description
                    }));

                    await updateRelation(productSnKRepository, snks, (i, pid) => ({
                        product_id: pid, 
                        name: i.name
                    }));

                    await updateRelation(productFacilityRepository, facilities, (f, pid) => ({
                        product_id: pid, 
                        facility: f.facility, 
                        type: f.type
                    }));
            console.log("productFields:", productFields);
            await transaction.commit();
            return await productRepository.getProductById(id);
        } catch (error) {
            if(transaction) await transaction.rollback();
            throw new Error(error.message);
        }
       }

       async deleteByProduct(id) {
        try{
            return await productRepository.deleteProduct(id);
        } catch (error) {
            throw new Error(error.message);
        }
       }
}

module.exports = new ProductService;