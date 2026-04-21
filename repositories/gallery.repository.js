const { Model, Op } = require("sequelize"); // Import Op for Sequelize operators
const { Gallery } = require("../models");

class GalleryRepository {
    async getAllGalleries() {
        return await Gallery.findAll();
    }

     async countAll() {
        return await Gallery.count(); // Total semua produk tanpa filter
    }
    async getPaginatedGallery({ start, length, search, order, columns }) {
        const where = {
            ...(search && {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { slug: { [Op.like]: `%${search}%` } },
                    
                ]
            })
            // Add any other filters you need here
        }

        const sort = order && order.length > 0
            ? [[columns[order[0].column].data, order[0].dir]]
            : [['created_at', 'DESC']];

        const offset = start || 0; // Default to 0 if start is not provided
        // const limit = length || 10; // Default to 10 if length is not provided
        const limit = Math.min(parseInt(length) || 10, 50);

        const result = await Gallery.findAndCountAll({
            where,
            order: sort,
            offset,
            limit
        });

        return result;
    }

    async getGalleryById(id) {
        return await Gallery.findByPk(id);
    }

    async createGallery(GalleryData) {
        return await Gallery.create(GalleryData);
    }

    async updateGallery(id, GalleryData) {
        await Gallery.update(GalleryData, { where : {id} });
        return await Gallery.findByPk(id)
    }

    async deleteGallery(id) {
        return await Gallery.destroy({ where : {id} });
    }
}

module.exports = new GalleryRepository();