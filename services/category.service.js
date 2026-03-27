const CategoryRepository = require("../repositories/category.repository");

class categoryService {
    async getAllCategory() {
        const Category = await CategoryRepository.getAllCategory();
        return Category; // jika null/undefined, tetap kembalikan array kosong
    }

    async getAllCategoryDatatables({ draw, start, length, search, order, columns }) {
        const searchValue = search?.value || "";

        const { count, rows } = await CategoryRepository.getPaginatedCategory({
            start: parseInt(start, 10) || 0,
            length: parseInt(length, 10) || 10,
            search: searchValue,
            order,
            columns
        });

        return {
            draw: parseInt(draw, 10),
            recordsTotal: count,
            recordsFiltered: count,
            data: rows.map(row => (typeof row.get === 'function' ? row.get({ plain: true }) : row))
        };
    }

    async getCategoryById(id) {
        const Category = await CategoryRepository.getCategoryById(id);
        // if (!Category) {
        //     throw new Error(" Category not found");
        // }
        return Category;
    }

    async createCategory(Data) {
        const requiredFields = ["name", "slug"];
        if (!requiredFields.every(field => Data[field])) {
            throw new Error("Semua field wajib diisi");
        }
        return await CategoryRepository.createCategory(Data);
    }

    async updateCategory(id, CategoryData) {
        const Category = await CategoryRepository.getCategoryById(id);
        if (!Category) {
            throw new Error(" Category not found");
        }
        const updated = await CategoryRepository.updateCategory(id, {
            ...CategoryData
        })
        return updated;
    }

    async deleteCategory(id) {
        const Category = await CategoryRepository.getCategoryById(id);
        if (!Category) {
            throw new Error(" Category not found");
        }
        return await CategoryRepository.deleteCategory(id);
    }
}

module.exports = new  categoryService();