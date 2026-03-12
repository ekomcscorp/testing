const GalleryRepository = require("../../repositories/galleries/gallery.repository");

class Gallery {
    async getAllGallery() {
        const gallery = await GalleryRepository.getAllGallery();
        return gallery || []; // jika null/undefined, tetap kembalikan array kosong
    }

    async getAllGalleryDatatables({ draw, start, length, search, order, columns }) {
        const searchValue = search?.value || "";

        const { count, rows } = await GalleryRepository.getPaginatedGallery({
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

    async getGalleryById(id) {
        const gallery = await GalleryRepository.getGalleryById(id);
        return gallery || []; // jika null/undefined, tetap kembalikan array kosong
    }

    async getGalleryByCategory(slug) {
        const gallery = await GalleryRepository.getGalleryByCategory(slug);
        if (gallery.length === 0) {
            throw new Error("No gallery found");
        }
        return gallery;
    }

    async createGallery(galleryData) {
        const requiredFields = ["title", "image_url", "description", "category_id"];
        if (!requiredFields.every(field => galleryData[field])) {
            throw new Error("Semua field wajib diisi");
        }
        return await GalleryRepository.createGallery(galleryData);
    }

    async updateGallery(id, galleryData) {
        const gallery = await GalleryRepository.getGalleryById(id);
        if (!gallery) {
            throw new Error("Gallery not found");
        }
        return await GalleryRepository.updateGallery(id, galleryData);
    }

    async deleteGallery(id) {
        const gallery = await GalleryRepository.getGalleryById(id);
        if (!gallery) {
            throw new Error("Gallery not found");
        }
        return await GalleryRepository.deleteGallery(id);
    }
}

module.exports = new Gallery();