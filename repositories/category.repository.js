const { Model, Op } = require("sequelize"); // Import Op for Sequelize operators
const { Category } = require("../models");

class CategoryRepository {
    async getAllCategory() {
        return await Category.findAll();
    }

    async getPaginatedCategory({ start, length, search, order, columns }) {
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

        const result = await Category.findAndCountAll({
            where,
            order: sort,
            offset,
            limit
        });

        return result;
    }

    async getCategoryById(id) {
        return await Category.findByPk(id);
    }

    async createCategory(CategoryData) {
        return await Category.create(CategoryData);
    }

    async updateCategory(id, CategoryData) {
        await Category.update(CategoryData, { where : {id} });
        return await Category.findByPk(id)
    }

    async deleteCategory(id) {
        return await Category.destroy({ where : {id} });
    }
}

module.exports = new CategoryRepository();