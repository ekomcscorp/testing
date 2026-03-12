const GalleryCategoryRepository = require("../../repositories/galleries/galleryCategory.repository");

class GalleryCategory {
    async getAllGalleryCategory() {
        const galleryCategory = await GalleryCategoryRepository.getAllGalleryCategory();
        return galleryCategory || []; // jika null/undefined, tetap kembalikan array kosong
    }

    async getAllGalleryCategoryDatatables({ draw, start, length, search, order, columns }) {
        const searchValue = search?.value || "";

        const { count, rows } = await GalleryCategoryRepository.getPaginatedGalleryCategory({
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
            data: rows
        };
    }

    async getGalleryCategoryById(id) {
        const galleryCategory = await GalleryCategoryRepository.getGalleryCategoryById(id);
        // if (!galleryCategory) {
        //     throw new Error("Gallery Category not found");
        // }
        return galleryCategory || [];
    }

    async createGalleryCategory(galleryData) {
        const requiredFields = ["name", "slug"];
        if (!requiredFields.every(field => galleryData[field])) {
            throw new Error("Semua field wajib diisi");
        }
        return await GalleryCategoryRepository.createGalleryCategory(galleryData);
    }

    async updateGalleryCategory(id, galleryData) {
        const galleryCategory = await GalleryCategoryRepository.getGalleryCategoryById(id);
        if (!galleryCategory) {
            throw new Error("Gallery Category not found");
        }
        return await GalleryCategoryRepository.updateGalleryCategory(id, galleryData);
    }

    async deleteGalleryCategory(id) {
        const galleryCategory = await GalleryCategoryRepository.getGalleryCategoryById(id);
        if (!galleryCategory) {
            throw new Error("Gallery Category not found");
        }
        return await GalleryCategoryRepository.deleteGalleryCategory(id);
    }
}

module.exports = new GalleryCategory();