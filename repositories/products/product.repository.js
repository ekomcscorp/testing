const { Model, Op, where, Transaction } = require("sequelize");
const { Product, ProductPrices, ProductFlight, ProductHotel, ProductFacility, ProductItinerary, ProductSnK, ProductNote, Akses, User } = require("../../models");

class ProductRepository {
    async getAllProduct() {
        return await Product.findAll({
            include: [
                {
                    model: ProductPrices,
                    as: "prices",
                    attributes: ["room_types", "price"]
                },
                {
                    model: ProductFlight,
                    as: "flights",
                    attributes: ["airline_name", "type"]
                },
                {
                    model: ProductHotel,
                    as: "hotels",
                    attributes: ["name", "city", "rating", "jarak", "image", "facilities"]
                },
                {
                    model: ProductFacility,
                    as: "facility",
                    attributes: ["facility", "type"]
                },
                {
                    model: ProductItinerary,
                    as: "itinerary",
                    attributes: ["day_order", "title", "description"]
                },
                {
                    model: ProductSnK,
                    as: "snk",
                    attributes: ["name"]
                },
                {
                    model: ProductNote,
                    as: "notes",
                    attributes: ["note"]
                },
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "fullname", "username"]

                }
            ],
            order: [["createdAt", "DESC"]]
        });
    }

    async getPaginatedProduct({ start, length, search, order, columns }) {
    // 1. Definisikan pencarian dengan nama field yang benar sesuai database
    const where = search ? {
        [Op.or]: [
            { nama_produk: { [Op.like]: `%${search}%` } }
        ]
    } : {};
    console.log("SEARCH REPO:", search);
    // 2. Pastikan limit dan offset aman
    const offset = parseInt(start) || 0;
    const limit = parseInt(length) || 10;

    let orderBy = [['createdAt', 'DESC']];
    if(order && order.length > 0){
        const columnName = columns[order[0].column]?.data;

        if (columnName) {
            orderBy = [[columnName, order[0].dir]];
        }
    }
         // Default order

    // 3. Sertakan 'include' agar data relasi (seperti prices) ikut terambil
    const result = await Product.findAndCountAll({
        where,
        include: [
           {
                    model: ProductPrices,
                    as: "prices",
                    attributes: ["room_types", "price"]
                },
                {
                    model: ProductFlight,
                    as: "flights",
                    attributes: ["airline_name", "type"]
                },
                {
                    model: ProductHotel,
                    as: "hotels",
                    attributes: ["name", "city", "rating", "jarak", "image", "facilities"]
                },
                {
                    model: ProductFacility,
                    as: "facility",
                    attributes: ["facility", "type"]
                },
                {
                    model: ProductItinerary,
                    as: "itinerary",
                    attributes: ["day_order", "title", "description"]
                },
                {
                    model: ProductSnK,
                    as: "snk",
                    attributes: ["name"]
                },
                {
                    model: ProductNote,
                    as: "notes",
                    attributes: ["note"]
                },
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "fullname", "username"]
                }
        ],
        
        order: orderBy,
        offset,
        limit,
        distinct: true // Penting saat menggunakan 'include' agar count() akurat
    });

    return result;
}

    async getProductById(id) {
        return await Product.findByPk(id,{
            include: [
                {
                    model: ProductPrices,
                    as: "prices",
                    attributes: ["room_types", "price"]
                },
                {
                    model: ProductFlight,
                    as: "flights",
                    attributes: ["airline_name", "type"]
                },
                {
                    model: ProductHotel,
                    as: "hotels",
                    attributes: ["name", "city", "rating", "jarak", "image", "facilities"]
                },
                {
                    model: ProductFacility,
                    as: "facility",
                    attributes: ["facility", "type"]
                },
                {
                    model: ProductItinerary,
                    as: "itinerary",
                    attributes: ["day_order", "title", "description"]
                },
                {
                    model: ProductSnK,
                    as: "snk",
                    attributes: ["name"]
                },
                {
                    model: ProductNote,
                    as: "notes",
                    attributes: ["note"]
                },
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "fullname", "username"]
                }
            ],
        });
    }

    async createProduct(productData, option = {}) {
        return await Product.create(productData, option);
    }
    async deleteProduct(id) {
        return await Product.destroy({ where: {id}});
    }
    async updateProduct(id, productData, options = {}) {
        return await Product.update(productData, {
            where: {id},
            transaction: options.transaction
        });
    }

    async countAll() {
        return await Product.count(); // Total semua produk tanpa filter
    }
}

module.exports = new ProductRepository;