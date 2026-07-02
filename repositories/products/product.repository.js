const { Model, Op, where, col, Transaction } = require("sequelize");
const { Product, ProductPrices, ProductFlight, ProductHotel, ProductFacility, ProductItinerary, ProductSnK, ProductNote, Akses, User } = require("../../models");

class ProductRepository {
    async getAllProduct(user) {
        const queryWhere = {};
        if (user && user.id_level !== 4            ) {
            queryWhere.user_id = user.id;
        }

        return await Product.findAll({
            where: queryWhere,
            include: [
                {
                    model: ProductPrices,
                    as: "prices",
                    attributes: ["room_types", "price", "quota"]
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

    async getProductForLanding() {
        return await Product.findAll({
            where: { status: 'publish' },
            include: [
                {
                    model: ProductPrices,
                    as: "prices",
                    attributes: ["room_types", "price", "quota"]
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

   // repository
    async getPaginatedProduct({ start, length, search, order, columns, user }) {
        
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { nama_produk: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
                where(col('creator.fullname'), { [Op.like]: `%${search}%` })
            ];
        }

        if (user && user.id_level !== 1 && user.id_level !== 2) {
            whereClause.user_id = user.id;
        }

        const offset = parseInt(start) || 0;
        const limit = parseInt(length) || 10;

        let orderBy = [['createdAt', 'DESC']];
        if (order && order.length > 0) {
            const columnName = columns[order[0].column]?.data;
            if (columnName) {
                orderBy = [[columnName, order[0].dir]];
            }
        }

        // Step 1: Ambil IDs dengan pagination
        const { count, rows: idRows } = await Product.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: [],
                    required: false
                }
            ],
            attributes: ['id'],
            order: orderBy,
            offset,
            limit,
            distinct: true,
            subQuery: false
        });

        const productIds = idRows.map(p => p.id);

        if (productIds.length === 0) {
            return { count: 0, rows: [] };
        }

        // Step 2: Load full data berdasarkan IDs
        const rows = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
            include: [
                {
                    model: ProductPrices,
                    as: "prices",
                    attributes: ["room_types", "price", "quota"]
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
                    attributes: ["id", "fullname", "username"],
                    required: false
                }
            ],
            order: orderBy
        });

       
        return { count, rows };
    }

    async getProductById(id) {
        return await Product.findByPk(id,{
            include: [
                {
                    model: ProductPrices,
                    as: "prices",
                    attributes: ["room_types", "price", "quota"]
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

    async countAll(user) {
        const queryWhere = {};
        if (user && user.id_level !== 1) {
            queryWhere.user_id = user.id;
        }
        return await Product.count({ where: queryWhere }); // Total produk dengan atau tanpa filter
    }

    
}

module.exports = new ProductRepository;