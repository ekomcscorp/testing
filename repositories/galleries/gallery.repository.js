const { Model, Op } = require("sequelize"); // Import Op for Sequelize operators
const { Gallery, GalleryCategory } = require("../../models");

class GalleryRepository {
    async getAllGallery() {
        return await Gallery.findAll();
    }

    async getPaginatedGallery({ start, length, search, order, columns }) {
        const where = {
            ...(search && {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { image_url: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { category_id: { [Op.like]: `%${search}%` } },
                    { created_at: { [Op.like]: `%${search}%` } }                
                ]
            }),
            // Add any other filters you need here
        }

        const sort = order && order.length > 0
            ? [[columns[order[0].column].data, order[0].dir]]
            : [['created_at', 'DESC']];

        const offset = start || 0; // Default to 0 if start is not provided
        const limit = length || 10; // Default to 10 if length is not provided

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

    async createGallery(galleryData) {
        return await Gallery.create(galleryData);
    }

    async getGalleryByCategory(slug) {
        const include = {
            model: GalleryCategory,
            as: "category"
        };

        if (slug && slug !== "all") {
            include.where = { slug };
        }

        return await Gallery.findAll({
            include,
        });
    }

    async updateGallery(id, galleryData) {
        return await Gallery.update(galleryData, {where : {id} } );
    }

    async deleteGallery(id) {
        return await Gallery.destroy({ where : {id} });
    }
}

module.exports = new GalleryRepository();