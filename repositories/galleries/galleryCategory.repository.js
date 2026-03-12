const { Model, Op } = require("sequelize"); // Import Op for Sequelize operators
const { GalleryCategory } = require("../../models");

class GalleryCategoryRepository {
    async getAllGalleryCategory() {
        return await GalleryCategory.findAll();
    }

    async getPaginatedGalleryCategory({ start, length, search, order, columns }) {
        const where = {
            ...(search && {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { slug: { [Op.like]: `%${search}%` } },
                    { created_at: { [Op.like]: `%${search}%` } }
                ]
            })
            // Add any other filters you need here
        }

        const sort = order && order.length > 0
            ? [[columns[order[0].column].data, order[0].dir]]
            : [['created_at', 'DESC']];

        const offset = start || 0; // Default to 0 if start is not provided
        const limit = length || 10; // Default to 10 if length is not provided

        const result = await GalleryCategory.findAndCountAll({
            where,
            order: sort,
            offset,
            limit
        });

        return result;
    }

    async getGalleryCategoryById(id) {
        return await GalleryCategory.findByPk(id);
    }

    async createGalleryCategory(galleryCategoryData) {
        return await GalleryCategory.create(galleryCategoryData);
    }

    async updateGalleryCategory(id, galleryCategoryData) {
        return await GalleryCategory.update(galleryCategoryData, { where : {id} });
    }

    async deleteGalleryCategory(id) {
        return await GalleryCategory.destroy({ where : {id} });
    }
}

module.exports = new GalleryCategoryRepository();