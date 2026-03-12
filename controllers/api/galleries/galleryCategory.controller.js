const galleryCategoryService = require("../../../services/galleries/galleryCategory.service");
const response = require("../../../utils/response");

class GalleryCategoryService {
  async getAllGalleryCategory(req, res) {
    try {
      const galleryCategory = await galleryCategoryService.getAllGalleryCategory();
      return response.success(res, "All gallery Category fetched", galleryCategory);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getAllGalleryCategoryDatatables(req, res) {

    try {
      const { akses } = res.locals;

        if (akses.view_level !== 'Y') {
          return res.status(403).json({ error: "Akses ditolak" });
        }
  
        const result = await galleryCategoryService.getAllGalleryCategoryDatatables(req.query);
  
        result.data = result.data.map(row => ({
          ...row.get({ plain: true }),
          akses: {
            edit: akses.edit_level === 'Y',
            delete: akses.delete_level === 'Y'
          }
        }));
  
        return response.datatables(res, result);
      } catch (error) {
        console.error("Error getAllGalleryCategoryDatatables:", error);
        return response.error(res, error.message);
    }
  }

  async getGalleryCategoryById(req, res) {
    try {
      const galleryCategory = await galleryCategoryService.getGalleryCategoryById(req.params.id);
      return response.success(res, "Gallery Category fetched", galleryCategory);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async createGalleryCategory(req, res) {
    try {
      const galleryCategory = await galleryCategoryService.createGalleryCategory(req.body);
      return response.created(res, "Gallery category created", galleryCategory);
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async updateGalleryCategory(req, res) {
    try {
      await galleryCategoryService.updateGalleryCategory(req.params.id, req.body);
      return response.success(res, "Gallery category updated successfully");
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async deleteGalleryCategory(req, res) {
    try {
      await galleryCategoryService.deleteGalleryCategory(req.params.id);
      return response.success(res, "Gallery category deleted successfully");
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }
}

module.exports = new GalleryCategoryService();